// ============================================
// Ticket controller
// ============================================

import Ticket from '../models/Ticket.js';
import Priority from '../models/Priority.js';
import Category from '../models/Category.js';
import Notification from '../models/Notification.js';
import { AppError } from '../middleware/errorHandler.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { createAuditLog } from '../services/audit.service.js';
import { classifyTicket } from '../services/ai.service.js';
import { calculateSlaDueDate } from '../services/sla.service.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service.js';
import { AUDIT_ENTITY_TYPES, AUDIT_ACTIONS, TICKET_STATUS, ROLES, PAGINATION, NOTIFICATION_TYPES } from '../config/constants.js';

// @desc    Create a ticket
// @route   POST /api/tickets
export const createTicket = asyncHandler(async (req, res) => {
  const { subject, description, category, priority, department } = req.body;

  const ticketData = {
    subject,
    description,
    requester: req.user._id,
    category,
    priority,
    department,
  };

  // If priority is set, calculate SLA due date
  if (priority) {
    const priorityDoc = await Priority.findById(priority);
    if (priorityDoc) {
      ticketData.slaDueAt = calculateSlaDueDate(new Date(), priorityDoc.slaResolutionMins);
    }
  }

  const ticket = await Ticket.create(ticketData);

  // AI classification (non-blocking)
  classifyTicket(subject, description).then(async (classification) => {
    if (classification) {
      ticket.aiClassification = classification;
      await ticket.save({ validateBeforeSave: false });
    }
  }).catch(() => {}); // swallow errors — AI is optional

  // Audit
  createAuditLog({
    entityType: AUDIT_ENTITY_TYPES.TICKET,
    entityId: ticket._id,
    action: AUDIT_ACTIONS.CREATED,
    performedBy: req.user._id,
    ipAddress: req.ip,
  });

  // Populate for response
  const populated = await Ticket.findById(ticket._id)
    .populate('requester', 'name email avatar')
    .populate('assignee', 'name email avatar')
    .populate('category', 'name')
    .populate('priority', 'label weight color');

  res.status(201).json({
    success: true,
    data: populated,
  });
});

// @desc    Get all tickets (with filtering, sorting, pagination)
// @route   GET /api/tickets
export const getTickets = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    status,
    priority,
    category,
    assignee,
    department,
    search,
    slaBreached,
    sort = '-createdAt',
    requester,
  } = req.query;

  const query = {};

  // Role-based access: employees see only their own tickets
  if (req.user.role === ROLES.EMPLOYEE) {
    query.requester = req.user._id;
  } else if (requester) {
    query.requester = requester;
  }

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (category) query.category = category;
  if (assignee) query.assignee = assignee;
  if (department) query.department = department;
  if (slaBreached === 'true') query.slaBreached = true;

  if (search) {
    query.$text = { $search: search };
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (pageNum - 1) * limitNum;

  // Build sort object
  const sortObj = {};
  const sortFields = sort.split(',');
  for (const field of sortFields) {
    if (field.startsWith('-')) {
      sortObj[field.substring(1)] = -1;
    } else {
      sortObj[field] = 1;
    }
  }

  const [tickets, total] = await Promise.all([
    Ticket.find(query)
      .populate('requester', 'name email avatar')
      .populate('assignee', 'name email avatar')
      .populate('category', 'name')
      .populate('priority', 'label weight color')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Ticket.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: tickets,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get a single ticket by ID
// @route   GET /api/tickets/:id
export const getTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('requester', 'name email avatar role department')
    .populate('assignee', 'name email avatar role')
    .populate('category', 'name description')
    .populate('priority', 'label weight color slaResponseMins slaResolutionMins')
    .populate('comments.author', 'name email avatar')
    .populate('internalNotes.author', 'name email avatar');

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  // Employees can only view their own tickets
  if (
    req.user.role === ROLES.EMPLOYEE &&
    ticket.requester._id.toString() !== req.user._id.toString()
  ) {
    throw new AppError('Not authorized to view this ticket', 403);
  }

  res.json({
    success: true,
    data: ticket,
  });
});

// @desc    Update a ticket
// @route   PUT /api/tickets/:id
export const updateTicket = asyncHandler(async (req, res) => {
  let ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  const before = ticket.toObject();
  const allowedFields = ['subject', 'description', 'category', 'priority', 'status', 'assignee', 'department'];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  // Handle status changes
  if (updates.status) {
    if (updates.status === TICKET_STATUS.RESOLVED && !ticket.resolvedAt) {
      updates.resolvedAt = new Date();
    }
    if (updates.status === TICKET_STATUS.CLOSED && !ticket.closedAt) {
      updates.closedAt = new Date();
    }
    if (updates.status === TICKET_STATUS.OPEN && before.status === TICKET_STATUS.RESOLVED) {
      updates.reopenCount = (ticket.reopenCount || 0) + 1;
      updates.resolvedAt = null;
    }
  }

  // If priority changed, recalculate SLA
  if (updates.priority && updates.priority !== before.priority?.toString()) {
    const priorityDoc = await Priority.findById(updates.priority);
    if (priorityDoc) {
      updates.slaDueAt = calculateSlaDueDate(ticket.createdAt, priorityDoc.slaResolutionMins);
    }
  }

  ticket = await Ticket.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  })
    .populate('requester', 'name email avatar')
    .populate('assignee', 'name email avatar')
    .populate('category', 'name')
    .populate('priority', 'label weight color');

  // Notifications
  if (updates.assignee && updates.assignee !== before.assignee?.toString()) {
    Notification.create({
      recipient: updates.assignee,
      type: NOTIFICATION_TYPES.TICKET_ASSIGNED,
      title: 'Ticket Assigned',
      message: `You have been assigned ticket ${ticket.ticketId}: ${ticket.subject}`,
      relatedEntity: { entityType: 'Ticket', entityId: ticket._id },
    }).catch(() => {});
  }

  if (updates.status && updates.status !== before.status) {
    const notifyUser = ticket.requester._id || ticket.requester;
    Notification.create({
      recipient: notifyUser,
      type: NOTIFICATION_TYPES.TICKET_STATUS_CHANGED,
      title: 'Ticket Status Updated',
      message: `Ticket ${ticket.ticketId} status changed to ${updates.status}`,
      relatedEntity: { entityType: 'Ticket', entityId: ticket._id },
    }).catch(() => {});
  }

  // Audit
  createAuditLog({
    entityType: AUDIT_ENTITY_TYPES.TICKET,
    entityId: ticket._id,
    action: updates.status ? AUDIT_ACTIONS.STATUS_CHANGED : AUDIT_ACTIONS.UPDATED,
    performedBy: req.user._id,
    changes: { before, after: ticket.toObject() },
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    data: ticket,
  });
});

// @desc    Delete a ticket
// @route   DELETE /api/tickets/:id
export const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  await ticket.deleteOne();

  createAuditLog({
    entityType: AUDIT_ENTITY_TYPES.TICKET,
    entityId: ticket._id,
    action: AUDIT_ACTIONS.DELETED,
    performedBy: req.user._id,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Ticket deleted',
  });
});

// @desc    Add a comment to a ticket
// @route   POST /api/tickets/:id/comments
export const addComment = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  ticket.comments.push({
    author: req.user._id,
    content: req.body.content,
  });
  await ticket.save();

  // Notify ticket requester (if commenter is not the requester)
  if (ticket.requester.toString() !== req.user._id.toString()) {
    Notification.create({
      recipient: ticket.requester,
      type: NOTIFICATION_TYPES.TICKET_COMMENTED,
      title: 'New Comment',
      message: `New comment on ticket ${ticket.ticketId}`,
      relatedEntity: { entityType: 'Ticket', entityId: ticket._id },
    }).catch(() => {});
  }

  createAuditLog({
    entityType: AUDIT_ENTITY_TYPES.TICKET,
    entityId: ticket._id,
    action: AUDIT_ACTIONS.COMMENT_ADDED,
    performedBy: req.user._id,
    ipAddress: req.ip,
  });

  const populated = await Ticket.findById(ticket._id)
    .populate('comments.author', 'name email avatar');

  res.status(201).json({
    success: true,
    data: populated.comments,
  });
});

// @desc    Add an internal note
// @route   POST /api/tickets/:id/notes
export const addInternalNote = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  ticket.internalNotes.push({
    author: req.user._id,
    content: req.body.content,
  });
  await ticket.save();

  createAuditLog({
    entityType: AUDIT_ENTITY_TYPES.TICKET,
    entityId: ticket._id,
    action: AUDIT_ACTIONS.NOTE_ADDED,
    performedBy: req.user._id,
    ipAddress: req.ip,
  });

  const populated = await Ticket.findById(ticket._id)
    .populate('internalNotes.author', 'name email avatar');

  res.status(201).json({
    success: true,
    data: populated.internalNotes,
  });
});

// @desc    Upload attachments to a ticket
// @route   POST /api/tickets/:id/attachments
export const uploadAttachments = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  if (!req.files || req.files.length === 0) {
    throw new AppError('No files uploaded', 400);
  }

  const uploaded = [];
  for (const file of req.files) {
    const result = await uploadToCloudinary(file.buffer, 'servicedesk-pro/tickets');
    uploaded.push({
      fileName: file.originalname,
      cloudinaryUrl: result.url,
      publicId: result.publicId,
      mimeType: file.mimetype,
      size: file.size,
    });
  }

  ticket.attachments.push(...uploaded);
  await ticket.save();

  createAuditLog({
    entityType: AUDIT_ENTITY_TYPES.TICKET,
    entityId: ticket._id,
    action: AUDIT_ACTIONS.ATTACHMENT_ADDED,
    performedBy: req.user._id,
    metadata: { fileCount: uploaded.length },
    ipAddress: req.ip,
  });

  res.status(201).json({
    success: true,
    data: ticket.attachments,
  });
});

// @desc    Delete an attachment from a ticket
// @route   DELETE /api/tickets/:id/attachments/:attachmentId
export const deleteAttachment = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  const attachment = ticket.attachments.id(req.params.attachmentId);
  if (!attachment) {
    throw new AppError('Attachment not found', 404);
  }

  // Delete from Cloudinary
  await deleteFromCloudinary(attachment.publicId);

  // Remove from document
  ticket.attachments.pull(req.params.attachmentId);
  await ticket.save();

  res.json({
    success: true,
    message: 'Attachment deleted',
  });
});

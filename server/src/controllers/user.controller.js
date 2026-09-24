// ============================================
// User controller (admin management)
// ============================================

import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { createAuditLog } from '../services/audit.service.js';
import { AUDIT_ENTITY_TYPES, AUDIT_ACTIONS, PAGINATION } from '../config/constants.js';

// @desc    Get all users
// @route   GET /api/users
export const getUsers = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    role,
    status,
    department,
    search,
    sort = '-createdAt',
  } = req.query;

  const query = {};

  if (role) query.role = role;
  if (status) query.status = status;
  if (department) query.department = department;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (pageNum - 1) * limitNum;

  const sortObj = {};
  const sortFields = sort.split(',');
  for (const field of sortFields) {
    if (field.startsWith('-')) {
      sortObj[field.substring(1)] = -1;
    } else {
      sortObj[field] = 1;
    }
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get a single user
// @route   GET /api/users/:id
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('organization');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: user,
  });
});

// @desc    Update a user (admin)
// @route   PUT /api/users/:id
export const updateUser = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'role', 'status', 'department', 'phone'];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const before = await User.findById(req.params.id).lean();
  if (!before) {
    throw new AppError('User not found', 404);
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  createAuditLog({
    entityType: AUDIT_ENTITY_TYPES.USER,
    entityId: user._id,
    action: AUDIT_ACTIONS.UPDATED,
    performedBy: req.user._id,
    changes: { before: updates, after: user.toObject() },
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    data: user,
  });
});

// @desc    Get list of technicians/agents (for assignment dropdowns)
// @route   GET /api/users/agents
export const getAgents = asyncHandler(async (_req, res) => {
  const agents = await User.find({
    role: { $in: ['admin', 'manager', 'technician'] },
    status: 'active',
  })
    .select('name email avatar role department')
    .sort('name')
    .lean();

  res.json({
    success: true,
    data: agents,
  });
});

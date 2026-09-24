// ============================================
// Asset controller
// ============================================

import Asset from '../models/Asset.js';
import Notification from '../models/Notification.js';
import { AppError } from '../middleware/errorHandler.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { createAuditLog } from '../services/audit.service.js';
import { AUDIT_ENTITY_TYPES, AUDIT_ACTIONS, ASSET_TRANSITIONS, NOTIFICATION_TYPES, PAGINATION } from '../config/constants.js';

// @desc    Create an asset
// @route   POST /api/assets
export const createAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.create(req.body);

  createAuditLog({
    entityType: AUDIT_ENTITY_TYPES.ASSET,
    entityId: asset._id,
    action: AUDIT_ACTIONS.CREATED,
    performedBy: req.user._id,
    ipAddress: req.ip,
  });

  const populated = await Asset.findById(asset._id)
    .populate('assignedTo', 'name email')
    .populate('vendor', 'name');

  res.status(201).json({
    success: true,
    data: populated,
  });
});

// @desc    Get all assets (filtered, sorted, paginated)
// @route   GET /api/assets
export const getAssets = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    type,
    lifecycleStatus,
    assignedTo,
    department,
    vendor,
    search,
    sort = '-createdAt',
  } = req.query;

  const query = {};

  if (type) query.type = type;
  if (lifecycleStatus) query.lifecycleStatus = lifecycleStatus;
  if (assignedTo) query.assignedTo = assignedTo;
  if (department) query.department = department;
  if (vendor) query.vendor = vendor;

  if (search) {
    query.$text = { $search: search };
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

  const [assets, total] = await Promise.all([
    Asset.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('vendor', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Asset.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: assets,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get a single asset by ID
// @route   GET /api/assets/:id
export const getAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id)
    .populate('assignedTo', 'name email avatar department')
    .populate('vendor', 'name email phone contactPerson')
    .populate('history.performedBy', 'name email');

  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  res.json({
    success: true,
    data: asset,
  });
});

// @desc    Update an asset
// @route   PUT /api/assets/:id
export const updateAsset = asyncHandler(async (req, res) => {
  let asset = await Asset.findById(req.params.id);
  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  const before = asset.toObject();

  asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('assignedTo', 'name email avatar')
    .populate('vendor', 'name');

  createAuditLog({
    entityType: AUDIT_ENTITY_TYPES.ASSET,
    entityId: asset._id,
    action: AUDIT_ACTIONS.UPDATED,
    performedBy: req.user._id,
    changes: { before, after: asset.toObject() },
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    data: asset,
  });
});

// @desc    Delete an asset
// @route   DELETE /api/assets/:id
export const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  await asset.deleteOne();

  createAuditLog({
    entityType: AUDIT_ENTITY_TYPES.ASSET,
    entityId: asset._id,
    action: AUDIT_ACTIONS.DELETED,
    performedBy: req.user._id,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Asset deleted',
  });
});

// @desc    Transition asset lifecycle
// @route   PUT /api/assets/:id/transition
export const transitionAsset = asyncHandler(async (req, res) => {
  const { toStatus, notes } = req.body;

  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  const currentStatus = asset.lifecycleStatus;
  const validTransitions = ASSET_TRANSITIONS[currentStatus] || [];

  if (!validTransitions.includes(toStatus)) {
    throw new AppError(
      `Cannot transition from '${currentStatus}' to '${toStatus}'. Valid transitions: ${validTransitions.join(', ') || 'none'}`,
      400
    );
  }

  const fromStatus = currentStatus;
  asset.lifecycleStatus = toStatus;
  asset.history.push({
    action: `${fromStatus} → ${toStatus}`,
    fromStatus,
    toStatus,
    performedBy: req.user._id,
    notes,
  });

  await asset.save();

  createAuditLog({
    entityType: AUDIT_ENTITY_TYPES.ASSET,
    entityId: asset._id,
    action: AUDIT_ACTIONS.LIFECYCLE_CHANGED,
    performedBy: req.user._id,
    changes: { before: { lifecycleStatus: fromStatus }, after: { lifecycleStatus: toStatus } },
    metadata: { notes },
    ipAddress: req.ip,
  });

  const populated = await Asset.findById(asset._id)
    .populate('assignedTo', 'name email avatar')
    .populate('vendor', 'name')
    .populate('history.performedBy', 'name email');

  res.json({
    success: true,
    data: populated,
  });
});

// @desc    Assign asset to user
// @route   PUT /api/assets/:id/assign
export const assignAsset = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  asset.assignedTo = userId || null;

  if (userId && asset.lifecycleStatus === 'procured') {
    asset.lifecycleStatus = 'assigned';
    asset.history.push({
      action: 'procured → assigned',
      fromStatus: 'procured',
      toStatus: 'assigned',
      performedBy: req.user._id,
      notes: `Assigned to user`,
    });
  }

  await asset.save();

  if (userId) {
    Notification.create({
      recipient: userId,
      type: NOTIFICATION_TYPES.ASSET_ASSIGNED,
      title: 'Asset Assigned',
      message: `Asset ${asset.assetTag} (${asset.name}) has been assigned to you`,
      relatedEntity: { entityType: 'Asset', entityId: asset._id },
    }).catch(() => {});
  }

  createAuditLog({
    entityType: AUDIT_ENTITY_TYPES.ASSET,
    entityId: asset._id,
    action: AUDIT_ACTIONS.ASSIGNED,
    performedBy: req.user._id,
    metadata: { assignedTo: userId },
    ipAddress: req.ip,
  });

  const populated = await Asset.findById(asset._id)
    .populate('assignedTo', 'name email avatar')
    .populate('vendor', 'name');

  res.json({
    success: true,
    data: populated,
  });
});

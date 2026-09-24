// ============================================
// SLA Policy controller
// ============================================

import SLAPolicy from '../models/SLAPolicy.js';
import { AppError } from '../middleware/errorHandler.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get all SLA policies
// @route   GET /api/sla-policies
export const getSLAPolicies = asyncHandler(async (_req, res) => {
  const policies = await SLAPolicy.find()
    .populate('priority', 'label weight color')
    .sort('-isActive createdAt')
    .lean();
  res.json({ success: true, data: policies });
});

// @desc    Create an SLA policy
// @route   POST /api/sla-policies
export const createSLAPolicy = asyncHandler(async (req, res) => {
  const policy = await SLAPolicy.create(req.body);
  const populated = await SLAPolicy.findById(policy._id).populate('priority', 'label weight color');
  res.status(201).json({ success: true, data: populated });
});

// @desc    Update an SLA policy
// @route   PUT /api/sla-policies/:id
export const updateSLAPolicy = asyncHandler(async (req, res) => {
  const policy = await SLAPolicy.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('priority', 'label weight color');

  if (!policy) throw new AppError('SLA policy not found', 404);
  res.json({ success: true, data: policy });
});

// @desc    Delete an SLA policy
// @route   DELETE /api/sla-policies/:id
export const deleteSLAPolicy = asyncHandler(async (req, res) => {
  const policy = await SLAPolicy.findById(req.params.id);
  if (!policy) throw new AppError('SLA policy not found', 404);
  await policy.deleteOne();
  res.json({ success: true, message: 'SLA policy deleted' });
});

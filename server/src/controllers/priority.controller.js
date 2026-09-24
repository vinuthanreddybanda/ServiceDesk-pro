// ============================================
// Priority controller
// ============================================

import Priority from '../models/Priority.js';
import { AppError } from '../middleware/errorHandler.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get all priorities
// @route   GET /api/priorities
export const getPriorities = asyncHandler(async (_req, res) => {
  const priorities = await Priority.find().sort('weight').lean();
  res.json({ success: true, data: priorities });
});

// @desc    Create a priority
// @route   POST /api/priorities
export const createPriority = asyncHandler(async (req, res) => {
  const priority = await Priority.create(req.body);
  res.status(201).json({ success: true, data: priority });
});

// @desc    Update a priority
// @route   PUT /api/priorities/:id
export const updatePriority = asyncHandler(async (req, res) => {
  const priority = await Priority.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!priority) throw new AppError('Priority not found', 404);
  res.json({ success: true, data: priority });
});

// @desc    Delete a priority
// @route   DELETE /api/priorities/:id
export const deletePriority = asyncHandler(async (req, res) => {
  const priority = await Priority.findById(req.params.id);
  if (!priority) throw new AppError('Priority not found', 404);
  await priority.deleteOne();
  res.json({ success: true, message: 'Priority deleted' });
});

// ============================================
// Category controller
// ============================================

import Category from '../models/Category.js';
import { AppError } from '../middleware/errorHandler.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get all categories (tree structure)
// @route   GET /api/categories
export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find()
    .populate('defaultPriority', 'label weight color')
    .sort('order name')
    .lean();

  res.json({ success: true, data: categories });
});

// @desc    Create a category
// @route   POST /api/categories
export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

// @desc    Update a category
// @route   PUT /api/categories/:id
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new AppError('Category not found', 404);
  res.json({ success: true, data: category });
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);

  // Check for child categories
  const children = await Category.countDocuments({ parentCategory: category._id });
  if (children > 0) {
    throw new AppError('Cannot delete a category that has sub-categories', 400);
  }

  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});

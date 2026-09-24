// ============================================
// Category routes
// ============================================

import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validateCategory } from '../validators/admin.validator.js';
import { validateIdParam } from '../validators/ticket.validator.js';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getCategories)
  .post(authorize('admin', 'manager'), validateCategory, createCategory);

router.route('/:id')
  .put(authorize('admin', 'manager'), validateIdParam, validateCategory, updateCategory)
  .delete(authorize('admin'), validateIdParam, deleteCategory);

export default router;

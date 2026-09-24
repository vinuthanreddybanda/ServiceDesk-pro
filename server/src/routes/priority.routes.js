// ============================================
// Priority routes
// ============================================

import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validatePriority } from '../validators/admin.validator.js';
import { validateIdParam } from '../validators/ticket.validator.js';
import { getPriorities, createPriority, updatePriority, deletePriority } from '../controllers/priority.controller.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getPriorities)
  .post(authorize('admin'), validatePriority, createPriority);

router.route('/:id')
  .put(authorize('admin'), validateIdParam, validatePriority, updatePriority)
  .delete(authorize('admin'), validateIdParam, deletePriority);

export default router;

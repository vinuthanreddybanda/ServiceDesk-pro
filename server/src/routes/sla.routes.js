// ============================================
// SLA Policy routes
// ============================================

import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validateSLAPolicy } from '../validators/admin.validator.js';
import { validateIdParam } from '../validators/ticket.validator.js';
import { getSLAPolicies, createSLAPolicy, updateSLAPolicy, deleteSLAPolicy } from '../controllers/sla.controller.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getSLAPolicies)
  .post(authorize('admin', 'manager'), validateSLAPolicy, createSLAPolicy);

router.route('/:id')
  .put(authorize('admin', 'manager'), validateIdParam, validateSLAPolicy, updateSLAPolicy)
  .delete(authorize('admin'), validateIdParam, deleteSLAPolicy);

export default router;

// ============================================
// User routes (admin)
// ============================================

import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validateUpdateUser } from '../validators/admin.validator.js';
import { validateIdParam } from '../validators/ticket.validator.js';
import { getUsers, getUser, updateUser, getAgents } from '../controllers/user.controller.js';

const router = Router();

router.use(protect);

// Agents list (for assignment dropdowns — accessible to all staff)
router.get('/agents', getAgents);

// Admin-only routes
router.get('/', authorize('admin', 'manager'), getUsers);
router.get('/:id', authorize('admin', 'manager'), validateIdParam, getUser);
router.put('/:id', authorize('admin'), validateUpdateUser, updateUser);

export default router;

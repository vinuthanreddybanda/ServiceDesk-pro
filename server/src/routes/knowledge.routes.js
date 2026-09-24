// ============================================
// Knowledge Base routes
// ============================================

import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validateKBArticle } from '../validators/admin.validator.js';
import { validateIdParam } from '../validators/ticket.validator.js';
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  markHelpful,
} from '../controllers/knowledge.controller.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getArticles)
  .post(authorize('admin', 'manager', 'technician'), validateKBArticle, createArticle);

router.route('/:id')
  .get(validateIdParam, getArticle)
  .put(authorize('admin', 'manager', 'technician'), validateIdParam, updateArticle)
  .delete(authorize('admin', 'manager'), validateIdParam, deleteArticle);

router.post('/:id/helpful', validateIdParam, markHelpful);

export default router;

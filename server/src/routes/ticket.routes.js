// ============================================
// Ticket routes
// ============================================

import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  validateCreateTicket,
  validateUpdateTicket,
  validateAddComment,
  validateAddNote,
  validateIdParam,
} from '../validators/ticket.validator.js';
import {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  addComment,
  addInternalNote,
  uploadAttachments,
  deleteAttachment,
} from '../controllers/ticket.controller.js';

const router = Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getTickets)
  .post(validateCreateTicket, createTicket);

router.route('/:id')
  .get(validateIdParam, getTicket)
  .put(validateUpdateTicket, updateTicket)
  .delete(validateIdParam, authorize('admin', 'manager'), deleteTicket);

// Comments
router.post('/:id/comments', validateAddComment, addComment);

// Internal notes (staff only)
router.post('/:id/notes', authorize('admin', 'manager', 'technician'), validateAddNote, addInternalNote);

// Attachments
router.post('/:id/attachments', upload.array('files', 5), uploadAttachments);
router.delete('/:id/attachments/:attachmentId', deleteAttachment);

export default router;

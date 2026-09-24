// ============================================
// Ticket validators (express-validator)
// ============================================

import { body, param } from 'express-validator';
import { handleValidation } from './handleValidation.js';

export const validateCreateTicket = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 200 })
    .withMessage('Subject must not exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('priority')
    .optional()
    .isMongoId()
    .withMessage('Invalid priority ID'),
  body('department')
    .optional()
    .trim(),
  handleValidation,
];

export const validateUpdateTicket = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ticket ID'),
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subject must not exceed 200 characters'),
  body('description')
    .optional()
    .trim(),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('priority')
    .optional()
    .isMongoId()
    .withMessage('Invalid priority ID'),
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'pending', 'resolved', 'closed', 'escalated'])
    .withMessage('Invalid status value'),
  body('assignee')
    .optional({ values: 'null' })
    .isMongoId()
    .withMessage('Invalid assignee ID'),
  body('department')
    .optional()
    .trim(),
  handleValidation,
];

export const validateAddComment = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ticket ID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required'),
  handleValidation,
];

export const validateAddNote = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ticket ID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Note content is required'),
  handleValidation,
];

export const validateIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidation,
];

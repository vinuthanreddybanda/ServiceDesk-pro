// ============================================
// Admin entity validators (categories, priorities, SLA, etc.)
// ============================================

import { body, param } from 'express-validator';
import { handleValidation } from './handleValidation.js';

// --- Category ---
export const validateCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }),
  body('parentCategory')
    .optional({ values: 'null' })
    .isMongoId()
    .withMessage('Invalid parent category ID'),
  body('defaultPriority')
    .optional()
    .isMongoId()
    .withMessage('Invalid priority ID'),
  body('isActive')
    .optional()
    .isBoolean(),
  handleValidation,
];

// --- Priority ---
export const validatePriority = [
  body('label')
    .trim()
    .notEmpty()
    .withMessage('Priority label is required'),
  body('weight')
    .isInt({ min: 1, max: 4 })
    .withMessage('Weight must be between 1 and 4'),
  body('color')
    .trim()
    .notEmpty()
    .withMessage('Color is required'),
  body('slaResponseMins')
    .isInt({ min: 1 })
    .withMessage('SLA response time must be at least 1 minute'),
  body('slaResolutionMins')
    .isInt({ min: 1 })
    .withMessage('SLA resolution time must be at least 1 minute'),
  handleValidation,
];

// --- SLA Policy ---
export const validateSLAPolicy = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('SLA policy name is required'),
  body('priority')
    .isMongoId()
    .withMessage('Valid priority reference is required'),
  body('responseTime')
    .isInt({ min: 1 })
    .withMessage('Response time must be at least 1 minute'),
  body('resolutionTime')
    .isInt({ min: 1 })
    .withMessage('Resolution time must be at least 1 minute'),
  body('isActive')
    .optional()
    .isBoolean(),
  handleValidation,
];

// --- Knowledge Article ---
export const validateKBArticle = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 300 }),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('tags')
    .optional()
    .isArray(),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),
  handleValidation,
];

// --- User management (admin) ---
export const validateUpdateUser = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'technician', 'employee', 'asset_manager'])
    .withMessage('Invalid role'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Invalid status'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('department')
    .optional()
    .trim(),
  handleValidation,
];

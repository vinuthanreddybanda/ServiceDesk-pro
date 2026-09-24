// ============================================
// Asset validators (express-validator)
// ============================================

import { body, param } from 'express-validator';
import { handleValidation } from './handleValidation.js';

export const validateCreateAsset = [
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Asset type is required')
    .isIn([
      'laptop', 'desktop', 'monitor', 'keyboard', 'mouse', 'printer',
      'phone', 'tablet', 'server', 'network_device', 'software_license', 'other',
    ])
    .withMessage('Invalid asset type'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Asset name is required')
    .isLength({ max: 200 })
    .withMessage('Name must not exceed 200 characters'),
  body('manufacturer')
    .optional()
    .trim(),
  body('model')
    .optional()
    .trim(),
  body('serialNumber')
    .optional()
    .trim(),
  body('vendor')
    .optional()
    .isMongoId()
    .withMessage('Invalid vendor ID'),
  body('purchaseDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid purchase date'),
  body('purchaseCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase cost must be a positive number'),
  body('warrantyExpiry')
    .optional()
    .isISO8601()
    .withMessage('Invalid warranty expiry date'),
  body('department')
    .optional()
    .trim(),
  body('location')
    .optional()
    .trim(),
  handleValidation,
];

export const validateUpdateAsset = [
  param('id')
    .isMongoId()
    .withMessage('Invalid asset ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Name must not exceed 200 characters'),
  body('type')
    .optional()
    .isIn([
      'laptop', 'desktop', 'monitor', 'keyboard', 'mouse', 'printer',
      'phone', 'tablet', 'server', 'network_device', 'software_license', 'other',
    ])
    .withMessage('Invalid asset type'),
  body('lifecycleStatus')
    .optional()
    .isIn(['procured', 'assigned', 'in_repair', 'replaced', 'retired'])
    .withMessage('Invalid lifecycle status'),
  body('assignedTo')
    .optional({ values: 'null' })
    .isMongoId()
    .withMessage('Invalid user ID'),
  handleValidation,
];

export const validateAssetTransition = [
  param('id')
    .isMongoId()
    .withMessage('Invalid asset ID'),
  body('toStatus')
    .trim()
    .notEmpty()
    .withMessage('Target status is required')
    .isIn(['procured', 'assigned', 'in_repair', 'replaced', 'retired'])
    .withMessage('Invalid lifecycle status'),
  body('notes')
    .optional()
    .trim(),
  handleValidation,
];

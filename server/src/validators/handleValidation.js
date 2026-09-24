// ============================================
// Shared validation result handler
// ============================================

import { validationResult } from 'express-validator';

/**
 * Middleware that checks express-validator results and returns 400 if invalid.
 */
export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
      errors: errors.array(),
    });
  }
  next();
};

// ============================================
// Auth middleware — protect routes + role-based access
// ============================================

import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { AppError } from './errorHandler.js';

/**
 * Protect a route: verify the JWT access token from the Authorization header,
 * attach req.user with the full user document (minus password & tokens).
 */
export const protect = async (req, _res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authorized — no token provided', 401);
    }

    // Verify
    const decoded = verifyAccessToken(token);

    // Fetch user (excluding passwordHash & tokens, but keeping role/status)
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError('User belonging to this token no longer exists', 401);
    }

    if (user.status !== 'active') {
      throw new AppError('Account is inactive or suspended', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Authorize specific roles.
 * Usage: authorize('admin', 'manager')
 */
export const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`Role '${req.user.role}' is not authorized for this action`, 403)
      );
    }
    next();
  };
};

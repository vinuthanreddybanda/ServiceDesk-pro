// ============================================
// JWT token helpers
// ============================================

import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Generate a short-lived access token.
 * Payload should contain { id, role }.
 */
export const generateAccessToken = (payload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRY });

/**
 * Generate a long-lived refresh token.
 */
export const generateRefreshToken = (payload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRY });

/**
 * Verify an access token. Returns decoded payload or throws.
 */
export const verifyAccessToken = (token) =>
  jwt.verify(token, env.JWT_SECRET);

/**
 * Verify a refresh token. Returns decoded payload or throws.
 */
export const verifyRefreshToken = (token) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET);

/**
 * Generate both tokens for a user, returning { accessToken, refreshToken }.
 */
export const generateTokenPair = (user) => {
  const payload = { id: user._id, role: user.role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

// ============================================
// Auth controller
// ============================================

import crypto from 'crypto';
import User from '../models/User.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { createAuditLog } from '../services/audit.service.js';
import { AUDIT_ENTITY_TYPES, AUDIT_ACTIONS } from '../config/constants.js';

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, department, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('A user with this email already exists', 409);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    passwordHash: password, // pre-save hook will hash it
    department,
    phone,
  });

  // Generate tokens
  const tokens = generateTokenPair(user);

  // Store refresh token
  user.refreshToken = tokens.refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Audit
  createAuditLog({
    entityType: AUDIT_ENTITY_TYPES.USER,
    entityId: user._id,
    action: AUDIT_ACTIONS.CREATED,
    performedBy: user._id,
    ipAddress: req.ip,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
      },
      ...tokens,
    },
  });
});

// @desc    Login
// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include passwordHash
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.status !== 'active') {
    throw new AppError('Account is inactive or suspended', 403);
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate tokens
  const tokens = generateTokenPair(user);

  // Update user
  user.refreshToken = tokens.refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Audit
  createAuditLog({
    entityType: AUDIT_ENTITY_TYPES.USER,
    entityId: user._id,
    action: AUDIT_ACTIONS.LOGIN,
    performedBy: user._id,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
      },
      ...tokens,
    },
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  // Verify refresh token
  const decoded = verifyRefreshToken(token);

  // Find user with matching refresh token
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Generate new token pair
  const tokens = generateTokenPair(user);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: tokens,
  });
});

// @desc    Logout
// @route   POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  // Clear refresh token
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

  createAuditLog({
    entityType: AUDIT_ENTITY_TYPES.USER,
    entityId: req.user._id,
    action: AUDIT_ACTIONS.LOGOUT,
    performedBy: req.user._id,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('organization');

  res.json({
    success: true,
    data: user,
  });
});

// @desc    Update own profile
// @route   PUT /api/auth/me
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'avatar', 'department'];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: user,
  });
});

// @desc    Change own password
// @route   PUT /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+passwordHash');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.passwordHash = newPassword;
  await user.save();

  // Regenerate tokens
  const tokens = generateTokenPair(user);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: 'Password changed successfully',
    data: tokens,
  });
});

// @desc    Forgot password — generate reset token
// @route   POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    // Don't reveal whether user exists
    return res.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent',
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save({ validateBeforeSave: false });

  // In production, you'd send an email here.
  // For development, log the token.
  console.log(`[AUTH] Password reset token for ${user.email}: ${resetToken}`);

  res.json({
    success: true,
    message: 'If an account with that email exists, a reset link has been sent',
    // Include token in dev mode for testing
    ...(process.env.NODE_ENV === 'development' && { resetToken }),
  });
});

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpiry: { $gt: Date.now() },
  }).select('+resetToken +resetTokenExpiry');

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  user.passwordHash = password;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  createAuditLog({
    entityType: AUDIT_ENTITY_TYPES.USER,
    entityId: user._id,
    action: AUDIT_ACTIONS.PASSWORD_RESET,
    performedBy: user._id,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Password reset successful. You can now login.',
  });
});

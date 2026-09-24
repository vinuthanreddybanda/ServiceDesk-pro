// ============================================
// Asset routes
// ============================================

import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  validateCreateAsset,
  validateUpdateAsset,
  validateAssetTransition,
} from '../validators/asset.validator.js';
import { validateIdParam } from '../validators/ticket.validator.js';
import {
  createAsset,
  getAssets,
  getAsset,
  updateAsset,
  deleteAsset,
  transitionAsset,
  assignAsset,
} from '../controllers/asset.controller.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getAssets)
  .post(authorize('admin', 'manager', 'asset_manager'), validateCreateAsset, createAsset);

router.route('/:id')
  .get(validateIdParam, getAsset)
  .put(authorize('admin', 'manager', 'asset_manager'), validateUpdateAsset, updateAsset)
  .delete(authorize('admin'), validateIdParam, deleteAsset);

// Lifecycle transition
router.put('/:id/transition', authorize('admin', 'manager', 'asset_manager'), validateAssetTransition, transitionAsset);

// Assignment
router.put('/:id/assign', authorize('admin', 'manager', 'asset_manager'), assignAsset);

export default router;

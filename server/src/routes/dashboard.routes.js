// ============================================
// Dashboard routes
// ============================================

import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getDashboard, getAssetBreakdown } from '../controllers/dashboard.controller.js';

const router = Router();

router.use(protect);
router.use(authorize('admin', 'manager', 'technician', 'asset_manager'));

router.get('/', getDashboard);
router.get('/assets', getAssetBreakdown);

export default router;

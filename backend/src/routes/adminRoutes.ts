import { Router } from 'express';
import {
  getDashboardStats,
  getAdminAnalytics,
  getAdminUsers,
  toggleUserStatus,
  deleteUser,
  getAdminReviews,
  moderateReview,
} from '../controllers/adminController';
import { getRightsAuditLogs } from '../controllers/movieController';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleCheck';

const router = Router();

// Protect all admin routes
router.use(requireAuth, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAdminAnalytics);
router.get('/users', getAdminUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/reviews', getAdminReviews);
router.put('/reviews/:id/moderate', moderateReview);
router.get('/rights-audit', getRightsAuditLogs);

export default router;

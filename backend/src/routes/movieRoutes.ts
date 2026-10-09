import { Router } from 'express';
import {
  getMovies,
  getFeaturedMovies,
  getHomepageSections,
  getMovieByIdOrSlug,
  getRelatedMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  updateWorkflowStatus,
  getRightsAuditLogs,
} from '../controllers/movieController';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleCheck';

const router = Router();

router.get('/', optionalAuth, getMovies);
router.get('/featured', getFeaturedMovies);
router.get('/sections', getHomepageSections);
router.get('/rights-audit', requireAuth, requireAdmin, getRightsAuditLogs);
router.get('/:idOrSlug', optionalAuth, getMovieByIdOrSlug);
router.get('/:id/related', getRelatedMovies);

// Admin-only endpoints
router.post('/', requireAuth, requireAdmin, createMovie);
router.put('/:id', requireAuth, requireAdmin, updateMovie);
router.put('/:id/workflow', requireAuth, requireAdmin, updateWorkflowStatus);
router.delete('/:id', requireAuth, requireAdmin, deleteMovie);

export default router;

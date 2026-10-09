import { Router } from 'express';
import {
  getWatchHistory,
  getContinueWatching,
  updateWatchProgress,
  clearWatchHistory,
} from '../controllers/historyController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getWatchHistory);
router.get('/continue-watching', getContinueWatching);
router.post('/', updateWatchProgress);
router.put('/:movieId', updateWatchProgress);
router.delete('/', clearWatchHistory);

export default router;

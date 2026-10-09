import { Router } from 'express';
import {
  getMovieReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
} from '../controllers/reviewController';
import { requireAuth } from '../middleware/auth';

const router = Router({ mergeParams: true });

// Specific movie reviews
router.get('/movies/:movieId/reviews', getMovieReviews);
router.post('/movies/:movieId/reviews', requireAuth, createReview);

// General review operations
router.get('/my', requireAuth, getUserReviews);
router.put('/:id', requireAuth, updateReview);
router.delete('/:id', requireAuth, deleteReview);

export default router;

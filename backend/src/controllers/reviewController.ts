import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';

/**
 * Recomputes average rating and ratingsCount for a movie
 */
async function updateMovieRatingAggregates(movieId: string): Promise<void> {
  const ratings = await prisma.rating.findMany({
    where: { movieId },
    select: { score: true },
  });

  if (ratings.length === 0) {
    await prisma.movie.update({
      where: { id: movieId },
      data: { rating: 0, ratingsCount: 0 },
    });
    return;
  }

  const sum = ratings.reduce((acc, r) => acc + r.score, 0);
  const avg = Math.round((sum / ratings.length) * 10) / 10;

  await prisma.movie.update({
    where: { id: movieId },
    data: { rating: avg, ratingsCount: ratings.length },
  });
}

export const getMovieReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { movieId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const [total, reviews] = await Promise.all([
      prisma.review.count({
        where: { movieId, isApproved: true },
      }),
      prisma.review.findMany({
        where: { movieId, isApproved: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    sendSuccess(res, 200, reviews, undefined, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { movieId } = req.params;
    const { rating, content } = req.body;

    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      sendError(res, 400, 'Rating must be an integer between 1 and 5');
      return;
    }

    if (!content || content.trim().length < 5) {
      sendError(res, 400, 'Review content must be at least 5 characters');
      return;
    }

    // Check duplicate
    const existing = await prisma.review.findUnique({
      where: {
        userId_movieId: {
          userId: req.user.userId,
          movieId,
        },
      },
    });

    if (existing) {
      sendError(res, 409, 'You have already reviewed this movie. You can edit your existing review.');
      return;
    }

    // Also upsert user rating
    await prisma.rating.upsert({
      where: {
        userId_movieId: {
          userId: req.user.userId,
          movieId,
        },
      },
      update: { score: numericRating },
      create: {
        userId: req.user.userId,
        movieId,
        score: numericRating,
      },
    });

    const review = await prisma.review.create({
      data: {
        userId: req.user.userId,
        movieId,
        rating: numericRating,
        content: content.trim(),
        isApproved: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update aggregates
    await updateMovieRatingAggregates(movieId);

    sendSuccess(res, 201, review, 'Review submitted successfully');
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { id } = req.params;
    const { rating, content } = req.body;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      sendError(res, 404, 'Review not found');
      return;
    }

    // Must be author or admin
    if (review.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      sendError(res, 403, 'You do not have permission to edit this review');
      return;
    }

    let numericRating = review.rating;
    if (rating !== undefined) {
      numericRating = parseInt(rating, 10);
      if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        sendError(res, 400, 'Rating must be between 1 and 5');
        return;
      }
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        rating: numericRating,
        ...(content && { content: content.trim() }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update rating entry
    await prisma.rating.upsert({
      where: {
        userId_movieId: {
          userId: review.userId,
          movieId: review.movieId,
        },
      },
      update: { score: numericRating },
      create: {
        userId: review.userId,
        movieId: review.movieId,
        score: numericRating,
      },
    });

    await updateMovieRatingAggregates(review.movieId);

    sendSuccess(res, 200, updated, 'Review updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      sendError(res, 404, 'Review not found');
      return;
    }

    // Must be author or admin
    if (review.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      sendError(res, 403, 'You do not have permission to delete this review');
      return;
    }

    await prisma.review.delete({ where: { id } });

    // Optionally delete rating as well
    await prisma.rating.deleteMany({
      where: {
        userId: review.userId,
        movieId: review.movieId,
      },
    });

    await updateMovieRatingAggregates(review.movieId);

    sendSuccess(res, 200, null, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getUserReviews = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const reviews = await prisma.review.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            slug: true,
            posterUrl: true,
            releaseYear: true,
          },
        },
      },
    });

    sendSuccess(res, 200, reviews);
  } catch (error) {
    next(error);
  }
};

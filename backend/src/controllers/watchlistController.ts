import { Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { LicenseValidator } from '../services/licenseValidator';

export const getWatchlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const watchlist = await prisma.watchlist.findMany({
      where: { userId: req.user.userId },
      orderBy: { addedAt: 'desc' },
      include: {
        movie: {
          include: {
            genres: {
              include: {
                genre: true,
              },
            },
          },
        },
      },
    });

    const items = watchlist.map((w) => ({
      id: w.id,
      addedAt: w.addedAt,
      movie: LicenseValidator.sanitizePublicMovie(w.movie),
    }));

    sendSuccess(res, 200, items);
  } catch (error) {
    next(error);
  }
};

export const addToWatchlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { movieId } = req.body;
    if (!movieId) {
      sendError(res, 400, 'Movie ID is required');
      return;
    }

    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      sendError(res, 404, 'Movie not found');
      return;
    }

    // Check duplicate
    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_movieId: {
          userId: req.user.userId,
          movieId,
        },
      },
    });

    if (existing) {
      sendSuccess(res, 200, existing, 'Movie already in watchlist');
      return;
    }

    const entry = await prisma.watchlist.create({
      data: {
        userId: req.user.userId,
        movieId,
      },
      include: {
        movie: true,
      },
    });

    sendSuccess(res, 201, entry, 'Movie added to watchlist');
  } catch (error) {
    next(error);
  }
};

export const removeFromWatchlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { movieId } = req.params;

    await prisma.watchlist.deleteMany({
      where: {
        userId: req.user.userId,
        movieId,
      },
    });

    sendSuccess(res, 200, null, 'Movie removed from watchlist');
  } catch (error) {
    next(error);
  }
};

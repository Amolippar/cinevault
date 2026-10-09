import { Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { LicenseValidator } from '../services/licenseValidator';

export const getWatchHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const history = await prisma.watchHistory.findMany({
      where: { userId: req.user.userId },
      orderBy: { lastWatchedAt: 'desc' },
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

    const items = history.map((h) => ({
      id: h.id,
      progressSeconds: h.progressSeconds,
      durationSeconds: h.durationSeconds,
      completionPercentage: h.completionPercentage,
      lastWatchedAt: h.lastWatchedAt,
      movie: LicenseValidator.sanitizePublicMovie(h.movie),
    }));

    sendSuccess(res, 200, items);
  } catch (error) {
    next(error);
  }
};

export const getContinueWatching = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    // Only movies that are partially watched (e.g. between 2% and 95% complete)
    const history = await prisma.watchHistory.findMany({
      where: {
        userId: req.user.userId,
        completionPercentage: {
          gt: 2.0,
          lt: 95.0,
        },
      },
      take: 8,
      orderBy: { lastWatchedAt: 'desc' },
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

    const items = history.map((h) => ({
      id: h.id,
      progressSeconds: h.progressSeconds,
      durationSeconds: h.durationSeconds,
      completionPercentage: h.completionPercentage,
      lastWatchedAt: h.lastWatchedAt,
      movie: LicenseValidator.sanitizePublicMovie(h.movie),
    }));

    sendSuccess(res, 200, items);
  } catch (error) {
    next(error);
  }
};

export const updateWatchProgress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { movieId, progressSeconds, durationSeconds } = req.body;

    if (!movieId) {
      sendError(res, 400, 'Movie ID is required');
      return;
    }

    const prog = Math.max(0, parseInt(progressSeconds || '0', 10));
    const dur = Math.max(1, parseInt(durationSeconds || '1', 10));
    const completionPercentage = Math.min(100.0, Math.round((prog / dur) * 10000) / 100);

    const history = await prisma.watchHistory.upsert({
      where: {
        userId_movieId: {
          userId: req.user.userId,
          movieId,
        },
      },
      update: {
        progressSeconds: prog,
        durationSeconds: dur,
        completionPercentage,
        lastWatchedAt: new Date(),
      },
      create: {
        userId: req.user.userId,
        movieId,
        progressSeconds: prog,
        durationSeconds: dur,
        completionPercentage,
        lastWatchedAt: new Date(),
      },
    });

    sendSuccess(res, 200, history, 'Watch progress synced');
  } catch (error) {
    next(error);
  }
};

export const clearWatchHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    await prisma.watchHistory.deleteMany({
      where: { userId: req.user.userId },
    });

    sendSuccess(res, 200, null, 'Watch history cleared');
  } catch (error) {
    next(error);
  }
};

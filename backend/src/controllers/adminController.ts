import { Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalMovies,
      totalReviews,
      totalWatchSessions,
      newUsersLastWeek,
      dauCount,
      mostWatchedMovies,
      genresWithCount,
      recentActions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.movie.count(),
      prisma.review.count(),
      prisma.watchHistory.count(),
      prisma.user.count({
        where: { createdAt: { gte: oneWeekAgo } },
      }),
      // DAU: active watch sessions or logins in past 24 hours
      prisma.watchHistory.count({
        where: { lastWatchedAt: { gte: oneDayAgo } },
      }),
      prisma.movie.findMany({
        take: 5,
        orderBy: { viewCount: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          viewCount: true,
          rating: true,
          contentRightsStatus: true,
          posterUrl: true,
        },
      }),
      prisma.genre.findMany({
        take: 6,
        select: {
          id: true,
          name: true,
          _count: {
            select: { movies: true },
          },
        },
      }),
      prisma.adminAction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const stats = {
      totalUsers,
      totalMovies,
      totalReviews,
      totalWatchSessions,
      newUsersLastWeek,
      dailyActiveUsers: dauCount,
      mostWatchedMovies,
      popularGenres: genresWithCount.map((g) => ({
        id: g.id,
        name: g.name,
        movieCount: g._count.movies,
      })),
      recentActions,
    };

    sendSuccess(res, 200, stats);
  } catch (error) {
    next(error);
  }
};

export const getAdminAnalytics = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Analytics breakdown: content rights distribution
    const [publicDomainCount, ownedCount, licensedCount, externalCount, trailerOnlyCount, unverifiedCount] = await Promise.all([
      prisma.movie.count({ where: { contentRightsStatus: 'PUBLIC_DOMAIN' } }),
      prisma.movie.count({ where: { contentRightsStatus: 'OWNED_CONTENT' } }),
      prisma.movie.count({ where: { contentRightsStatus: 'LICENSED' } }),
      prisma.movie.count({ where: { contentRightsStatus: 'AUTHORIZED_PROVIDER' } }),
      prisma.movie.count({ where: { contentRightsStatus: 'TRAILER_ONLY' } }),
      prisma.movie.count({ where: { contentRightsStatus: 'UNVERIFIED' } }),
    ]);

    // Average watch session completion
    const watchSessions = await prisma.watchHistory.findMany({
      select: { completionPercentage: true },
      take: 100,
    });

    const avgCompletion =
      watchSessions.length > 0
        ? Math.round(
            watchSessions.reduce((acc, s) => acc + s.completionPercentage, 0) / watchSessions.length
          )
        : 0;

    sendSuccess(res, 200, {
      licenseDistribution: [
        { label: 'Public Domain', count: publicDomainCount, color: '#10b981' },
        { label: 'Owned Content', count: ownedCount, color: '#06b6d4' },
        { label: 'Licensed', count: licensedCount, color: '#3b82f6' },
        { label: 'Authorized Provider', count: externalCount, color: '#f59e0b' },
        { label: 'Trailer Only', count: trailerOnlyCount, color: '#8b5cf6' },
        { label: 'Unverified', count: unverifiedCount, color: '#f43f5e' },
      ],
      avgCompletionPercentage: avgCompletion,
      sampleActivityDays: [
        { date: 'Day 1', views: 420, newUsers: 14 },
        { date: 'Day 2', views: 560, newUsers: 22 },
        { date: 'Day 3', views: 780, newUsers: 31 },
        { date: 'Day 4', views: 920, newUsers: 40 },
        { date: 'Day 5', views: 1100, newUsers: 38 },
        { date: 'Day 6', views: 1450, newUsers: 52 },
        { date: 'Day 7', views: 1820, newUsers: 64 },
      ],
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    const where: any = {};
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim() } },
        { email: { contains: search.trim() } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              reviews: true,
              watchlist: true,
              watchHistory: true,
            },
          },
        },
      }),
    ]);

    sendSuccess(res, 200, users, undefined, {
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

export const toggleUserStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    if (user.role === 'ADMIN' && req.user?.userId === user.id) {
      sendError(res, 400, 'Administrators cannot deactivate their own account.');
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (req.user) {
      await prisma.adminAction.create({
        data: {
          adminId: req.user.userId,
          actionType: updated.isActive ? 'ACTIVATE_USER' : 'DISABLE_USER',
          targetType: 'User',
          targetId: id,
          details: `${updated.isActive ? 'Activated' : 'Disabled'} user: ${updated.email}`,
        },
      });
    }

    sendSuccess(res, 200, updated, `User account ${updated.isActive ? 'activated' : 'disabled'}`);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user?.userId === id) {
      sendError(res, 400, 'Administrators cannot delete their own account.');
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    await prisma.user.delete({ where: { id } });

    if (req.user) {
      await prisma.adminAction.create({
        data: {
          adminId: req.user.userId,
          actionType: 'DELETE_USER',
          targetType: 'User',
          targetId: id,
          details: `Deleted user: ${user.email}`,
        },
      });
    }

    sendSuccess(res, 200, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getAdminReviews = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const [total, reviews] = await Promise.all([
      prisma.review.count(),
      prisma.review.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          movie: {
            select: { id: true, title: true, posterUrl: true },
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

export const moderateReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { isApproved, isFlagged, flagReason } = req.body;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      sendError(res, 404, 'Review not found');
      return;
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        ...(isApproved !== undefined && { isApproved: Boolean(isApproved) }),
        ...(isFlagged !== undefined && { isFlagged: Boolean(isFlagged) }),
        ...(flagReason !== undefined && { flagReason }),
      },
      include: {
        user: { select: { name: true, email: true } },
        movie: { select: { title: true } },
      },
    });

    if (req.user) {
      await prisma.adminAction.create({
        data: {
          adminId: req.user.userId,
          actionType: 'MODERATE_REVIEW',
          targetType: 'Review',
          targetId: id,
          details: `Review moderation for movie: ${updated.movie.title}`,
        },
      });
    }

    sendSuccess(res, 200, updated, 'Review moderated successfully');
  } catch (error) {
    next(error);
  }
};

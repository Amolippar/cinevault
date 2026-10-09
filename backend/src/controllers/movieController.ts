import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../types';
import { LicenseValidator } from '../services/licenseValidator';
import { createSlug } from '../utils/slugify';

/**
 * Automatically checks and updates expired published movies to UNPUBLISHED
 */
async function autoUnpublishExpiredMovies(): Promise<void> {
  try {
    const expiredMovies = await prisma.movie.findMany({
      where: {
        publicationStatus: 'PUBLISHED',
        licenseEndDate: {
          lt: new Date(),
        },
      },
      select: { id: true, title: true, contentRightsStatus: true },
    });

    for (const exp of expiredMovies) {
      await prisma.movie.update({
        where: { id: exp.id },
        data: { publicationStatus: 'UNPUBLISHED' },
      });

      // Log system auto-unpublish action
      // Find system admin if available
      const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (admin) {
        await prisma.rightsAuditLog.create({
          data: {
            adminId: admin.id,
            movieId: exp.id,
            action: 'AUTO_EXPIRED_UNPUBLISHED',
            rightsStatus: exp.contentRightsStatus as any,
            publicationStatus: 'UNPUBLISHED',
            reason: 'Distribution license expired (licenseEndDate < current date). Content automatically set to UNPUBLISHED.',
          },
        });
      }
    }
  } catch (err) {
    console.error('Error during auto-unpublish check', err);
  }
}

export const getMovies = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Run auto-expiration check
    await autoUnpublishExpiredMovies();

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const { genre, year, rightsStatus, licenseStatus, minRating, sort, search, publicationStatus } = req.query;

    const where: any = {};

    // For non-admin or public requests, only show PUBLISHED movies unless admin requested otherwise
    const isAdmin = req.user?.role === 'ADMIN';
    if (!isAdmin) {
      where.publicationStatus = 'PUBLISHED';
    } else if (publicationStatus && typeof publicationStatus === 'string') {
      where.publicationStatus = publicationStatus;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { director: { contains: search } },
      ];
    }

    if (genre && typeof genre === 'string') {
      where.genres = {
        some: {
          genre: {
            slug: genre,
          },
        },
      };
    }

    if (year) {
      where.releaseYear = parseInt(year as string, 10);
    }

    const filterStatus = (rightsStatus || licenseStatus) as string;
    if (filterStatus) {
      where.contentRightsStatus = filterStatus;
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating as string) };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'trending') orderBy = [{ isTrending: 'desc' }, { viewCount: 'desc' }];
    else if (sort === 'top-rated') orderBy = { rating: 'desc' };
    else if (sort === 'newest') orderBy = { releaseYear: 'desc' };
    else if (sort === 'title') orderBy = { title: 'asc' };

    const [total, movies] = await Promise.all([
      prisma.movie.count({ where }),
      prisma.movie.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
        },
      }),
    ]);

    const sanitizedMovies = movies.map((m) => LicenseValidator.sanitizePublicMovie(m));

    sendSuccess(res, 200, sanitizedMovies, undefined, {
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

export const getFeaturedMovies = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const featured = await prisma.movie.findMany({
      where: {
        isFeatured: true,
        publicationStatus: 'PUBLISHED',
      },
      take: 6,
      orderBy: { rating: 'desc' },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    const sanitized = featured.map((m) => LicenseValidator.sanitizePublicMovie(m));
    sendSuccess(res, 200, sanitized);
  } catch (error) {
    next(error);
  }
};

export const getHomepageSections = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const baseInclude = {
      genres: {
        include: {
          genre: true,
        },
      },
    };

    const publishedWhere = { publicationStatus: 'PUBLISHED' as const };

    const [trending, popular, recentlyAdded, topRated, genres] = await Promise.all([
      prisma.movie.findMany({
        where: { ...publishedWhere, isTrending: true },
        take: 10,
        orderBy: { viewCount: 'desc' },
        include: baseInclude,
      }),
      prisma.movie.findMany({
        where: publishedWhere,
        take: 10,
        orderBy: { viewCount: 'desc' },
        include: baseInclude,
      }),
      prisma.movie.findMany({
        where: publishedWhere,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: baseInclude,
      }),
      prisma.movie.findMany({
        where: publishedWhere,
        take: 10,
        orderBy: { rating: 'desc' },
        include: baseInclude,
      }),
      prisma.genre.findMany({
        take: 6,
        include: {
          movies: {
            where: { movie: publishedWhere },
            take: 8,
            include: {
              movie: {
                include: baseInclude,
              },
            },
          },
        },
      }),
    ]);

    const sections = [
      {
        id: 'trending',
        title: 'Trending Movies',
        movies: trending.map(LicenseValidator.sanitizePublicMovie),
      },
      {
        id: 'popular',
        title: 'Popular Movies',
        movies: popular.map(LicenseValidator.sanitizePublicMovie),
      },
      {
        id: 'recent',
        title: 'Recently Added',
        movies: recentlyAdded.map(LicenseValidator.sanitizePublicMovie),
      },
      {
        id: 'top-rated',
        title: 'Top Rated Movies',
        movies: topRated.map(LicenseValidator.sanitizePublicMovie),
      },
      ...genres.map((g) => ({
        id: `genre-${g.slug}`,
        title: g.name,
        genreSlug: g.slug,
        movies: g.movies.map((gm) => LicenseValidator.sanitizePublicMovie(gm.movie)),
      })),
    ];

    sendSuccess(res, 200, sections);
  } catch (error) {
    next(error);
  }
};

export const getMovieByIdOrSlug = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { idOrSlug } = req.params;

    const movie = await prisma.movie.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
        castMembers: {
          include: {
            cast: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        reviews: {
          where: { isApproved: true },
          take: 10,
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
        },
      },
    });

    if (!movie) {
      sendError(res, 404, 'Movie not found.');
      return;
    }

    // Increment view count asynchronously
    prisma.movie
      .update({
        where: { id: movie.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});

    // Check user-specific states if logged in
    let userState = {
      inWatchlist: false,
      userRating: null as number | null,
      watchProgress: null as any,
    };

    if (req.user) {
      const [watchlistEntry, ratingEntry, historyEntry] = await Promise.all([
        prisma.watchlist.findUnique({
          where: {
            userId_movieId: {
              userId: req.user.userId,
              movieId: movie.id,
            },
          },
        }),
        prisma.rating.findUnique({
          where: {
            userId_movieId: {
              userId: req.user.userId,
              movieId: movie.id,
            },
          },
        }),
        prisma.watchHistory.findUnique({
          where: {
            userId_movieId: {
              userId: req.user.userId,
              movieId: movie.id,
            },
          },
        }),
      ]);

      userState = {
        inWatchlist: Boolean(watchlistEntry),
        userRating: ratingEntry?.score ?? null,
        watchProgress: historyEntry
          ? {
              progressSeconds: historyEntry.progressSeconds,
              durationSeconds: historyEntry.durationSeconds,
              completionPercentage: historyEntry.completionPercentage,
              lastWatchedAt: historyEntry.lastWatchedAt,
            }
          : null,
      };
    }

    const sanitized = LicenseValidator.sanitizePublicMovie(movie);

    sendSuccess(res, 200, {
      ...sanitized,
      userState,
    });
  } catch (error) {
    next(error);
  }
};

export const getRelatedMovies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        genres: true,
      },
    });

    if (!movie) {
      sendError(res, 404, 'Movie not found');
      return;
    }

    const genreIds = movie.genres.map((g) => g.genreId);

    const related = await prisma.movie.findMany({
      where: {
        id: { not: id },
        publicationStatus: 'PUBLISHED',
        genres: {
          some: {
            genreId: { in: genreIds },
          },
        },
      },
      take: 8,
      orderBy: { rating: 'desc' },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    sendSuccess(res, 200, related.map(LicenseValidator.sanitizePublicMovie));
  } catch (error) {
    next(error);
  }
};

export const createMovie = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      sendError(res, 403, 'Unauthorized. Admin credentials required.');
      return;
    }

    const {
      title,
      originalTitle,
      description,
      releaseYear,
      releaseDate,
      durationMinutes,
      director,
      posterUrl,
      backdropUrl,
      trailerUrl,
      videoSourceUrl,
      externalStreamUrl,
      sourceProvider,
      contentRightsStatus = 'UNVERIFIED',
      publicationStatus = 'DRAFT',
      rightsHolder,
      licenseDocument,
      licenseStartDate,
      licenseEndDate,
      ownershipConfirmed = false,
      licenseNotes,
      language,
      country,
      isFeatured,
      isTrending,
      genreIds,
      auditReason,
    } = req.body;

    const movieInput = {
      title,
      description,
      posterUrl,
      backdropUrl,
      releaseYear: parseInt(releaseYear, 10),
      language: language || 'English',
      director,
      trailerUrl,
      videoSourceUrl: videoSourceUrl || null,
      externalStreamUrl: externalStreamUrl || null,
      sourceProvider,
      contentRightsStatus,
      publicationStatus,
      rightsHolder,
      licenseDocument,
      licenseStartDate: licenseStartDate ? new Date(licenseStartDate) : null,
      licenseEndDate: licenseEndDate ? new Date(licenseEndDate) : null,
      ownershipConfirmed: Boolean(ownershipConfirmed),
      licenseNotes,
    };

    // Validate mandatory movie input
    const validation = LicenseValidator.validateMovieInput(movieInput);
    if (!validation.isValid) {
      sendError(res, 400, 'Content rights verification failed', {
        rights: validation.errors,
      });
      return;
    }

    // If attempting to create directly as PUBLISHED, enforce publishing rules
    if (publicationStatus === 'PUBLISHED') {
      const pubValidation = LicenseValidator.validateForPublishing(movieInput);
      if (!pubValidation.isValid) {
        sendError(res, 400, 'Cannot publish movie: Content rights criteria not met', {
          rights: pubValidation.errors,
        });
        return;
      }
    }

    const slug = createSlug(title, parseInt(releaseYear, 10));

    const movie = await prisma.movie.create({
      data: {
        title,
        slug,
        originalTitle,
        description,
        releaseYear: parseInt(releaseYear, 10),
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        durationMinutes: parseInt(durationMinutes || '90', 10),
        director: director || null,
        posterUrl,
        backdropUrl: backdropUrl || null,
        trailerUrl,
        videoSourceUrl: videoSourceUrl || null,
        externalStreamUrl: externalStreamUrl || null,
        sourceProvider: sourceProvider || null,
        contentRightsStatus,
        publicationStatus,
        rightsHolder: rightsHolder || null,
        licenseDocument: licenseDocument || null,
        licenseStartDate: licenseStartDate ? new Date(licenseStartDate) : null,
        licenseEndDate: licenseEndDate ? new Date(licenseEndDate) : null,
        ownershipConfirmed: Boolean(ownershipConfirmed),
        licenseNotes,
        language: language || 'English',
        country: country || 'United States',
        isFeatured: Boolean(isFeatured),
        isTrending: Boolean(isTrending),
        genres:
          genreIds && Array.isArray(genreIds)
            ? {
                create: genreIds.map((gId: string) => ({
                  genre: { connect: { id: gId } },
                })),
              }
            : undefined,
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    // Record in mandatory Content Rights Audit Log
    await prisma.rightsAuditLog.create({
      data: {
        adminId: req.user.userId,
        movieId: movie.id,
        action: 'CREATE_MOVIE',
        rightsStatus: contentRightsStatus,
        publicationStatus,
        reason: auditReason || `Initial film submission with status ${contentRightsStatus}`,
      },
    });

    sendSuccess(res, 201, movie, 'Movie created successfully and logged in rights audit trail');
  } catch (error) {
    next(error);
  }
};

export const updateMovie = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      sendError(res, 403, 'Unauthorized. Admin credentials required.');
      return;
    }

    const { id } = req.params;
    const existing = await prisma.movie.findUnique({ where: { id } });
    if (!existing) {
      sendError(res, 404, 'Movie not found');
      return;
    }

    const {
      title,
      originalTitle,
      description,
      releaseYear,
      releaseDate,
      durationMinutes,
      director,
      posterUrl,
      backdropUrl,
      trailerUrl,
      videoSourceUrl,
      externalStreamUrl,
      sourceProvider,
      contentRightsStatus,
      publicationStatus,
      rightsHolder,
      licenseDocument,
      licenseStartDate,
      licenseEndDate,
      ownershipConfirmed,
      licenseNotes,
      language,
      country,
      isFeatured,
      isTrending,
      genreIds,
      auditReason,
    } = req.body;

    const targetRightsStatus = contentRightsStatus || existing.contentRightsStatus;
    const targetPubStatus = publicationStatus || existing.publicationStatus;

    const movieInput = {
      title: title ?? existing.title,
      description: description ?? existing.description,
      posterUrl: posterUrl ?? existing.posterUrl,
      backdropUrl: backdropUrl !== undefined ? backdropUrl : existing.backdropUrl,
      releaseYear: releaseYear ? parseInt(releaseYear, 10) : existing.releaseYear,
      language: language ?? existing.language,
      director: director !== undefined ? director : existing.director,
      trailerUrl: trailerUrl ?? existing.trailerUrl,
      videoSourceUrl: videoSourceUrl !== undefined ? videoSourceUrl : existing.videoSourceUrl,
      externalStreamUrl: externalStreamUrl !== undefined ? externalStreamUrl : existing.externalStreamUrl,
      sourceProvider: sourceProvider !== undefined ? sourceProvider : existing.sourceProvider,
      contentRightsStatus: targetRightsStatus,
      publicationStatus: targetPubStatus,
      rightsHolder: rightsHolder !== undefined ? rightsHolder : existing.rightsHolder,
      licenseDocument: licenseDocument !== undefined ? licenseDocument : existing.licenseDocument,
      licenseStartDate: licenseStartDate !== undefined ? (licenseStartDate ? new Date(licenseStartDate) : null) : existing.licenseStartDate,
      licenseEndDate: licenseEndDate !== undefined ? (licenseEndDate ? new Date(licenseEndDate) : null) : existing.licenseEndDate,
      ownershipConfirmed: ownershipConfirmed !== undefined ? Boolean(ownershipConfirmed) : existing.ownershipConfirmed,
      licenseNotes: licenseNotes ?? existing.licenseNotes,
    };

    // If publishing, validate publication rules
    if (targetPubStatus === 'PUBLISHED') {
      const pubValidation = LicenseValidator.validateForPublishing(movieInput);
      if (!pubValidation.isValid) {
        sendError(res, 400, 'Cannot publish movie: Content rights criteria not met', {
          rights: pubValidation.errors,
        });
        return;
      }
    } else {
      const validation = LicenseValidator.validateMovieInput(movieInput);
      if (!validation.isValid) {
        sendError(res, 400, 'Content rights verification failed', {
          rights: validation.errors,
        });
        return;
      }
    }

    // Update genres if provided
    if (genreIds && Array.isArray(genreIds)) {
      await prisma.movieGenre.deleteMany({ where: { movieId: id } });
      await prisma.movieGenre.createMany({
        data: genreIds.map((gId: string) => ({
          movieId: id,
          genreId: gId,
        })),
      });
    }

    const updated = await prisma.movie.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(originalTitle !== undefined && { originalTitle }),
        ...(description && { description }),
        ...(releaseYear && { releaseYear: parseInt(releaseYear, 10) }),
        ...(releaseDate !== undefined && { releaseDate: releaseDate ? new Date(releaseDate) : null }),
        ...(durationMinutes && { durationMinutes: parseInt(durationMinutes, 10) }),
        ...(director !== undefined && { director }),
        ...(posterUrl && { posterUrl }),
        ...(backdropUrl !== undefined && { backdropUrl }),
        ...(trailerUrl && { trailerUrl }),
        ...(videoSourceUrl !== undefined && { videoSourceUrl }),
        ...(externalStreamUrl !== undefined && { externalStreamUrl }),
        ...(sourceProvider !== undefined && { sourceProvider }),
        ...(contentRightsStatus && { contentRightsStatus }),
        ...(publicationStatus && { publicationStatus }),
        ...(rightsHolder !== undefined && { rightsHolder }),
        ...(licenseDocument !== undefined && { licenseDocument }),
        ...(licenseStartDate !== undefined && { licenseStartDate: licenseStartDate ? new Date(licenseStartDate) : null }),
        ...(licenseEndDate !== undefined && { licenseEndDate: licenseEndDate ? new Date(licenseEndDate) : null }),
        ...(ownershipConfirmed !== undefined && { ownershipConfirmed: Boolean(ownershipConfirmed) }),
        ...(licenseNotes && { licenseNotes }),
        ...(language && { language }),
        ...(country && { country }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        ...(isTrending !== undefined && { isTrending: Boolean(isTrending) }),
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    // Record in mandatory Content Rights Audit Log
    await prisma.rightsAuditLog.create({
      data: {
        adminId: req.user.userId,
        movieId: id,
        action: 'UPDATE_MOVIE',
        rightsStatus: updated.contentRightsStatus as any,
        publicationStatus: updated.publicationStatus as any,
        reason: auditReason || `Updated film content rights and metadata`,
      },
    });

    sendSuccess(res, 200, updated, 'Movie updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Transition Approval Workflow (DRAFT → RIGHTS_REVIEW → APPROVED → PUBLISHED → UNPUBLISHED)
 */
export const updateWorkflowStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      sendError(res, 403, 'Unauthorized');
      return;
    }

    const { id } = req.params;
    const { targetStatus, reason } = req.body;

    if (!targetStatus || !reason || !reason.trim()) {
      sendError(res, 400, 'Target publication status and audit reason are mandatory.');
      return;
    }

    const movie = await prisma.movie.findUnique({ where: { id } });
    if (!movie) {
      sendError(res, 404, 'Movie not found');
      return;
    }

    const transitionValidation = LicenseValidator.validateWorkflowTransition(
      movie.publicationStatus as any,
      targetStatus,
      movie as any
    );

    if (!transitionValidation.isValid) {
      sendError(res, 400, 'Workflow transition prohibited', {
        rights: transitionValidation.errors,
      });
      return;
    }

    const updated = await prisma.movie.update({
      where: { id },
      data: { publicationStatus: targetStatus },
    });

    // Mandatory Audit Record
    await prisma.rightsAuditLog.create({
      data: {
        adminId: req.user.userId,
        movieId: id,
        action: `WORKFLOW_${movie.publicationStatus}_TO_${targetStatus}`,
        rightsStatus: movie.contentRightsStatus as any,
        publicationStatus: targetStatus,
        reason: reason.trim(),
      },
    });

    sendSuccess(
      res,
      200,
      updated,
      `Film publication status successfully transitioned to ${targetStatus}`
    );
  } catch (error) {
    next(error);
  }
};

export const deleteMovie = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const movie = await prisma.movie.findUnique({ where: { id } });
    if (!movie) {
      sendError(res, 404, 'Movie not found');
      return;
    }

    await prisma.movie.delete({ where: { id } });

    // Log admin action
    if (req.user) {
      await prisma.adminAction.create({
        data: {
          adminId: req.user.userId,
          actionType: 'DELETE_MOVIE',
          targetType: 'Movie',
          targetId: id,
          details: `Deleted movie: ${movie.title}`,
        },
      });
    }

    sendSuccess(res, 200, null, 'Movie deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Content Rights Audit Logs
 */
export const getRightsAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      sendError(res, 403, 'Unauthorized');
      return;
    }

    const { movieId } = req.query;
    const where: any = {};
    if (movieId && typeof movieId === 'string') {
      where.movieId = movieId;
    }

    const logs = await prisma.rightsAuditLog.findMany({
      where,
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
        movie: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });

    sendSuccess(res, 200, logs);
  } catch (error) {
    next(error);
  }
};

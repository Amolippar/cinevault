import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { LicenseValidator } from '../services/licenseValidator';

export const getGenres = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const genres = await prisma.genre.findMany({
      include: {
        _count: {
          select: { movies: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    sendSuccess(res, 200, genres);
  } catch (error) {
    next(error);
  }
};

export const getGenreMovies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slugOrId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const genre = await prisma.genre.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
      },
    });

    if (!genre) {
      sendError(res, 404, 'Genre not found');
      return;
    }

    const [total, movies] = await Promise.all([
      prisma.movieGenre.count({
        where: { genreId: genre.id },
      }),
      prisma.movieGenre.findMany({
        where: { genreId: genre.id },
        skip,
        take: limit,
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
      }),
    ]);

    const sanitized = movies.map((mg) => LicenseValidator.sanitizePublicMovie(mg.movie));

    sendSuccess(res, 200, {
      genre,
      movies: sanitized,
    }, undefined, {
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

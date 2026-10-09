import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess } from '../utils/apiResponse';
import { LicenseValidator } from '../services/licenseValidator';

export const searchMovies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      q,
      title,
      genre,
      actor,
      director,
      year,
      language,
      minRating,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const take = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * take;

    const where: any = {};
    const conditions: any[] = [];

    // General search query matches title, description
    if (q && typeof q === 'string' && q.trim()) {
      const term = q.trim();
      conditions.push({
        OR: [
          { title: { contains: term } },
          { description: { contains: term } },
          { originalTitle: { contains: term } },
          {
            castMembers: {
              some: {
                cast: {
                  name: { contains: term },
                },
              },
            },
          },
        ],
      });
    }

    if (title && typeof title === 'string') {
      conditions.push({ title: { contains: title.trim() } });
    }

    if (genre && typeof genre === 'string') {
      conditions.push({
        genres: {
          some: {
            genre: {
              slug: genre.trim(),
            },
          },
        },
      });
    }

    if (actor && typeof actor === 'string') {
      conditions.push({
        castMembers: {
          some: {
            role: 'ACTOR',
            cast: {
              name: { contains: actor.trim() },
            },
          },
        },
      });
    }

    if (director && typeof director === 'string') {
      conditions.push({
        castMembers: {
          some: {
            role: 'DIRECTOR',
            cast: {
              name: { contains: director.trim() },
            },
          },
        },
      });
    }

    if (year) {
      conditions.push({ releaseYear: parseInt(year as string, 10) });
    }

    if (language && typeof language === 'string') {
      conditions.push({ language: { contains: language.trim() } });
    }

    if (minRating) {
      conditions.push({ rating: { gte: parseFloat(minRating as string) } });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const [total, movies] = await Promise.all([
      prisma.movie.count({ where }),
      prisma.movie.findMany({
        where,
        skip,
        take,
        orderBy: { rating: 'desc' },
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
            take: 3,
          },
        },
      }),
    ]);

    const sanitized = movies.map(LicenseValidator.sanitizePublicMovie);

    sendSuccess(res, 200, sanitized, undefined, {
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take),
      hasNext: pageNum * take < total,
      hasPrev: pageNum > 1,
    });
  } catch (error) {
    next(error);
  }
};

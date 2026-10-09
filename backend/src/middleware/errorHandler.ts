import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { sendError } from '../utils/apiResponse';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`${req.method} ${req.originalUrl} - Error:`, err);

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    const fields = err.meta?.target || 'field';
    sendError(res, 409, `A record with this ${fields} already exists.`);
    return;
  }

  // Prisma record not found error
  if (err.code === 'P2025') {
    sendError(res, 404, 'The requested resource was not found.');
    return;
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  sendError(res, statusCode, message);
};

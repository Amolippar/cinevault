import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { sendError } from '../utils/apiResponse';

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    sendError(res, 401, 'Authentication required.');
    return;
  }

  if (req.user.role !== 'ADMIN') {
    sendError(res, 403, 'Access denied. Administrator privileges required.');
    return;
  }

  next();
};

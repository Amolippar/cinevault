import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/authRoutes';
import movieRoutes from './routes/movieRoutes';
import searchRoutes from './routes/searchRoutes';
import genreRoutes from './routes/genreRoutes';
import watchlistRoutes from './routes/watchlistRoutes';
import historyRoutes from './routes/historyRoutes';
import reviewRoutes from './routes/reviewRoutes';
import adminRoutes from './routes/adminRoutes';

export const createApp = (): Application => {
  const app = express();

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false, // Allows cross-origin video embedding and external trailers
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow all local origins, production URL, or no origin (curl/mobile/tools)
        if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Request parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging
  if (config.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // Rate Limiting
  app.use('/api', apiLimiter);

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'CineVault API',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      legalCompliance: 'Strict - No unauthorized copyrighted streaming allowed',
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/movies', movieRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/genres', genreRoutes);
  app.use('/api/watchlist', watchlistRoutes);
  app.use('/api/history', historyRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api', reviewRoutes); // Supports /api/movies/:movieId/reviews
  app.use('/api/admin', adminRoutes);

  // 404 handler for API routes
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `Route ${req.method} ${req.originalUrl} not found`,
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

export default createApp;

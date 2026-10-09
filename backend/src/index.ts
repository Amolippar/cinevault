import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { prisma } from './prisma/client';

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(`=======================================================`);
  logger.info(`🎬 CineVault Server running on http://localhost:${config.port}`);
  logger.info(`⚖️  Legal Streaming & Content Enforcement: ACTIVE`);
  logger.info(`🛡️  Environment: ${config.nodeEnv}`);
  logger.info(`=======================================================`);
});

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Prisma disconnected.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { logger } from './utils/logging.js';
import { sanitizeInput } from './api/middleware/sanitization.js';
import { errorHandler, notFoundHandler } from './api/middleware/errorHandler.js';
import { rateLimiter } from './api/middleware/rateLimiter.js';
import searchRoutes from './api/routes/search.js';
import birdsRoutes from './api/routes/birds.js';
import taxonomyRoutes from './api/routes/taxonomy.js';

config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(sanitizeInput);
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', searchRoutes);
app.use('/api', birdsRoutes);
app.use('/api', taxonomyRoutes);

// API root endpoint
app.get('/api', (_req, res) => {
  res.json({
    message: 'BirdMate API',
    version: '1.0.0',
    endpoints: [
      'GET /health',
      'GET /api',
      'POST /api/v1/search',
      'GET /api/v1/birds',
      'GET /api/v1/birds/:id',
      'GET /api/v1/taxonomy',
    ],
  });
});

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    corsOrigin: CORS_ORIGIN,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

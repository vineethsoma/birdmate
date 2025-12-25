/**
 * Express server with middleware stack
 * 
 * Main application entry point
 */

import express, { type Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, healthCheck } from './db/client.js';
import { sanitizeRequestBody } from './api/middleware/sanitize.js';
import { errorHandler, notFoundHandler } from './api/middleware/errorHandler.js';
import { rateLimiter } from './api/middleware/rateLimit.js';
import { info, warn } from './utils/logging.js';
import searchRouter from './api/routes/search.js';
import taxonomyRouter from './api/routes/taxonomy.js';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '3001', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

/**
 * Create and configure Express application
 */
export function createApp(): Express {
  const app = express();
  
  // Middleware stack
  app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }));
  
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  
  // Apply rate limiting globally
  app.use(rateLimiter);
  
  // Apply input sanitization
  app.use(sanitizeRequestBody);
  
  // Health check endpoint
  app.get('/health', (_req, res) => {
    const dbHealthy = healthCheck();
    const status = dbHealthy ? 'ok' : 'error';
    
    res.status(dbHealthy ? 200 : 503).json({
      status,
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      database: dbHealthy ? 'connected' : 'disconnected',
    });
  });
  
  // API routes (to be implemented in user stories)
  app.use('/api/v1', searchRouter);
  app.use('/api/v1', taxonomyRouter);
  // app.use('/api/v1/birds', birdsRouter);
  
  // Placeholder for API routes
  app.get('/api/v1', (_req, res) => {
    res.json({
      name: 'Birdmate API',
      version: '0.1.0',
      endpoints: [
        'POST /api/v1/search - Natural language bird search',
        'GET /api/v1/birds/:id - Get bird details',
        'GET /api/v1/taxonomy - Get taxonomy metadata',
      ],
    });
  });
  
  // 404 handler
  app.use(notFoundHandler);
  
  // Error handler (must be last)
  app.use(errorHandler);
  
  return app;
}

/**
 * Start server
 */
export async function startServer(): Promise<void> {
  try {
    // Initialize database
    initializeDatabase();
    
    // Verify OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      warn('OPENAI_API_KEY not set - search functionality will be disabled');
    }
    
    // Create and start app
    const app = createApp();
    
    app.listen(PORT, () => {
      info(`🚀 Server started on http://localhost:${PORT}`, {
        environment: process.env.NODE_ENV || 'development',
        port: PORT,
        corsOrigin: CORS_ORIGIN,
      });
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Start if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

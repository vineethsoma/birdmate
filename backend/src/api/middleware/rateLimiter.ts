import rateLimit from 'express-rate-limit';
import { logger } from '../../utils/logging.js';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

export const rateLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Too many requests, please try again later. Limit: ${maxRequests} requests per ${windowMs / 1000 / 60} minutes.`,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next, options) => {
    logger.warn('Rate limit exceeded', {
      ip: _req.ip,
      path: _req.path,
      limit: maxRequests,
    });
    res.status(options.statusCode).json(options.message);
  },
});

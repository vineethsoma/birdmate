/**
 * Rate limiting middleware
 * 
 * Prevents abuse by limiting request frequency per IP address
 */

import rateLimit from 'express-rate-limit';

// Disable rate limiting in test environment
const isTestEnv = process.env.NODE_ENV === 'test';

/**
 * Rate limiter configuration
 */
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '30', 10), // 30 requests per window
  skip: () => isTestEnv, // Skip rate limiting in tests
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again later.',
      },
    });
  },
});

/**
 * Stricter rate limiter for search endpoint
 */
export const searchRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 10, // 10 searches per minute
  skip: () => isTestEnv, // Skip rate limiting in tests
  message: {
    error: {
      code: 'SEARCH_RATE_LIMIT_EXCEEDED',
      message: 'Too many search requests. Please wait before searching again.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: 'SEARCH_RATE_LIMIT_EXCEEDED',
        message: 'Too many search requests. Please wait before searching again.',
      },
    });
  },
});

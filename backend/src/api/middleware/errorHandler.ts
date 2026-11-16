/**
 * Error handling middleware
 * 
 * Centralized error handling with consistent API responses
 */

import { Request, Response, NextFunction } from 'express';
import { error as logError } from '../../utils/logging.js';

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public field?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Express error handling middleware
 * 
 * Must have 4 parameters to be recognized as error handler
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error
  logError(err.message, {
    name: err.name,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  
  // Handle known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        field: err.field,
      },
    });
    return;
  }
  
  // Client errors raised by body-parser (malformed JSON, non-object JSON, oversized body)
  // are the caller's fault: 4xx, never 5xx.
  const clientStatus = (err as { status?: unknown }).status;
  if (typeof clientStatus === 'number' && clientStatus >= 400 && clientStatus < 500) {
    const tooLarge = clientStatus === 413;
    res.status(clientStatus).json({
      error: {
        code: tooLarge ? 'PAYLOAD_TOO_LARGE' : 'INVALID_REQUEST_BODY',
        message: tooLarge ? 'Request body is too large' : 'Request body must be valid JSON',
      },
    });
    return;
  }

  // Handle unknown errors (don't leak details in production)
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isDevelopment ? err.message : 'An unexpected error occurred',
      ...(isDevelopment && { stack: err.stack }),
    },
  });
}

/**
 * 404 handler for unknown routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

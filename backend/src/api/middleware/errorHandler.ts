import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logging.js';

interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  field?: string;
}

export function errorHandler(
  error: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = error.statusCode || 500;
  const errorCode = error.code || 'INTERNAL_ERROR';
  const message = error.message || 'An unexpected error occurred';

  logger.error('API error occurred', {
    statusCode,
    errorCode,
    message,
    stack: error.stack,
  }, error);

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message,
      field: error.field,
    },
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
    },
  });
}

export class ValidationError extends Error {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  code = 'NOT_FOUND';

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends Error {
  statusCode = 500;
  code = 'DATABASE_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

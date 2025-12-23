import { Request, Response, NextFunction } from 'express';
import validator from 'validator';
import { logger } from '../../utils/logging.js';

export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  try {
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }

    if (req.query && typeof req.query === 'object') {
      sanitizeObject(req.query);
    }

    if (req.params && typeof req.params === 'object') {
      sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error('Input sanitization failed', { error: (error as Error).message });
    next(error);
  }
}

function sanitizeObject(obj: Record<string, unknown>): void {
  for (const key in obj) {
    const value = obj[key];

    if (typeof value === 'string') {
      obj[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      obj[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeString(item) : item
      );
    }
  }
}

function sanitizeString(input: string): string {
  let sanitized = validator.trim(input);
  sanitized = validator.escape(sanitized);
  return sanitized;
}

export function validateSearchQuery(req: Request, res: Response, next: NextFunction): void {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Query parameter is required and must be a string',
        field: 'query',
      },
    });
    return;
  }

  if (query.trim().length === 0) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Query cannot be empty',
        field: 'query',
      },
    });
    return;
  }

  if (query.length > 500) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Query cannot exceed 500 characters',
        field: 'query',
      },
    });
    return;
  }

  next();
}

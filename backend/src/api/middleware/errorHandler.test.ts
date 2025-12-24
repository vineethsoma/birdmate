/**
 * Unit tests for error handling middleware
 * 
 * Tests AppError class, error handler, and 404 handler
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler, notFoundHandler } from './errorHandler.js';

// Mock logging module
vi.mock('../../utils/logging.js', () => ({
  error: vi.fn(),
}));

describe('AppError', () => {
  it('should create AppError with all properties', () => {
    const err = new AppError('VALIDATION_ERROR', 'Invalid email format', 400, 'email');

    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('Invalid email format');
    expect(err.statusCode).toBe(400);
    expect(err.field).toBe('email');
    expect(err.name).toBe('AppError');
  });

  it('should default to 500 status code when not specified', () => {
    const err = new AppError('SERVER_ERROR', 'Something went wrong');

    expect(err.statusCode).toBe(500);
    expect(err.field).toBeUndefined();
  });

  it('should be instance of Error', () => {
    const err = new AppError('TEST_ERROR', 'Test message');

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('errorHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let originalEnv: string | undefined;

  beforeEach(() => {
    // Save original NODE_ENV
    originalEnv = process.env.NODE_ENV;

    mockReq = {
      path: '/api/test',
      method: 'POST',
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    mockNext = vi.fn();
  });

  afterEach(() => {
    // Restore NODE_ENV
    if (originalEnv !== undefined) {
      process.env.NODE_ENV = originalEnv;
    } else {
      delete process.env.NODE_ENV;
    }
  });

  describe('AppError handling', () => {
    it('should handle AppError with all fields', () => {
      const err = new AppError('VALIDATION_ERROR', 'Invalid input', 400, 'email');

      errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          field: 'email',
        },
      });
    });

    it('should handle AppError without field', () => {
      const err = new AppError('UNAUTHORIZED', 'Invalid token', 401);

      errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token',
          field: undefined,
        },
      });
    });

    it('should handle AppError with default 500 status', () => {
      const err = new AppError('SERVER_ERROR', 'Database connection failed');

      errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          code: 'SERVER_ERROR',
          message: 'Database connection failed',
          field: undefined,
        },
      });
    });
  });

  describe('Unknown error handling', () => {
    it('should hide error details in production', () => {
      process.env.NODE_ENV = 'production';
      const err = new Error('Database password incorrect');

      errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    });

    it('should show error details in development', () => {
      process.env.NODE_ENV = 'development';
      const err = new Error('Database connection refused');

      errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      const response = (mockRes.json as any).mock.calls[0][0];
      expect(response.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(response.error.message).toBe('Database connection refused');
      expect(response.error.stack).toBeDefined();
    });

    it('should handle error without NODE_ENV set', () => {
      delete process.env.NODE_ENV;
      const err = new Error('Unexpected failure');

      errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    });
  });

  describe('Error logging', () => {
    it('should log all errors with context', async () => {
      const { error: logError } = await import('../../utils/logging.js');
      const err = new AppError('TEST_ERROR', 'Test error message');

      errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

      expect(logError).toHaveBeenCalledWith('Test error message', {
        name: 'AppError',
        stack: expect.any(String),
        path: '/api/test',
        method: 'POST',
      });
    });

    it('should log unknown errors', async () => {
      const { error: logError } = await import('../../utils/logging.js');
      const err = new Error('Unknown error');

      errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

      expect(logError).toHaveBeenCalledWith('Unknown error', {
        name: 'Error',
        stack: expect.any(String),
        path: '/api/test',
        method: 'POST',
      });
    });
  });

  describe('Response format consistency', () => {
    it('should always return error object with code and message', () => {
      const err = new AppError('TEST', 'Test message');

      errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

      const response = (mockRes.json as any).mock.calls[0][0];
      expect(response).toHaveProperty('error');
      expect(response.error).toHaveProperty('code');
      expect(response.error).toHaveProperty('message');
    });

    it('should not call next() - terminal middleware', () => {
      const err = new AppError('TEST', 'Test');

      errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});

describe('notFoundHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      path: '/api/unknown',
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  it('should return 404 status', () => {
    notFoundHandler(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  it('should return error with NOT_FOUND code', () => {
    notFoundHandler(mockReq as Request, mockRes as Response);

    expect(mockRes.json).toHaveBeenCalledWith({
      error: {
        code: 'NOT_FOUND',
        message: 'Route GET /api/unknown not found',
      },
    });
  });

  it('should include method and path in message', () => {
    mockReq.method = 'POST';
    mockReq.path = '/api/v1/nonexistent';

    notFoundHandler(mockReq as Request, mockRes as Response);

    expect(mockRes.json).toHaveBeenCalledWith({
      error: {
        code: 'NOT_FOUND',
        message: 'Route POST /api/v1/nonexistent not found',
      },
    });
  });

  it('should handle different HTTP methods', () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    methods.forEach((method) => {
      const req = { ...mockReq, method };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      notFoundHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'NOT_FOUND',
          message: `Route ${method} /api/unknown not found`,
        },
      });
    });
  });
});

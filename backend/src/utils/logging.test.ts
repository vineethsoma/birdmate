/**
 * Unit tests for logging utility
 * 
 * Tests structured logging with JSON format
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debug, info, warn, error, logRequest, logSearch } from './logging.js';

describe('Logging Utility', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
    if (originalEnv !== undefined) {
      process.env.NODE_ENV = originalEnv;
    } else {
      delete process.env.NODE_ENV;
    }
  });

  describe('debug', () => {
    it('should log debug messages in development', () => {
      process.env.NODE_ENV = 'development';
      
      debug('Debug message', { userId: 123 });

      expect(consoleSpy.log).toHaveBeenCalled();
      const loggedMessage = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);
      
      expect(parsed.level).toBe('debug');
      expect(parsed.message).toBe('Debug message');
      expect(parsed.context).toEqual({ userId: 123 });
    });

    it('should not log debug messages in production', () => {
      process.env.NODE_ENV = 'production';
      
      debug('Debug message');

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should not log debug messages when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;
      
      debug('Debug message');

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('should log info messages', () => {
      info('Info message', { requestId: 'abc123' });

      expect(consoleSpy.log).toHaveBeenCalled();
      const loggedMessage = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);
      
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('Info message');
      expect(parsed.context.requestId).toBe('abc123');
    });

    it('should log info messages without context', () => {
      info('Simple info');

      expect(consoleSpy.log).toHaveBeenCalled();
      const loggedMessage = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);
      
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('Simple info');
      expect(parsed.context).toBeUndefined();
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      warn('Warning message', { deprecated: true });

      expect(consoleSpy.warn).toHaveBeenCalled();
      const loggedMessage = consoleSpy.warn.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);
      
      expect(parsed.level).toBe('warn');
      expect(parsed.message).toBe('Warning message');
      expect(parsed.context).toEqual({ deprecated: true });
    });

    it('should log warnings without context', () => {
      warn('Simple warning');

      expect(consoleSpy.warn).toHaveBeenCalled();
      const loggedMessage = consoleSpy.warn.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);
      
      expect(parsed.message).toBe('Simple warning');
      expect(parsed.context).toBeUndefined();
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      error('Error message', { errorCode: 'DB_CONNECTION_FAILED' });

      expect(consoleSpy.error).toHaveBeenCalled();
      const loggedMessage = consoleSpy.error.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);
      
      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('Error message');
      expect(parsed.context).toEqual({ errorCode: 'DB_CONNECTION_FAILED' });
    });

    it('should log errors without context', () => {
      error('Simple error');

      expect(consoleSpy.error).toHaveBeenCalled();
      const loggedMessage = consoleSpy.error.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);
      
      expect(parsed.message).toBe('Simple error');
      expect(parsed.context).toBeUndefined();
    });
  });

  describe('logRequest', () => {
    it('should log HTTP requests with all details', () => {
      logRequest('GET', '/api/birds', 200, 45, { userId: '123' });

      expect(consoleSpy.log).toHaveBeenCalled();
      const loggedMessage = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);
      
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('GET /api/birds 200');
      expect(parsed.context).toEqual({
        method: 'GET',
        path: '/api/birds',
        statusCode: 200,
        durationMs: 45,
        userId: '123',
      });
    });

    it('should log requests without extra context', () => {
      logRequest('POST', '/api/search', 201, 120);

      expect(consoleSpy.log).toHaveBeenCalled();
      const loggedMessage = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);
      
      expect(parsed.message).toBe('POST /api/search 201');
      expect(parsed.context.durationMs).toBe(120);
    });
  });

  describe('logSearch', () => {
    it('should log search queries with results', () => {
      logSearch('red bird', 5, ['norcad', 'carcar', 'houfin'], 85);

      expect(consoleSpy.log).toHaveBeenCalled();
      const loggedMessage = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);
      
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('Search query executed');
      expect(parsed.context).toEqual({
        query: 'red bird',
        resultCount: 5,
        topResults: ['norcad', 'carcar', 'houfin'],
        durationMs: 85,
      });
    });

    it('should log searches with no results', () => {
      logSearch('nonexistent bird', 0, [], 10);

      expect(consoleSpy.log).toHaveBeenCalled();
      const loggedMessage = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);
      
      expect(parsed.context.resultCount).toBe(0);
      expect(parsed.context.topResults).toEqual([]);
    });
  });

  describe('JSON format validation', () => {
    it('should produce valid JSON for all log levels', () => {
      process.env.NODE_ENV = 'development'; // Enable debug logs
      
      debug('Debug');
      info('Info');
      warn('Warn');
      error('Error');

      const logs = [
        ...consoleSpy.log.mock.calls.map((call) => call[0]),
        ...consoleSpy.warn.mock.calls.map((call) => call[0]),
        ...consoleSpy.error.mock.calls.map((call) => call[0]),
      ];

      logs.forEach((log: string) => {
        expect(() => JSON.parse(log)).not.toThrow();
      });
    });

    it('should include timestamp in ISO format', () => {
      info('Test message');

      const loggedMessage = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);
      
      expect(parsed.timestamp).toBeDefined();
      expect(() => new Date(parsed.timestamp)).not.toThrow();
      expect(new Date(parsed.timestamp).toISOString()).toBe(parsed.timestamp);
    });

    it('should handle empty context', () => {
      info('Test', {});

      const loggedMessage = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);
      
      // Empty context should not be included
      expect(parsed.context).toBeUndefined();
    });

    it('should handle complex context objects', () => {
      const complexContext = {
        user: { id: 123, name: 'Test' },
        metadata: { tags: ['bird', 'search'], count: 5 },
      };
      
      info('Complex context', complexContext);

      const loggedMessage = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);
      
      expect(parsed.context).toEqual(complexContext);
    });
  });
});

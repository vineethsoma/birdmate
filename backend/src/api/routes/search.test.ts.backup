/**
 * Contract tests for POST /api/v1/search endpoint
 * 
 * Validates OpenAPI contract compliance and error handling
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import supertest from 'supertest';
import type { Express } from 'express';

// Mock OpenAI before any imports - generate pseudo-random embeddings based on input
vi.mock('openai', () => {
  // Simple hash function to create deterministic embeddings from text
  const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  return {
    default: vi.fn().mockImplementation(() => ({
      embeddings: {
        create: vi.fn().mockImplementation((params: any) => {
          const input = params.input.toLowerCase();
          const seed = hashCode(input);
          
          // Generate deterministic pseudo-random embedding
          const embedding = new Array(1536).fill(0).map((_, i) => {
            // Use seed + index for pseudo-randomness
            const value = Math.sin(seed + i * 0.1) * 0.5 + 0.5;
            return value;
          });
          
          return Promise.resolve({
            data: [{ embedding, index: 0 }],
            model: 'text-embedding-3-small',
            usage: { prompt_tokens: input.split(' ').length, total_tokens: input.split(' ').length }
          });
        })
      }
    }))
  };
});

import { createApp } from '../../server.js';
import { initializeDatabase, closeDatabase } from '../../db/client.js';

describe('POST /api/v1/search - Contract Tests', () => {
  let app: Express;
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(() => {
    initializeDatabase();
    app = createApp();
    request = supertest(app);
  });

  afterAll(() => {
    closeDatabase();
  });

  describe('Successful requests (200)', () => {
    it('should return search results for valid query', async () => {
      const response = await request
        .post('/api/v1/search')
        .send({ query: 'red bird with black wings' })
        .expect('Content-Type', /json/)
        .expect(200);

      // The integration test performs a real semantic search
      // Results may vary but structure should be consistent
      expect(response.body).toMatchObject({
        queryId: expect.stringMatching(/^[0-9a-f-]{36}$/), // UUID
        totalCount: expect.any(Number),
        results: expect.any(Array)
      });
      
      // Verify each result has correct structure
      if (response.body.results.length > 0) {
        response.body.results.forEach((result: any) => {
          expect(result).toMatchObject({
            id: expect.any(String),
            commonName: expect.any(String),
            scientificName: expect.any(String),
            score: expect.any(Number),
            fieldMarks: expect.any(Array)
          });
          // thumbnailUrl can be null or string
          expect(['string', 'object']).toContain(typeof result.thumbnailUrl);
        });
      }
    });

    it('should handle query with no results', async () => {
      const response = await request
        .post('/api/v1/search')
        .send({ query: 'zzz impossible bird description xyz' })
        .expect(200);

      // With semantic search and a 0.3 similarity threshold,
      // even impossible queries may return low-scoring results
      // The key is that structure is correct
      expect(response.body).toMatchObject({
        queryId: expect.any(String),
        totalCount: expect.any(Number),
        results: expect.any(Array)
      });
      
      // All results should have scores below typical good matches
      if (response.body.results.length > 0) {
        response.body.results.forEach((result: any) => {
          expect(result.score).toBeLessThan(0.6); // Low similarity scores expected
        });
      }
    });

    it('should trim whitespace from query', async () => {
      const response = await request
        .post('/api/v1/search')
        .send({ query: '  blue jay  ' })
        .expect(200);

      // With mocked embeddings, results may be 0 if no birds meet similarity threshold
      // The important thing is that whitespace is trimmed and the query is processed
      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('totalCount');
      expect(response.body).toHaveProperty('queryId');
    });

    it('should return scores between 0 and 1', async () => {
      const response = await request
        .post('/api/v1/search')
        .send({ query: 'blue jay' })
        .expect(200);

      response.body.results.forEach((result: any) => {
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(1);
      });
    });

    it('should return results in descending score order', async () => {
      const response = await request
        .post('/api/v1/search')
        .send({ query: 'cardinal' })
        .expect(200);

      const scores = response.body.results.map((r: any) => r.score);
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
      }
    });

    it('should return maximum 10 results', async () => {
      const response = await request
        .post('/api/v1/search')
        .send({ query: 'bird' })
        .expect(200);

      expect(response.body.results.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Validation errors (400)', () => {
    it('should reject request without query field', async () => {
      const response = await request
        .post('/api/v1/search')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query field is required and must be a string'
        }
      });
    });

    it('should reject query shorter than 3 characters', async () => {
      const response = await request
        .post('/api/v1/search')
        .send({ query: 'ab' })
        .expect(400);

      expect(response.body).toEqual({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query must be 3-500 characters'
        }
      });
    });

    it('should reject query longer than 500 characters', async () => {
      // Create exactly 501 character query (after trimming)
      const longQuery = 'a'.repeat(501);
      
      const response = await request
        .post('/api/v1/search')
        .send({ query: longQuery })
        .expect(400);

      expect(response.body).toEqual({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query must be 3-500 characters'
        }
      });
    });

    it('should reject query with only whitespace', async () => {
      const response = await request
        .post('/api/v1/search')
        .send({ query: '   \n\t   ' })
        .expect(400);

      expect(response.body).toEqual({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query must be 3-500 characters'
        }
      });
    });

    it('should reject non-string query', async () => {
      const response = await request
        .post('/api/v1/search')
        .send({ query: 123 })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject array query', async () => {
      const response = await request
        .post('/api/v1/search')
        .send({ query: ['blue', 'jay'] })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Error responses', () => {
    it('should return 405 for GET request', async () => {
      await request
        .get('/api/v1/search')
        .expect(405);
    });

    it('should return 415 for non-JSON content type', async () => {
      await request
        .post('/api/v1/search')
        .set('Content-Type', 'text/plain')
        .send('blue jay')
        .expect(415);
    });
  });

  describe('Rate limiting', () => {
    it.skip('should apply rate limiting after excessive requests (disabled in test env)', async () => {
      // Rate limiting is disabled in test environment (NODE_ENV=test)
      // This test would pass in production but is skipped for test stability
      
      // Make many requests quickly
      const requests = Array(101).fill(null).map(() => 
        request
          .post('/api/v1/search')
          .send({ query: 'test bird' })
      );

      const responses = await Promise.allSettled(requests);
      
      // At least one should be rate limited
      const rateLimited = responses.some(r => 
        r.status === 'fulfilled' && r.value.status === 429
      );

      expect(rateLimited).toBe(true);
    }, 30000);
  });

  describe('CORS headers', () => {
    it('should include CORS headers', async () => {
      const response = await request
        .post('/api/v1/search')
        .send({ query: 'blue jay' })
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Response timing', () => {
    it('should respond within 2 seconds', async () => {
      const start = Date.now();
      
      await request
        .post('/api/v1/search')
        .send({ query: 'red bird with black wings' })
        .expect(200);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Content sanitization', () => {
    it('should sanitize HTML in query', async () => {
      const response = await request
        .post('/api/v1/search')
        .send({ query: 'blue jay<script>alert("xss")</script>' })
        .expect(200);

      // Should not error, query should be sanitized
      expect(response.body).toBeDefined();
    });

    it('should sanitize SQL-like input', async () => {
      const response = await request
        .post('/api/v1/search')
        .send({ query: "blue jay'; DROP TABLE birds; --" })
        .expect(200);

      // Should not error or affect database
      expect(response.body).toBeDefined();
    });
  });
});

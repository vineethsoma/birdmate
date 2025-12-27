/**
 * Unit tests for OpenAI embeddings wrapper
 * 
 * Tests text embedding generation for semantic search
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create mock function that will be used by the OpenAI mock
let mockCreate = vi.fn();

// Mock OpenAI client before any imports - use a factory that returns the mock
vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      embeddings = {
        create: (...args: any[]) => mockCreate(...args)
      };
    }
  };
});

import { generateEmbedding } from './embeddings.js';

describe('Embeddings Utility', () => {
  const originalApiKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    // Set fake API key for tests (mocked OpenAI client won't use it)
    process.env.OPENAI_API_KEY = 'test-key-for-mocked-client';
    mockCreate = vi.fn();
  });

  afterEach(() => {
    // Restore original API key
    process.env.OPENAI_API_KEY = originalApiKey;
  });

  describe('generateEmbedding', () => {
    it('should generate embedding for valid text', async () => {
      // Arrange
      const mockEmbedding = new Array(1536).fill(0).map(() => Math.random());
      mockCreate.mockResolvedValue({
        data: [{
          embedding: mockEmbedding,
          index: 0
        }],
        model: 'text-embedding-3-small',
        usage: { prompt_tokens: 10, total_tokens: 10 }
      });

      // Act
      const result = await generateEmbedding('red bird with black wings');

      // Assert
      expect(result).toEqual({
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
        tokens: 10
      });
      
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'red bird with black wings',
        encoding_format: 'float'
      });
    });

    it('should reject empty text', async () => {
      // Act & Assert
      await expect(generateEmbedding('')).rejects.toThrow('Text cannot be empty');
    });

    it('should reject text that is only whitespace', async () => {
      // Act & Assert
      await expect(generateEmbedding('   \n\t  ')).rejects.toThrow('Text cannot be empty');
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      mockCreate.mockRejectedValue(new Error('API rate limit exceeded'));

      // Act & Assert
      await expect(generateEmbedding('test query')).rejects.toThrow('API rate limit exceeded');
    });

    it('should return 1536-dimensional vector', async () => {
      // Arrange
      const mockEmbedding = new Array(1536).fill(0.1);
      mockCreate.mockResolvedValue({
        data: [{ embedding: mockEmbedding, index: 0 }],
        model: 'text-embedding-3-small',
        usage: { prompt_tokens: 5, total_tokens: 5 }
      });

      // Act
      const result = await generateEmbedding('blue jay');
      
      // Assert
      expect(result.embedding).toHaveLength(1536);
    });

    it('should trim and normalize whitespace', async () => {
      // Arrange
      const mockEmbedding = new Array(1536).fill(0.1);
      mockCreate.mockResolvedValue({
        data: [{ embedding: mockEmbedding, index: 0 }],
        model: 'text-embedding-3-small',
        usage: { prompt_tokens: 5, total_tokens: 5 }
      });

      // Act
      await generateEmbedding('  red   bird  \n  with   wings  ');
      
      // Assert - Verify text was cleaned before sending to API
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'red bird with wings',
        encoding_format: 'float'
      });
    });

    it('should handle long text inputs', async () => {
      // Arrange
      const longText = 'red bird '.repeat(100); // ~900 characters
      const mockEmbedding = new Array(1536).fill(0.1);
      mockCreate.mockResolvedValue({
        data: [{ embedding: mockEmbedding, index: 0 }],
        model: 'text-embedding-3-small',
        usage: { prompt_tokens: 200, total_tokens: 200 }
      });

      // Act
      const result = await generateEmbedding(longText);
      
      // Assert
      expect(result.embedding).toHaveLength(1536);
      expect(result.tokens).toBe(200);
    });
  });
});

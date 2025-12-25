/**
 * Unit tests for cosine similarity calculation
 * 
 * Tests vector similarity search functionality used for semantic bird search
 */

import { describe, it, expect } from 'vitest';
import { cosineSimilarity, normalizeVector } from './similarity.js';

describe('Similarity Utilities', () => {
  describe('normalizeVector', () => {
    it('should normalize a vector to unit length', () => {
      const vector = [3, 4]; // Length = 5
      const normalized = normalizeVector(vector);
      
      expect(normalized).toHaveLength(2);
      expect(normalized[0]).toBeCloseTo(0.6);
      expect(normalized[1]).toBeCloseTo(0.8);
      
      // Verify unit length
      const length = Math.sqrt(normalized[0] ** 2 + normalized[1] ** 2);
      expect(length).toBeCloseTo(1.0);
    });

    it('should handle already normalized vectors', () => {
      const vector = [1, 0];
      const normalized = normalizeVector(vector);
      
      expect(normalized[0]).toBeCloseTo(1.0);
      expect(normalized[1]).toBeCloseTo(0.0);
    });

    it('should throw error for zero vector', () => {
      const vector = [0, 0, 0];
      
      expect(() => normalizeVector(vector)).toThrow('Cannot normalize zero vector');
    });

    it('should handle high-dimensional vectors (1536 dims)', () => {
      const vector = new Array(1536).fill(1);
      const normalized = normalizeVector(vector);
      
      expect(normalized).toHaveLength(1536);
      const length = Math.sqrt(normalized.reduce((sum, val) => sum + val ** 2, 0));
      expect(length).toBeCloseTo(1.0);
    });
  });

  describe('cosineSimilarity', () => {
    it('should calculate similarity for identical vectors', () => {
      const v1 = [1, 2, 3];
      const v2 = [1, 2, 3];
      
      const similarity = cosineSimilarity(v1, v2);
      expect(similarity).toBeCloseTo(1.0);
    });

    it('should calculate similarity for orthogonal vectors', () => {
      const v1 = [1, 0, 0];
      const v2 = [0, 1, 0];
      
      const similarity = cosineSimilarity(v1, v2);
      expect(similarity).toBeCloseTo(0.0);
    });

    it('should calculate similarity for opposite vectors', () => {
      const v1 = [1, 2, 3];
      const v2 = [-1, -2, -3];
      
      const similarity = cosineSimilarity(v1, v2);
      expect(similarity).toBeCloseTo(-1.0);
    });

    it('should calculate similarity for partially similar vectors', () => {
      const v1 = [1, 0, 0];
      const v2 = [1, 1, 0]; // 45-degree angle
      
      const similarity = cosineSimilarity(v1, v2);
      expect(similarity).toBeCloseTo(0.707, 2);
    });

    it('should throw error for mismatched dimensions', () => {
      const v1 = [1, 2, 3];
      const v2 = [1, 2];
      
      expect(() => cosineSimilarity(v1, v2)).toThrow('Vector dimensions must match');
    });

    it('should handle 1536-dimensional embeddings', () => {
      const v1 = new Array(1536).fill(0.5);
      const v2 = new Array(1536).fill(0.5);
      
      const similarity = cosineSimilarity(v1, v2);
      expect(similarity).toBeCloseTo(1.0);
    });

    it('should be symmetric', () => {
      const v1 = [2, 3, 4];
      const v2 = [5, 6, 7];
      
      const sim1 = cosineSimilarity(v1, v2);
      const sim2 = cosineSimilarity(v2, v1);
      
      expect(sim1).toBeCloseTo(sim2);
    });

    it('should return values in range [-1, 1]', () => {
      const v1 = [Math.random(), Math.random(), Math.random()];
      const v2 = [Math.random(), Math.random(), Math.random()];
      
      const similarity = cosineSimilarity(v1, v2);
      expect(similarity).toBeGreaterThanOrEqual(-1);
      expect(similarity).toBeLessThanOrEqual(1);
    });
  });
});

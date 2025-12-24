/**
 * Input sanitization tests
 */

import { describe, it, expect } from 'vitest';
import { sanitizeString, validateSearchQuery } from './sanitize.js';

describe('Input Sanitization', () => {
  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      const result = sanitizeString('  hello world  ');
      expect(result).toBe('hello world');
    });
    
    it('should remove HTML tags', () => {
      const result = sanitizeString('<script>alert("xss")</script>red bird');
      expect(result).toBe('red bird');
    });
    
    it('should limit length', () => {
      const longString = 'a'.repeat(1000);
      const result = sanitizeString(longString, 100);
      expect(result.length).toBe(100);
    });
    
    it('should handle special characters safely', () => {
      const result = sanitizeString('bird with <>&" quotes');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });
  });
  
  describe('validateSearchQuery', () => {
    it('should accept valid queries', () => {
      const result = validateSearchQuery('red bird with black wings');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
    
    it('should reject empty queries', () => {
      const result = validateSearchQuery('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
    
    it('should reject queries that are too short', () => {
      const result = validateSearchQuery('ab');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 3 characters');
    });
    
    it('should reject queries that are too long', () => {
      const longQuery = 'a'.repeat(600);
      const result = validateSearchQuery(longQuery);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('less than 500 characters');
    });
  });
});

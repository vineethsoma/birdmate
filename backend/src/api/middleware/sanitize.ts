/**
 * Input sanitization middleware
 * 
 * Prevents XSS attacks by sanitizing all text inputs
 */

import { Request, Response, NextFunction } from 'express';
import validator from 'validator';
import { JSDOM } from 'jsdom';
import DOMPurifyLib from 'dompurify';

const window = new JSDOM('').window;
const DOMPurify = DOMPurifyLib(window);

/**
 * Sanitize string input
 * - Escape HTML entities
 * - Trim whitespace
 * - Limit length
 */
export function sanitizeString(input: string, maxLength = 500): string {
  // Trim and limit length
  let sanitized = validator.trim(input).slice(0, maxLength);
  
  // Remove HTML tags and escape entities
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  
  return sanitized;
}

/**
 * Validate and sanitize search query
 */
export function validateSearchQuery(query: string): { valid: boolean; error?: string } {
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Query must be a non-empty string' };
  }
  
  // Trim first
  const trimmed = validator.trim(query);
  
  if (trimmed.length < 3) {
    return { valid: false, error: 'Query must be at least 3 characters' };
  }
  
  if (trimmed.length > 500) {
    return { valid: false, error: 'Query must be less than 500 characters' };
  }
  
  return { valid: true };
}

/**
 * Express middleware: sanitize request body
 */
export function sanitizeRequestBody(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      } else {
        // Ignore complex types (arrays, objects) for security
        continue;
      }
    }
    
    req.body = sanitized;
  }
  
  next();
}

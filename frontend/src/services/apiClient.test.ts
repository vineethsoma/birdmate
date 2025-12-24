/**
 * API client tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchBirds, getBird, APIError } from './apiClient';
import type { SearchResponse, Bird } from '../../../shared/types/index.js';

// Mock fetch
global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('searchBirds', () => {
    it('should make POST request to /search', async () => {
      const mockResponse: SearchResponse = {
        query: 'red bird',
        results: [],
        total: 0,
      };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });
      
      const result = await searchBirds({ query: 'red bird' });
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/search'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ query: 'red bird' }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
    
    it('should throw APIError on server error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query too short',
          },
        }),
      });
      
      await expect(searchBirds({ query: 'ab' })).rejects.toThrow(APIError);
    });
  });
  
  describe('getBird', () => {
    it('should make GET request to /birds/:id', async () => {
      const mockBird: Bird = {
        id: 'norcad',
        commonName: 'Northern Cardinal',
        scientificName: 'Cardinalis cardinalis',
      };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBird,
      });
      
      const result = await getBird('norcad');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/birds/norcad'),
        expect.any(Object)
      );
      expect(result).toEqual(mockBird);
    });
  });
});

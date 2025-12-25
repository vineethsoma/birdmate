/**
 * useSearch Hook (T045)
 * 
 * Custom hook for bird search using TanStack Query
 * 
 * Features:
 * - Automatic caching (5 minutes staleTime)
 * - Error handling
 * - Conditional execution (enabled when query >= 3 chars)
 * - Response transformation to BirdSearchResult format
 */

import { useQuery } from '@tanstack/react-query';
import type { SearchResponse, SearchResult } from '../../../shared/types';
import type { BirdSearchResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

export interface UseSearchOptions {
  /** Override default enabled condition */
  enabled?: boolean;
}

/**
 * Transform API SearchResult to frontend BirdSearchResult
 */
function transformResults(apiResults: SearchResult[]): BirdSearchResult[] {
  return apiResults.map((result) => ({
    id: result.bird.id,
    commonName: result.bird.commonName,
    scientificName: result.bird.scientificName,
    thumbnailUrl: result.bird.images?.[0]?.url || null,
    score: result.score,
    fieldMarks: result.matchedFeatures || [],
  }));
}

/**
 * Hook for searching birds by natural language query
 * 
 * @param query - Natural language description of bird
 * @param options - Optional configuration
 * @returns TanStack Query result with transformed data
 */
export const useSearch = (query: string, options?: UseSearchOptions) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async (): Promise<{
      results: BirdSearchResult[];
      total: number;
      query: string;
    }> => {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response || !response.ok) {
        let errorData: any = {};
        if (response && response.json) {
          try {
            errorData = await response.json();
          } catch {
            // Ignore json parsing errors
          }
        }
        const statusText = response?.statusText || 'Unknown Error';
        throw new Error(errorData.error || `Search failed: ${statusText}`);
      }

      const data: SearchResponse = await response.json();

      return {
        query: data.query,
        results: transformResults(data.results),
        total: data.total,
      };
    },
    enabled: options?.enabled ?? query.length >= 3,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    // Remove retry override - use QueryClient default for flexibility in tests
  });
};

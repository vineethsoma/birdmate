/**
 * useSearch Hook Tests
 * 
 * TDD - Write tests FIRST, verify they FAIL, then implement
 * 
 * Tests cover:
 * - Query execution with TanStack Query
 * - Caching behavior (5 minutes staleTime)
 * - Error handling
 * - Conditional execution (enabled only when query >= 3 chars)
 * - API response transformation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSearch } from '../../src/hooks/useSearch';
import type { ReactNode } from 'react';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Create a wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for tests
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSearch', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Query Execution', () => {
    it('should call API with correct endpoint and payload', async () => {
      const mockResponse = {
        query: 'red bird',
        results: [],
        total: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useSearch('red bird'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/search'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'red bird' }),
        })
      );
    });

    it('should return search results on successful query', async () => {
      const mockApiResponse = {
        query: 'blue jay',
        results: [
          {
            bird: {
              id: 'blujay',
              commonName: 'Blue Jay',
              scientificName: 'Cyanocitta cristata',
            },
            score: 0.95,
            matchedFeatures: ['blue plumage', 'crested head'],
          },
        ],
        total: 1,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const { result } = renderHook(() => useSearch('blue jay'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Hook transforms the data
      const expectedTransformed = {
        query: 'blue jay',
        results: [
          {
            id: 'blujay',
            commonName: 'Blue Jay',
            scientificName: 'Cyanocitta cristata',
            thumbnailUrl: null,
            score: 0.95,
            fieldMarks: ['blue plumage', 'crested head'],
          },
        ],
        total: 1,
      };
      expect(result.current.data).toEqual(expectedTransformed);
    });

    it('should transform API response to BirdSearchResult format', async () => {
      const mockResponse = {
        query: 'red chest',
        results: [
          {
            bird: {
              id: 'amerob',
              commonName: 'American Robin',
              scientificName: 'Turdus migratorius',
              images: [
                {
                  id: 1,
                  url: 'https://example.com/robin.jpg',
                  photographer: 'Test',
                  license: 'CC BY-NC-SA',
                  isPrimary: true,
                },
              ],
            },
            score: 0.92,
            matchedFeatures: ['red breast', 'gray back'],
          },
        ],
        total: 1,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useSearch('red chest'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.results).toHaveLength(1);
    });
  });

  describe('Conditional Execution', () => {
    it('should not execute query when query length < 3', () => {
      const { result } = renderHook(() => useSearch('ab'), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should execute query when query length >= 3', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ query: 'red', results: [], total: 0 }),
      });

      const { result } = renderHook(() => useSearch('red'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    it('should respect enabled option override', () => {
      const { result } = renderHook(
        () => useSearch('red bird', { enabled: false }),
        {
          wrapper: createWrapper(),
        }
      );

      expect(result.current.isLoading).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should execute when enabled=true even for short query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ query: 'ab', results: [], total: 0 }),
      });

      const { result } = renderHook(() => useSearch('ab', { enabled: true }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useSearch('red bird'), {
        wrapper: createWrapper(),
      });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 3000 }
      );

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('should handle API error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid query' }),
      });

      const { result } = renderHook(() => useSearch('red bird'), {
        wrapper: createWrapper(),
      });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 3000 }
      );
    });

    it('should throw error with descriptive message on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const { result } = renderHook(() => useSearch('testquery'), {
        wrapper: createWrapper(),
      });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
          expect(result.current.error?.message).toContain('Search failed');
        },
        { timeout: 3000 }
      );
    });

    it('should retry failed requests once', async () => {
      // First call fails, second succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            query: 'testquery',
            results: [],
            total: 0,
          }),
        });

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
          },
        },
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useSearch('testquery'), { wrapper });

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBe(true);
        },
        { timeout: 5000 }
      );

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Caching Behavior', () => {
    it('should cache results for 5 minutes', async () => {
      const mockResponse = {
        query: 'cached query',
        results: [],
        total: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: false,
          },
        },
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      // First render
      const { result, rerender } = renderHook(() => useSearch('cached query'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second render with same query - should use cache
      rerender();

      expect(mockFetch).toHaveBeenCalledTimes(1); // Still only 1 call
    });

    it('should use unique cache keys for different queries', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ query: 'query1', results: [], total: 0 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ query: 'query2', results: [], total: 0 }),
        });

      const wrapper = createWrapper();

      // First query
      const { result: result1 } = renderHook(() => useSearch('query1'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
      });

      // Second query - should trigger new request
      const { result: result2 } = renderHook(() => useSearch('query2'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result2.current.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Loading States', () => {
    it('should set isLoading=true while fetching', () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({ query: 'test', results: [], total: 0 }),
              });
            }, 100);
          })
      );

      const { result } = renderHook(() => useSearch('red bird'), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should set isLoading=false after success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ query: 'test', results: [], total: 0 }),
      });

      const { result } = renderHook(() => useSearch('red bird'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});

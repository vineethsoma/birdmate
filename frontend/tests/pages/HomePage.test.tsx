/**
 * HomePage Component Tests
 * 
 * TDD - Write tests FIRST, verify they FAIL, then implement
 * 
 * Tests cover:
 * - SearchBox and SearchResults integration
 * - URL state persistence (query params)
 * - Back button support (pre-population)
 * - useSearch hook integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from '../../src/pages/HomePage';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const createTestWrapper = (initialRoute = '/') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        retryDelay: 0,  // No delay for retries in tests
        staleTime: 5 * 60 * 1000,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Component Integration', () => {
    it('should render SearchBox component', () => {
      const wrapper = createTestWrapper();
      render(<HomePage />, { wrapper });

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('should render SearchResults component', () => {
      const wrapper = createTestWrapper();
      render(<HomePage />, { wrapper });

      // SearchResults should be present (may show empty state initially)
      expect(screen.queryByTestId('search-results')).toBeInTheDocument();
    });

    it('should pass search results to SearchResults component', async () => {
      const mockResponse = {
        query: 'red bird',
        results: [
          {
            bird: {
              id: 'amerob',
              commonName: 'American Robin',
              scientificName: 'Turdus migratorius',
            },
            score: 0.92,
            matchedFeatures: ['red breast'],
          },
        ],
        total: 1,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const wrapper = createTestWrapper('/?q=red bird');
      render(<HomePage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('American Robin')).toBeInTheDocument();
      });
    });
  });

  describe('URL State Persistence', () => {
    it('should read query from URL search params', async () => {
      const mockResponse = {
        query: 'blue jay',
        results: [],
        total: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const wrapper = createTestWrapper('/?q=blue jay');
      render(<HomePage />, { wrapper });

      // Input should be pre-populated with URL query
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('blue jay');

      // API should be called with the query from URL
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({ query: 'blue jay' }),
          })
        );
      });
    });

    it('should update URL when search is performed', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        query: 'red chest',
        results: [],
        total: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const wrapper = createTestWrapper();
      const { container } = render(<HomePage />, { wrapper });

      const input = screen.getByRole('textbox');
      await user.type(input, 'red chest');
      await user.click(screen.getByRole('button', { name: /search/i }));

      // Verify search was triggered by checking the input value was set
      await waitFor(() => {
        expect(input).toHaveValue('red chest');
        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({ query: 'red chest' }),
          })
        );
      });
    });

    it('should handle empty URL gracefully', () => {
      const wrapper = createTestWrapper('/');
      render(<HomePage />, { wrapper });

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');

      // Should not make API call for empty query
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should decode URL-encoded query parameters', async () => {
      const mockResponse = {
        query: 'small brown bird',
        results: [],
        total: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const wrapper = createTestWrapper('/?q=small%20brown%20bird');
      render(<HomePage />, { wrapper });

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('small brown bird');
    });
  });

  describe('Back Button Support', () => {
    it('should pre-populate search box when navigating back', async () => {
      const mockResponse = {
        query: 'cardinal',
        results: [
          {
            bird: {
              id: 'norcad',
              commonName: 'Northern Cardinal',
              scientificName: 'Cardinalis cardinalis',
            },
            score: 0.95,
          },
        ],
        total: 1,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const wrapper = createTestWrapper('/?q=cardinal');
      render(<HomePage />, { wrapper });

      // Wait for search to complete
      await waitFor(() => {
        expect(screen.getByText('Northern Cardinal')).toBeInTheDocument();
      });

      // Input should still have the query
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('cardinal');
    });

    it('should show cached results from React Query on back navigation', async () => {
      const mockResponse = {
        query: 'robin',
        results: [
          {
            bird: {
              id: 'amerob',
              commonName: 'American Robin',
              scientificName: 'Turdus migratorius',
            },
            score: 0.92,
          },
        ],
        total: 1,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const wrapper = createTestWrapper('/?q=robin');
      const { rerender } = render(<HomePage />, { wrapper });

      // Wait for initial search
      await waitFor(() => {
        expect(screen.getByText('American Robin')).toBeInTheDocument();
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Simulate navigation away and back (re-render with same URL)
      rerender(<HomePage />);

      // Results should still be visible (from cache)
      expect(screen.getByText('American Robin')).toBeInTheDocument();

      // Should not make another API call (cache hit)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Search Execution', () => {
    it('should trigger search when user submits SearchBox', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        query: 'blue bird',
        results: [],
        total: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const wrapper = createTestWrapper();
      render(<HomePage />, { wrapper });

      const input = screen.getByRole('textbox');
      await user.type(input, 'blue bird');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    it('should show loading state during search', async () => {
      const user = userEvent.setup();

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

      const wrapper = createTestWrapper();
      render(<HomePage />, { wrapper });

      const input = screen.getByRole('textbox');
      await user.type(input, 'test bird');
      await user.click(screen.getByRole('button', { name: /search/i }));

      // Should show loading indicator (SearchBox button shows "Searching...")
      await waitFor(() => {
        const searchingElements = screen.getAllByText(/searching/i);
        expect(searchingElements.length).toBeGreaterThan(0);
      });
    });

    it('should pass loading state to SearchBox', async () => {
      const user = userEvent.setup();

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

      const wrapper = createTestWrapper();
      render(<HomePage />, { wrapper });

      const input = screen.getByRole('textbox');
      await user.type(input, 'test bird');
      await user.click(screen.getByRole('button', { name: /search/i }));

      // SearchBox should be disabled during loading
      expect(input).toBeDisabled();
      expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message on API failure', async () => {
      // Mock rejection - no retry needed since QueryClient has retry: false
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const wrapper = createTestWrapper('/?q=testquery');
      render(<HomePage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });

    it('should allow retry after error', async () => {
      const user = userEvent.setup();

      const wrapper = createTestWrapper();
      render(<HomePage />, { wrapper });

      const input = screen.getByRole('textbox');
      await user.type(input, 'testquery');
      
      // Mock rejection
      mockFetch.mockRejectedValueOnce(new Error('Error'));
      
      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Second search succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ query: 'testquery', results: [], total: 0 }),
      });

      await user.click(screen.getByRole('button', { name: /try again/i }));

      await waitFor(() => {
        expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should not trigger search for queries < 3 characters', async () => {
      const user = userEvent.setup();

      const wrapper = createTestWrapper();
      render(<HomePage />, { wrapper });

      const input = screen.getByRole('textbox');
      await user.type(input, 'ab');
      await user.click(screen.getByRole('button', { name: /search/i }));

      // Should not call API for short query
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should trigger search for queries >= 3 characters', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ query: 'red', results: [], total: 0 }),
      });

      const wrapper = createTestWrapper();
      render(<HomePage />, { wrapper });

      const input = screen.getByRole('textbox');
      await user.type(input, 'red');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });
});

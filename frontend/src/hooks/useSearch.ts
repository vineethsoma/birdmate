import { useState } from 'react';
import { SearchResponse } from '@shared/types';
import { apiRequest, ApiClientError } from '../services/apiClient';

interface UseSearchResult {
  results: SearchResponse['results'];
  isLoading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  query: string;
}

export function useSearch(): UseSearchResult {
  const [results, setResults] = useState<SearchResponse['results']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const search = async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);
    setQuery(searchQuery);

    try {
      const response = await apiRequest<SearchResponse>('/v1/search', {
        method: 'POST',
        body: JSON.stringify({ query: searchQuery, limit: 10 }),
      });

      setResults(response.results);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    results,
    isLoading,
    error,
    search,
    query,
  };
}

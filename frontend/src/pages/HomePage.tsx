/**
 * HomePage Component (T046)
 * 
 * Main search page integrating SearchBox and SearchResults
 * 
 * Features:
 * - URL state persistence (query params)
 * - Back button support (pre-population from URL)
 * - useSearch hook integration
 * - Result caching via TanStack Query
 */

import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBox } from '../components/SearchBox';
import { SearchResults } from '../components/SearchResults';
import { useSearch } from '../hooks/useSearch';

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  // Execute search using TanStack Query hook
  const { data, isLoading, error, refetch } = useSearch(query, {
    enabled: query.length >= 3,
  });

  const handleSearch = (newQuery: string) => {
    // Update URL with new query (enables back button support)
    setSearchParams({ q: newQuery });
  };

  const handleRetry = () => {
    refetch();
  };

  const handleBirdClick = (birdId: string) => {
    // TODO: Navigate to bird detail page
    console.log('Navigate to bird:', birdId);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>🐦 Birdmate</h1>
        <p style={styles.subtitle}>
          Natural Language Bird Search - Describe any bird to find it
        </p>
      </header>

      {/* Search Box */}
      <div style={styles.searchSection}>
        <SearchBox
          onSearch={handleSearch}
          loading={isLoading}
          initialQuery={query}
        />
      </div>

      {/* Search Results */}
      <div style={styles.resultsSection}>
        <SearchResults
          results={data?.results || []}
          loading={isLoading}
          error={error}
          query={query}
          onBirdClick={handleBirdClick}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
};

// Basic inline styles for MVP
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '24px',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '48px',
  },
  title: {
    fontSize: '42px',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#6b7280',
  },
  searchSection: {
    marginBottom: '32px',
  },
  resultsSection: {
    width: '100%',
  },
};

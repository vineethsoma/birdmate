/**
 * SearchResults Component (T044)
 * 
 * Display grid of bird search results with loading and error states
 * 
 * Features:
 * - Grid layout of BirdCard components
 * - Loading spinner during search
 * - Empty state with helpful message
 * - Error state with retry suggestion
 * - Ambiguity indicator for >10 results
 */

import React from 'react';
import { BirdCard } from './BirdCard';
import { Loading } from './shared/Loading';
import type { BirdSearchResult } from '../types';

export interface SearchResultsProps {
  /** Array of bird search results */
  results: BirdSearchResult[];
  /** Loading state during API call */
  loading: boolean;
  /** Error object if API call failed */
  error: Error | null;
  /** Original query text */
  query: string;
  /** Optional click handler for bird cards */
  onBirdClick?: (birdId: string) => void;
  /** Optional retry handler for failed searches */
  onRetry?: () => void;
}

const MAX_DISPLAYED_RESULTS = 10;

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  error,
  query,
  onBirdClick,
  onRetry,
}) => {
  // Loading state
  if (loading) {
    return (
      <div data-testid="search-results" style={styles.container}>
        <Loading />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div data-testid="search-results" style={styles.container}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.errorTitle}>Something went wrong</h2>
          <p style={styles.errorMessage}>
            Unable to search for birds. Please try again.
          </p>
          <p style={styles.errorDetail}>{error.message}</p>
          {onRetry && (
            <button onClick={onRetry} style={styles.retryButton}>
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // Empty state (only show if query is not empty)
  if (results.length === 0 && query.trim().length > 0) {
    return (
      <div data-testid="search-results" style={styles.container}>
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIcon}>🔍</div>
          <h2 style={styles.emptyTitle}>
            No birds match &quot;{query}&quot;
          </h2>
          <p style={styles.emptyMessage}>
            Try adjusting your search. Use descriptive terms like colors, size,
            habitat, or behaviors.
          </p>
        </div>
      </div>
    );
  }

  // Results state
  const displayedResults = results.slice(0, MAX_DISPLAYED_RESULTS);
  const hasMoreResults = results.length > MAX_DISPLAYED_RESULTS;

  return (
    <div data-testid="search-results" style={styles.container}>
      {results.length > 0 && (
        <div style={styles.header}>
          <p style={styles.resultCount}>
            Found {results.length} bird{results.length === 1 ? '' : 's'}
          </p>
          {hasMoreResults && (
            <p style={styles.ambiguityIndicator}>
              Many birds match this description. Showing top {MAX_DISPLAYED_RESULTS}{' '}
              results.
            </p>
          )}
        </div>
      )}

      <div style={styles.grid}>
        {displayedResults.map((bird) => (
          <BirdCard key={bird.id} bird={bird} onClick={onBirdClick} />
        ))}
      </div>
    </div>
  );
};

// Basic inline styles for MVP
const styles = {
  container: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 0',
  },
  header: {
    marginBottom: '24px',
  },
  resultCount: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  ambiguityIndicator: {
    fontSize: '14px',
    color: '#f59e0b',
    fontWeight: 500,
    backgroundColor: '#fef3c7',
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #fde68a',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  // Empty state
  emptyContainer: {
    textAlign: 'center' as const,
    padding: '64px 24px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#111827',
    marginBottom: '12px',
  },
  emptyMessage: {
    fontSize: '16px',
    color: '#6b7280',
    maxWidth: '500px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  // Error state
  errorContainer: {
    textAlign: 'center' as const,
    padding: '64px 24px',
  },
  errorIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#dc2626',
    marginBottom: '12px',
  },
  errorMessage: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  errorDetail: {
    fontSize: '14px',
    color: '#9ca3af',
    fontFamily: 'monospace',
    marginBottom: '16px',
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: '16px',
  },
};

import { BirdSearchResult } from '@shared/types';
import { BirdCard } from './BirdCard';
import { Loading } from './shared/Loading';
import './SearchResults.css';

interface SearchResultsProps {
  results: BirdSearchResult[];
  isLoading: boolean;
  query: string;
  error: string | null;
}

export function SearchResults({ results, isLoading, query, error }: SearchResultsProps) {
  if (isLoading) {
    return <Loading message="Searching for birds..." />;
  }

  if (error) {
    return (
      <div className="search-results-error" role="alert">
        <h3>Search Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!query) {
    return null;
  }

  if (results.length === 0) {
    return (
      <div className="search-results-empty">
        <h3>No birds found</h3>
        <p>No birds match your description "{query}".</p>
        <p>Try adjusting your search with different colors, sizes, or behaviors.</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="search-results-header">
        <h2>Found {results.length} bird{results.length !== 1 ? 's' : ''}</h2>
        <p className="search-results-query">Searching for: "{query}"</p>
      </div>
      <div className="search-results-grid">
        {results.map((result) => (
          <BirdCard key={result.bird.id} result={result} />
        ))}
      </div>
    </div>
  );
}

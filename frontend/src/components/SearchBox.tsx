import { useState, FormEvent } from 'react';
import './SearchBox.css';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  isLoading?: boolean;
}

export function SearchBox({ onSearch, initialQuery = '', isLoading = false }: SearchBoxProps) {
  const [query, setQuery] = useState(initialQuery);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const trimmed = query.trim();
    
    // Validation
    if (trimmed.length === 0) {
      setError('Please describe the bird you saw');
      return;
    }

    if (trimmed.length > 500) {
      setError('Description is too long (max 500 characters)');
      return;
    }

    setError(null);
    onSearch(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="search-box">
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Describe the bird you saw (color, size, behavior, location)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
          aria-label="Bird description"
          autoComplete="off"
        />
        <button
          type="submit"
          className="search-button"
          disabled={isLoading || query.trim().length === 0}
          aria-label="Search"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {error && (
        <div className="search-error" role="alert">
          {error}
        </div>
      )}
      <div className="search-help">
        Try: "red chest with grey back" or "small hovering bird"
      </div>
    </form>
  );
}

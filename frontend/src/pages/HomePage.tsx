import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBox } from '../components/SearchBox';
import { SearchResults } from '../components/SearchResults';
import { useSearch } from '../hooks/useSearch';
import './HomePage.css';

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { results, isLoading, error, search, query } = useSearch();

  // Get initial query from URL
  const urlQuery = searchParams.get('q') || '';

  // Run search on mount if URL has query
  useEffect(() => {
    if (urlQuery && !query) {
      search(urlQuery);
    }
  }, [urlQuery]); // Only run once on mount

  const handleSearch = (searchQuery: string) => {
    search(searchQuery);
    // Update URL with query parameter for back button support
    setSearchParams({ q: searchQuery });
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="home-title">🐦 BirdMate</h1>
        <p className="home-subtitle">Natural Language Bird Search</p>
      </header>

      <main className="home-content">
        <SearchBox
          onSearch={handleSearch}
          initialQuery={urlQuery}
          isLoading={isLoading}
        />

        <SearchResults
          results={results}
          isLoading={isLoading}
          query={query}
          error={error}
        />
      </main>

      <footer className="home-footer">
        <p>
          Powered by eBird taxonomy and Macaulay Library •{' '}
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

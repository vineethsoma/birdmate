/**
 * SearchBox Component (T042)
 * 
 * Controlled input field with validation for natural language bird search
 * 
 * Features:
 * - Input validation (1-500 chars)
 * - Submit on button click or Enter key
 * - Disabled state during loading
 * - Pre-population support for back button
 */

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';

export interface SearchBoxProps {
  /** Callback fired when search is submitted with valid query */
  onSearch: (query: string) => void;
  /** Loading state disables input and button */
  loading?: boolean;
  /** Pre-populate input (for back button support) */
  initialQuery?: string;
}

const MAX_QUERY_LENGTH = 500;
const MIN_QUERY_LENGTH = 1;

export const SearchBox: React.FC<SearchBoxProps> = ({
  onSearch,
  loading = false,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [error, setError] = useState<string | null>(null);

  // Update query when initialQuery changes (back button navigation)
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Validate length
    if (value.length > MAX_QUERY_LENGTH) {
      setError(`Query too long (max ${MAX_QUERY_LENGTH} characters)`);
    } else {
      setError(null);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedQuery = query.trim();

    // Don't submit empty or whitespace-only queries
    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      return;
    }

    // Don't submit if there's a validation error
    if (error) {
      return;
    }

    onSearch(trimmedQuery);
  };

  const isInvalid = error !== null || query.length > MAX_QUERY_LENGTH;
  const isDisabled = loading || isInvalid;

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.container}>
        <input
          type="text"
          role="textbox"
          value={query}
          onChange={handleInputChange}
          placeholder="Describe a bird (e.g., 'red chest with grey back')"
          disabled={loading}
          style={{
            ...styles.input,
            ...(loading ? styles.inputDisabled : {}),
          }}
          aria-label="Bird search query"
          aria-invalid={isInvalid}
        />
        <button
          type="submit"
          disabled={isDisabled}
          style={{
            ...styles.button,
            ...(isDisabled ? styles.buttonDisabled : {}),
          }}
          aria-label="Search"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {error && (
        <div style={styles.error} role="alert">
          {error}
        </div>
      )}
      {loading && (
        <div style={styles.loadingText} aria-live="polite">
          Searching for birds...
        </div>
      )}
    </form>
  );
};

// Basic inline styles for MVP
const styles = {
  form: {
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
  },
  container: {
    display: 'flex',
    gap: '12px',
    marginBottom: '8px',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s',
  } as React.CSSProperties,
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    cursor: 'not-allowed',
  } as React.CSSProperties,
  button: {
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: 600,
    color: 'white',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  buttonDisabled: {
    backgroundColor: '#93c5fd',
    cursor: 'not-allowed',
  } as React.CSSProperties,
  error: {
    color: '#dc2626',
    fontSize: '14px',
    marginTop: '4px',
  } as React.CSSProperties,
  loadingText: {
    color: '#6b7280',
    fontSize: '14px',
    marginTop: '4px',
  } as React.CSSProperties,
};

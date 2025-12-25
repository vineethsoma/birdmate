/**
 * SearchResults Component Tests (T031)
 * 
 * TDD - Write tests FIRST, verify they FAIL, then implement
 * 
 * Tests cover:
 * - Result rendering (grid of BirdCard components)
 * - Loading state (spinner display)
 * - Empty state ("No results found")
 * - Error state (API failure handling)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SearchResults } from '../../src/components/SearchResults';
import type { BirdSearchResult } from '../../src/types';

const mockBirds: BirdSearchResult[] = [
  {
    id: 'amerob',
    commonName: 'American Robin',
    scientificName: 'Turdus migratorius',
    thumbnailUrl: 'https://example.com/robin.jpg',
    score: 0.92,
    fieldMarks: ['red-orange breast', 'gray back'],
  },
  {
    id: 'blujay',
    commonName: 'Blue Jay',
    scientificName: 'Cyanocitta cristata',
    thumbnailUrl: 'https://example.com/bluejay.jpg',
    score: 0.85,
    fieldMarks: ['blue plumage', 'black necklace'],
  },
  {
    id: 'norcad',
    commonName: 'Northern Cardinal',
    scientificName: 'Cardinalis cardinalis',
    thumbnailUrl: null,
    score: 0.78,
    fieldMarks: ['bright red', 'crested head'],
  },
];

describe('SearchResults', () => {
  describe('Result Rendering', () => {
    it('should render a grid of BirdCard components', () => {
      render(
        <SearchResults
          results={mockBirds}
          loading={false}
          error={null}
          query="red bird"
        />
      );

      expect(screen.getByText('American Robin')).toBeInTheDocument();
      expect(screen.getByText('Blue Jay')).toBeInTheDocument();
      expect(screen.getByText('Northern Cardinal')).toBeInTheDocument();
    });

    it('should display results in order of score', () => {
      render(
        <SearchResults
          results={mockBirds}
          loading={false}
          error={null}
          query="red bird"
        />
      );

      const cards = screen.getAllByTestId('bird-card');
      expect(cards).toHaveLength(3);
      
      // First card should be American Robin (highest score)
      expect(cards[0]).toHaveTextContent('American Robin');
    });

    it('should limit display to 10 results maximum', () => {
      const manyBirds: BirdSearchResult[] = Array.from({ length: 15 }, (_, i) => ({
        id: `bird${i}`,
        commonName: `Bird ${i}`,
        scientificName: `Testus bird${i}`,
        thumbnailUrl: `https://example.com/bird${i}.jpg`,
        score: 0.9 - i * 0.01,
        fieldMarks: ['test mark'],
      }));

      render(
        <SearchResults
          results={manyBirds}
          loading={false}
          error={null}
          query="test"
        />
      );

      const cards = screen.getAllByTestId('bird-card');
      expect(cards).toHaveLength(10);
    });

    it('should show ambiguity indicator when more than 10 results', () => {
      const manyBirds: BirdSearchResult[] = Array.from({ length: 15 }, (_, i) => ({
        id: `bird${i}`,
        commonName: `Bird ${i}`,
        scientificName: `Testus bird${i}`,
        thumbnailUrl: null,
        score: 0.9 - i * 0.01,
        fieldMarks: [],
      }));

      render(
        <SearchResults
          results={manyBirds}
          loading={false}
          error={null}
          query="small brown bird"
        />
      );

      expect(screen.getByText(/many birds match/i)).toBeInTheDocument();
    });

    it('should not show ambiguity indicator when 10 or fewer results', () => {
      render(
        <SearchResults
          results={mockBirds}
          loading={false}
          error={null}
          query="specific bird"
        />
      );

      expect(screen.queryByText(/many birds match/i)).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading spinner when loading=true', () => {
      render(
        <SearchResults
          results={[]}
          loading={true}
          error={null}
          query="red bird"
        />
      );

      expect(screen.getByText(/searching/i)).toBeInTheDocument();
    });

    it('should not display results during loading', () => {
      render(
        <SearchResults
          results={mockBirds}
          loading={true}
          error={null}
          query="red bird"
        />
      );

      expect(screen.queryByTestId('bird-card')).not.toBeInTheDocument();
    });

    it('should hide loading spinner when loading=false', () => {
      render(
        <SearchResults
          results={mockBirds}
          loading={false}
          error={null}
          query="red bird"
        />
      );

      expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state message when no results', () => {
      render(
        <SearchResults
          results={[]}
          loading={false}
          error={null}
          query="purple eagle"
        />
      );

      expect(screen.getByText(/no birds match/i)).toBeInTheDocument();
      expect(screen.getByText(/purple eagle/i)).toBeInTheDocument();
    });

    it('should not display empty state during loading', () => {
      render(
        <SearchResults
          results={[]}
          loading={true}
          error={null}
          query="test"
        />
      );

      expect(screen.queryByText(/no birds match/i)).not.toBeInTheDocument();
    });

    it('should not display empty state when query is empty', () => {
      render(
        <SearchResults
          results={[]}
          loading={false}
          error={null}
          query=""
        />
      );

      expect(screen.queryByText(/no birds match/i)).not.toBeInTheDocument();
    });

    it('should suggest adjusting search in empty state', () => {
      render(
        <SearchResults
          results={[]}
          loading={false}
          error={null}
          query="nonexistent bird"
        />
      );

      expect(screen.getByText(/try adjusting your search/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error occurs', () => {
      const error = new Error('Network error');
      
      render(
        <SearchResults
          results={[]}
          loading={false}
          error={error}
          query="red bird"
        />
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should not display results when error occurs', () => {
      const error = new Error('API failed');
      
      render(
        <SearchResults
          results={mockBirds}
          loading={false}
          error={error}
          query="red bird"
        />
      );

      expect(screen.queryByTestId('bird-card')).not.toBeInTheDocument();
    });

    it('should display retry suggestion in error state', () => {
      const error = new Error('Timeout');
      
      render(
        <SearchResults
          results={[]}
          loading={false}
          error={error}
          query="test"
        />
      );

      expect(screen.getByText(/try again/i)).toBeInTheDocument();
    });

    it('should hide error message when no error', () => {
      render(
        <SearchResults
          results={mockBirds}
          loading={false}
          error={null}
          query="red bird"
        />
      );

      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });
  });

  describe('Result Count Display', () => {
    it('should show result count when results exist', () => {
      render(
        <SearchResults
          results={mockBirds}
          loading={false}
          error={null}
          query="red bird"
        />
      );

      expect(screen.getByText(/found 3 birds/i)).toBeInTheDocument();
    });

    it('should not show result count during loading', () => {
      render(
        <SearchResults
          results={[]}
          loading={true}
          error={null}
          query="test"
        />
      );

      expect(screen.queryByText(/found/i)).not.toBeInTheDocument();
    });
  });
});

/**
 * BirdCard Component Tests
 * 
 * TDD - Write tests FIRST, verify they FAIL, then implement
 * 
 * Tests cover:
 * - Thumbnail rendering with fallback
 * - Bird names display (common and scientific)
 * - Field marks display (max 2)
 * - Click handler functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BirdCard } from '../../src/components/BirdCard';
import type { BirdSearchResult } from '../../src/types';

const mockBird: BirdSearchResult = {
  id: 'amerob',
  commonName: 'American Robin',
  scientificName: 'Turdus migratorius',
  thumbnailUrl: 'https://example.com/robin.jpg',
  score: 0.92,
  fieldMarks: ['red-orange breast', 'gray back'],
};

describe('BirdCard', () => {
  describe('Basic Rendering', () => {
    it('should render bird common name in bold', () => {
      render(<BirdCard bird={mockBird} />);
      
      const commonName = screen.getByText('American Robin');
      expect(commonName).toBeInTheDocument();
      expect(commonName.tagName).toBe('STRONG');
    });

    it('should render bird scientific name in italic', () => {
      render(<BirdCard bird={mockBird} />);
      
      const scientificName = screen.getByText('Turdus migratorius');
      expect(scientificName).toBeInTheDocument();
      expect(scientificName.tagName).toBe('EM');
    });

    it('should have bird-card test id', () => {
      render(<BirdCard bird={mockBird} />);
      
      const card = screen.getByTestId('bird-card');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Thumbnail Image', () => {
    it('should render thumbnail image when URL provided', () => {
      render(<BirdCard bird={mockBird} />);
      
      const img = screen.getByRole('img', { name: /american robin/i });
      expect(img).toHaveAttribute('src', 'https://example.com/robin.jpg');
    });

    it('should have alt text with bird name', () => {
      render(<BirdCard bird={mockBird} />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', expect.stringContaining('American Robin'));
    });

    it('should render fallback when thumbnailUrl is null', () => {
      const birdWithoutImage: BirdSearchResult = {
        ...mockBird,
        thumbnailUrl: null,
      };
      
      render(<BirdCard bird={birdWithoutImage} />);
      
      expect(screen.getByText(/no image/i)).toBeInTheDocument();
    });

    it('should render fallback icon when image fails to load', async () => {
      render(<BirdCard bird={mockBird} />);
      
      const img = screen.getByRole('img');
      
      // Simulate image load error
      img.dispatchEvent(new Event('error'));
      
      // Wait for fallback to appear
      expect(await screen.findByText(/no image/i)).toBeInTheDocument();
    });
  });

  describe('Field Marks Display', () => {
    it('should display field marks when provided', () => {
      render(<BirdCard bird={mockBird} />);
      
      expect(screen.getByText(/red-orange breast/i)).toBeInTheDocument();
      expect(screen.getByText(/gray back/i)).toBeInTheDocument();
    });

    it('should display maximum of 2 field marks', () => {
      const birdWithManyMarks: BirdSearchResult = {
        ...mockBird,
        fieldMarks: ['mark1', 'mark2', 'mark3', 'mark4'],
      };
      
      render(<BirdCard bird={birdWithManyMarks} />);
      
      expect(screen.getByText(/mark1/i)).toBeInTheDocument();
      expect(screen.getByText(/mark2/i)).toBeInTheDocument();
      expect(screen.queryByText(/mark3/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/mark4/i)).not.toBeInTheDocument();
    });

    it('should not crash when no field marks provided', () => {
      const birdWithoutMarks: BirdSearchResult = {
        ...mockBird,
        fieldMarks: [],
      };
      
      render(<BirdCard bird={birdWithoutMarks} />);
      
      expect(screen.getByText('American Robin')).toBeInTheDocument();
    });

    it('should display single field mark correctly', () => {
      const birdWithOneMark: BirdSearchResult = {
        ...mockBird,
        fieldMarks: ['bright red plumage'],
      };
      
      render(<BirdCard bird={birdWithOneMark} />);
      
      expect(screen.getByText(/bright red plumage/i)).toBeInTheDocument();
    });
  });

  describe('Click Interaction', () => {
    it('should call onClick handler when card is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();
      
      render(<BirdCard bird={mockBird} onClick={mockOnClick} />);
      
      const card = screen.getByTestId('bird-card');
      await user.click(card);
      
      expect(mockOnClick).toHaveBeenCalledWith('amerob');
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not crash when onClick is not provided', async () => {
      const user = userEvent.setup();
      
      render(<BirdCard bird={mockBird} />);
      
      const card = screen.getByTestId('bird-card');
      await user.click(card);
      
      // Should not throw error
      expect(card).toBeInTheDocument();
    });

    it('should be keyboard accessible with Enter key', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();
      
      render(<BirdCard bird={mockBird} onClick={mockOnClick} />);
      
      const card = screen.getByTestId('bird-card');
      card.focus();
      await user.keyboard('{Enter}');
      
      expect(mockOnClick).toHaveBeenCalledWith('amerob');
    });

    it('should have pointer cursor when onClick provided', () => {
      const mockOnClick = vi.fn();
      
      render(<BirdCard bird={mockBird} onClick={mockOnClick} />);
      
      const card = screen.getByTestId('bird-card');
      expect(card).toHaveStyle({ cursor: 'pointer' });
    });
  });

  describe('Score Display', () => {
    it('should display similarity score as percentage', () => {
      render(<BirdCard bird={mockBird} />);
      
      expect(screen.getByText('92%')).toBeInTheDocument();
    });

    it('should round score to nearest integer', () => {
      const birdWithFractionalScore: BirdSearchResult = {
        ...mockBird,
        score: 0.876,
      };
      
      render(<BirdCard bird={birdWithFractionalScore} />);
      
      expect(screen.getByText('88%')).toBeInTheDocument();
    });
  });
});

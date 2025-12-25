/**
 * SearchBox Component Tests (T030)
 * 
 * TDD - Write tests FIRST, verify they FAIL, then implement
 * 
 * Tests cover:
 * - Input handling (onChange, validation 1-500 chars)
 * - Submit behavior (onSubmit, keyboard Enter)
 * - Validation states (empty, too long, too short)
 * - Disabled state during loading
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBox } from '../../src/components/SearchBox';

describe('SearchBox', () => {
  describe('Input Handling', () => {
    it('should render input field with placeholder', () => {
      const mockOnSearch = vi.fn();
      render(<SearchBox onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText(/describe a bird/i);
      expect(input).toBeInTheDocument();
    });

    it('should update input value on user typing', async () => {
      const user = userEvent.setup();
      const mockOnSearch = vi.fn();
      render(<SearchBox onSearch={mockOnSearch} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'red bird');
      
      expect(input).toHaveValue('red bird');
    });

    it('should pre-populate input with initialQuery prop', () => {
      const mockOnSearch = vi.fn();
      render(<SearchBox onSearch={mockOnSearch} initialQuery="blue jay" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('blue jay');
    });

    it('should accept input up to 500 characters', async () => {
      const user = userEvent.setup();
      const mockOnSearch = vi.fn();
      render(<SearchBox onSearch={mockOnSearch} />);
      
      const longQuery = 'a'.repeat(500);
      const input = screen.getByRole('textbox');
      await user.type(input, longQuery);
      
      expect(input).toHaveValue(longQuery);
    });
  });

  describe('Submit Behavior', () => {
    it('should call onSearch when form is submitted', async () => {
      const user = userEvent.setup();
      const mockOnSearch = vi.fn();
      render(<SearchBox onSearch={mockOnSearch} />);
      
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /search/i });
      
      await user.type(input, 'red chest grey back');
      await user.click(submitButton);
      
      expect(mockOnSearch).toHaveBeenCalledWith('red chest grey back');
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
    });

    it('should submit on Enter key press', async () => {
      const user = userEvent.setup();
      const mockOnSearch = vi.fn();
      render(<SearchBox onSearch={mockOnSearch} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'small brown bird{Enter}');
      
      expect(mockOnSearch).toHaveBeenCalledWith('small brown bird');
    });

    it('should trim whitespace from query before submission', async () => {
      const user = userEvent.setup();
      const mockOnSearch = vi.fn();
      render(<SearchBox onSearch={mockOnSearch} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, '  blue jay  ');
      await user.click(screen.getByRole('button', { name: /search/i }));
      
      expect(mockOnSearch).toHaveBeenCalledWith('blue jay');
    });

    it('should not submit empty query', async () => {
      const user = userEvent.setup();
      const mockOnSearch = vi.fn();
      render(<SearchBox onSearch={mockOnSearch} />);
      
      const submitButton = screen.getByRole('button', { name: /search/i });
      await user.click(submitButton);
      
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should not submit whitespace-only query', async () => {
      const user = userEvent.setup();
      const mockOnSearch = vi.fn();
      render(<SearchBox onSearch={mockOnSearch} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, '   ');
      await user.click(screen.getByRole('button', { name: /search/i }));
      
      expect(mockOnSearch).not.toHaveBeenCalled();
    });
  });

  describe('Validation States', () => {
    it('should show error for query exceeding 500 characters', async () => {
      const user = userEvent.setup();
      const mockOnSearch = vi.fn();
      render(<SearchBox onSearch={mockOnSearch} />);
      
      const tooLongQuery = 'a'.repeat(501);
      const input = screen.getByRole('textbox');
      await user.type(input, tooLongQuery);
      
      expect(screen.getByText(/query too long/i)).toBeInTheDocument();
    });

    it('should disable submit button when query is invalid', async () => {
      const user = userEvent.setup();
      const mockOnSearch = vi.fn();
      render(<SearchBox onSearch={mockOnSearch} />);
      
      const tooLongQuery = 'a'.repeat(501);
      const input = screen.getByRole('textbox');
      await user.type(input, tooLongQuery);
      
      const submitButton = screen.getByRole('button', { name: /search/i });
      expect(submitButton).toBeDisabled();
    });

    it('should clear error when query becomes valid', async () => {
      const user = userEvent.setup();
      const mockOnSearch = vi.fn();
      render(<SearchBox onSearch={mockOnSearch} />);
      
      const input = screen.getByRole('textbox');
      
      // Type too long
      await user.type(input, 'a'.repeat(501));
      expect(screen.getByText(/query too long/i)).toBeInTheDocument();
      
      // Clear and type valid
      await user.clear(input);
      await user.type(input, 'red bird');
      expect(screen.queryByText(/query too long/i)).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should disable submit button during loading', () => {
      const mockOnSearch = vi.fn();
      render(<SearchBox onSearch={mockOnSearch} loading={true} />);
      
      const submitButton = screen.getByRole('button', { name: /search/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable input field during loading', () => {
      const mockOnSearch = vi.fn();
      render(<SearchBox onSearch={mockOnSearch} loading={true} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should show loading indicator when loading=true', () => {
      const mockOnSearch = vi.fn();
      render(<SearchBox onSearch={mockOnSearch} loading={true} />);
      
      const searchingElements = screen.getAllByText(/searching/i);
      expect(searchingElements.length).toBeGreaterThan(0);
    });

    it('should enable controls when loading=false', () => {
      const mockOnSearch = vi.fn();
      render(<SearchBox onSearch={mockOnSearch} loading={false} />);
      
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /search/i });
      
      expect(input).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
    });
  });
});

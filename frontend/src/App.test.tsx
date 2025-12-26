/**
 * App component integration tests
 * 
 * Tests routing, navigation, and QueryClient configuration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  beforeEach(() => {
    // Reset any router state
    window.history.pushState({}, '', '/');
  });

  describe('Home Page Routing', () => {
    it('should render home page at root path', () => {
      render(<App />);
      
      expect(screen.getByText('🐦 Birdmate')).toBeInTheDocument();
      expect(screen.getByText('Natural Language Bird Search')).toBeInTheDocument();
    });

    it('should display foundation phase message', () => {
      render(<App />);
      
      expect(screen.getByText(/Foundation phase complete/i)).toBeInTheDocument();
    });
  });

  describe('Bird Detail Page Routing', () => {
    it('should render bird detail page when navigating to /birds/:id', () => {
      // Set initial URL
      window.history.pushState({}, '', '/birds/norcad');
      
      render(<App />);
      
      expect(screen.getByText('Bird Details')).toBeInTheDocument();
      expect(screen.getByText(/Bird detail page coming soon/i)).toBeInTheDocument();
    });

    it('should accept any bird ID in route', () => {
      window.history.pushState({}, '', '/birds/test-bird-123');
      
      render(<App />);
      
      expect(screen.getByText('Bird Details')).toBeInTheDocument();
    });
  });

  describe('404 Page Routing', () => {
    it('should render 404 page at /404', () => {
      window.history.pushState({}, '', '/404');
      
      render(<App />);
      
      expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
    });

    it('should redirect unknown routes to 404', () => {
      window.history.pushState({}, '', '/nonexistent-page');
      
      render(<App />);
      
      // Should navigate to 404
      expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
    });

    it('should redirect deeply nested unknown routes to 404', () => {
      window.history.pushState({}, '', '/some/deeply/nested/path');
      
      render(<App />);
      
      expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
    });
  });

  describe('Navigation Structure', () => {
    it('should render without errors', () => {
      expect(() => render(<App />)).not.toThrow();
    });

    it('should have proper heading hierarchy on home page', () => {
      render(<App />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('🐦 Birdmate');
    });

    it('should have proper heading hierarchy on 404 page', () => {
      window.history.pushState({}, '', '/404');
      
      render(<App />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('404 - Page Not Found');
    });
  });

  describe('QueryClient Configuration', () => {
    it('should provide QueryClient to application', () => {
      // If QueryClient is not provided, React Query hooks would throw
      expect(() => render(<App />)).not.toThrow();
    });

    it('should render all routes with QueryClient provider', () => {
      const routes = [
        '/',
        '/birds/test',
        '/404',
        '/unknown',
      ];

      routes.forEach((route) => {
        window.history.pushState({}, '', route);
        
        expect(() => {
          render(<App />);
        }).not.toThrow();
      });
    });
  });

  describe('Route Parameters', () => {
    it('should accept numeric bird IDs', () => {
      window.history.pushState({}, '', '/birds/123');
      
      render(<App />);
      
      expect(screen.getByText('Bird Details')).toBeInTheDocument();
    });

    it('should accept alphanumeric bird IDs', () => {
      window.history.pushState({}, '', '/birds/norcad');
      
      render(<App />);
      
      expect(screen.getByText('Bird Details')).toBeInTheDocument();
    });

    it('should accept bird IDs with hyphens', () => {
      window.history.pushState({}, '', '/birds/northern-cardinal');
      
      render(<App />);
      
      expect(screen.getByText('Bird Details')).toBeInTheDocument();
    });
  });
});

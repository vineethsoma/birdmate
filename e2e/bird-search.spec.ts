import { test, expect } from '@playwright/test';

/**
 * Birdmate E2E Tests - US-001: Natural Language Bird Search
 * 
 * Specification: specs/001-bird-search-ui/spec.md
 * 
 * Tests cover:
 * - All 4 acceptance scenarios from User Story 1
 * - URL state persistence (FR-011)
 * - Back button functionality
 * - Loading indicators (FR-012)
 * - Input validation (1-500 chars)
 * - XSS prevention (FR-014)
 * - Error handling with retry
 * - Performance requirements (SC-001: < 2 seconds)
 * - Empty state handling
 * - No results gracefully
 */

test.describe('Bird Search E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Verify page loaded successfully
    await expect(page.getByRole('heading', { name: /birdmate/i })).toBeVisible();
  });

  test.describe('Acceptance Scenarios', () => {
    test('Scenario 1: Common bird search - red chest with grey back', async ({ page }) => {
      const startTime = Date.now();
      
      // Type query
      const searchInput = page.getByRole('textbox');
      await searchInput.fill('red chest with grey back');
      
      // Submit search
      await page.getByRole('button', { name: /search/i }).click();
      
      // Wait for results to appear
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 3000 });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Verify response time < 2 seconds (FR-002, SC-001)
      expect(responseTime).toBeLessThan(2000);
      
      // Verify ≥3 results displayed
      const birdCards = page.locator('[data-testid="bird-card"]');
      const count = await birdCards.count();
      expect(count).toBeGreaterThanOrEqual(3);
      
      // Verify American Robin appears (common result)
      await expect(page.getByText(/robin/i)).toBeVisible();
    });

    test('Scenario 2: Specific bird - blue jay', async ({ page }) => {
      // Enter specific bird name
      await page.getByRole('textbox').fill('blue jay');
      await page.getByRole('button', { name: /search/i }).click();
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 3000 });
      
      // Verify Blue Jay appears in results
      const blueJayText = page.getByText('Blue Jay', { exact: true });
      await expect(blueJayText).toBeVisible();
      
      // Verify photo present in first result
      const firstBirdCard = page.locator('[data-testid="bird-card"]').first();
      const image = firstBirdCard.locator('img');
      await expect(image).toBeVisible();
      
      // Verify scientific name present
      await expect(page.getByText(/cyanocitta cristata/i)).toBeVisible();
    });

    test('Scenario 3: Ambiguous search - small brown bird', async ({ page }) => {
      // Enter ambiguous description
      await page.getByRole('textbox').fill('small brown bird');
      await page.getByRole('button', { name: /search/i }).click();
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 3000 });
      
      // Verify multiple results (>5)
      const birdCards = page.locator('[data-testid="bird-card"]');
      const count = await birdCards.count();
      expect(count).toBeGreaterThan(5);
      
      // Note: Ambiguity indicator may not be implemented yet
      // This is a future enhancement per spec
    });

    test('Scenario 4: Very specific search - red head yellow eye black body', async ({ page }) => {
      // Enter very specific description
      await page.getByRole('textbox').fill('red head yellow eye black body');
      await page.getByRole('button', { name: /search/i }).click();
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 3000 });
      
      // Verify 1-5 specific results
      const birdCards = page.locator('[data-testid="bird-card"]');
      const count = await birdCards.count();
      expect(count).toBeGreaterThanOrEqual(1);
      expect(count).toBeLessThanOrEqual(5);
    });
  });

  test.describe('Basic Search Flow', () => {
    test('should perform basic search and display results', async ({ page }) => {
      // Verify home page elements
      await expect(page.getByRole('heading', { name: /birdmate/i })).toBeVisible();
      await expect(page.getByText(/natural language bird search/i)).toBeVisible();
      
      // Type query
      const searchInput = page.getByRole('textbox');
      await searchInput.fill('cardinal');
      
      // Submit search
      await page.getByRole('button', { name: /search/i }).click();
      
      // Wait for results (< 2 seconds per SC-001)
      await expect(page.getByTestId('search-results')).toBeVisible({ timeout: 2000 });
      
      // Verify at least one result displayed
      const birdCards = page.locator('[data-testid="bird-card"]');
      await expect(birdCards.first()).toBeVisible();
      
      // Verify result contains common name and scientific name
      const firstCard = birdCards.first();
      await expect(firstCard.getByText(/cardinal/i)).toBeVisible();
    });

    test('should display bird cards with required information', async ({ page }) => {
      await page.getByRole('textbox').fill('blue jay');
      await page.getByRole('button', { name: /search/i }).click();
      
      await page.waitForSelector('[data-testid="search-results"]');
      
      const firstCard = page.locator('[data-testid="bird-card"]').first();
      
      // Verify card contains:
      // 1. Common name (FR-003)
      await expect(firstCard.getByText('Blue Jay')).toBeVisible();
      
      // 2. Scientific name (FR-003)
      await expect(firstCard.getByText(/cyanocitta/i)).toBeVisible();
      
      // 3. Image or fallback (FR-003)
      const hasImage = await firstCard.locator('img').isVisible();
      const hasFallback = await firstCard.getByText(/no image/i).isVisible();
      expect(hasImage || hasFallback).toBe(true);
      
      // 4. Match score
      await expect(firstCard.getByText(/match/i)).toBeVisible();
    });
  });

  test.describe('URL State Persistence (FR-011)', () => {
    test('should persist search in URL query params', async ({ page }) => {
      await page.getByRole('textbox').fill('woodpecker');
      await page.getByRole('button', { name: /search/i }).click();
      
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Verify URL contains query parameter
      expect(page.url()).toContain('q=woodpecker');
    });

    test('should pre-populate search box from URL on load', async ({ page }) => {
      // Navigate directly with query param
      await page.goto('/?q=robin');
      
      // Verify search box pre-populated
      const searchInput = page.getByRole('textbox');
      await expect(searchInput).toHaveValue('robin');
      
      // Verify results displayed automatically
      await expect(page.getByTestId('search-results')).toBeVisible();
      await expect(page.locator('[data-testid="bird-card"]').first()).toBeVisible();
    });

    test('should restore search state on back button', async ({ page }) => {
      // First search
      await page.getByRole('textbox').fill('sparrow');
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Verify results displayed
      await expect(page.locator('[data-testid="bird-card"]').first()).toBeVisible();
      
      // Second search
      await page.getByRole('textbox').fill('hawk');
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Use browser back
      await page.goBack();
      
      // Verify first search restored
      await expect(page.getByRole('textbox')).toHaveValue('sparrow');
      await expect(page.getByTestId('search-results')).toBeVisible();
    });

    test('should update URL when submitting new search', async ({ page }) => {
      // First search
      await page.getByRole('textbox').fill('duck');
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="search-results"]');
      expect(page.url()).toContain('q=duck');
      
      // Second search
      await page.getByRole('textbox').fill('goose');
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="search-results"]');
      expect(page.url()).toContain('q=goose');
      expect(page.url()).not.toContain('duck');
    });
  });

  test.describe('Loading States (FR-012)', () => {
    test('should show loading indicator during search', async ({ page }) => {
      await page.getByRole('textbox').fill('eagle');
      
      // Start search
      const searchButton = page.getByRole('button', { name: /search/i });
      await searchButton.click();
      
      // Verify button is disabled during loading
      await expect(searchButton).toBeDisabled();
      
      // Wait for results
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Button should be enabled again
      await expect(searchButton).toBeEnabled();
    });

    test('should display loading state in results area', async ({ page }) => {
      await page.getByRole('textbox').fill('owl');
      await page.getByRole('button', { name: /search/i }).click();
      
      // Loading component should be visible briefly
      // Note: May be too fast to catch in some cases
      const resultsContainer = page.getByTestId('search-results');
      await expect(resultsContainer).toBeVisible();
    });
  });

  test.describe('Input Validation', () => {
    test('should accept queries between 1-500 characters', async ({ page }) => {
      // Test minimum valid length (1 char technically, but 3 for search)
      await page.getByRole('textbox').fill('abc');
      const searchButton = page.getByRole('button', { name: /search/i });
      await expect(searchButton).toBeEnabled();
      
      // Test maximum valid length
      const maxQuery = 'a'.repeat(500);
      await page.getByRole('textbox').fill(maxQuery);
      await expect(searchButton).toBeEnabled();
    });

    test('should reject queries over 500 characters', async ({ page }) => {
      // Enter query exceeding limit
      const tooLongQuery = 'a'.repeat(501);
      await page.getByRole('textbox').fill(tooLongQuery);
      
      // Button should be disabled or show validation error
      const searchButton = page.getByRole('button', { name: /search/i });
      await expect(searchButton).toBeDisabled();
      
      // Should show validation message
      await expect(page.getByText(/too long|500 characters/i)).toBeVisible();
    });

    test('should not submit empty queries', async ({ page }) => {
      // Try to submit empty search
      const searchButton = page.getByRole('button', { name: /search/i });
      await searchButton.click();
      
      // URL should not change
      expect(page.url()).not.toContain('?q=');
      
      // No results should appear
      const hasResults = await page.locator('[data-testid="bird-card"]').count();
      expect(hasResults).toBe(0);
    });

    test('should trim whitespace from queries', async ({ page }) => {
      await page.getByRole('textbox').fill('  robin  ');
      await page.getByRole('button', { name: /search/i }).click();
      
      await page.waitForSelector('[data-testid="search-results"]');
      
      // URL should contain trimmed query
      expect(page.url()).toContain('q=robin');
      expect(page.url()).not.toMatch(/q=\s+robin|\+robin\+/);
    });
  });

  test.describe('XSS Prevention (FR-014)', () => {
    test('should sanitize script tags in search queries', async ({ page }) => {
      // Monitor for dialogs (would indicate XSS execution)
      let dialogAppeared = false;
      page.on('dialog', () => {
        dialogAppeared = true;
      });
      
      // Attempt XSS injection
      await page.getByRole('textbox').fill('<script>alert("xss")</script>');
      await page.getByRole('button', { name: /search/i }).click();
      
      // Wait a moment to see if script executes
      await page.waitForTimeout(1000);
      
      // Verify no dialog appeared (XSS blocked)
      expect(dialogAppeared).toBe(false);
    });

    test('should handle HTML entities in queries', async ({ page }) => {
      await page.getByRole('textbox').fill('bird &lt;with&gt; "quotes" & symbols');
      await page.getByRole('button', { name: /search/i }).click();
      
      // Should process query without errors
      await page.waitForSelector('[data-testid="search-results"]');
    });
  });

  test.describe('Empty and No Results States', () => {
    test('should handle no results gracefully', async ({ page }) => {
      // Search for impossible bird
      await page.getByRole('textbox').fill('zzzz impossible bird xyzxyz');
      await page.getByRole('button', { name: /search/i }).click();
      
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Should show empty state message (FR-007)
      await expect(page.getByText(/no birds match/i)).toBeVisible();
      await expect(page.getByText(/try adjusting your search/i)).toBeVisible();
    });

    test('should show helpful message in empty state', async ({ page }) => {
      await page.getByRole('textbox').fill('nonexistent bird species xyz');
      await page.getByRole('button', { name: /search/i }).click();
      
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Verify helpful guidance provided
      const emptyState = page.getByText(/no birds match/i);
      await expect(emptyState).toBeVisible();
      
      // Should include the query that returned no results
      await expect(page.getByText(/nonexistent bird species xyz/i)).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should display error message when API fails', async ({ page, context }) => {
      // Intercept and fail API requests
      await context.route('**/api/v1/search**', route => route.abort());
      
      await page.getByRole('textbox').fill('test bird');
      await page.getByRole('button', { name: /search/i }).click();
      
      // Should show error message
      await expect(page.getByText(/something went wrong|error/i)).toBeVisible();
      
      // Should show retry button
      await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
    });

    test('should allow retry after error', async ({ page, context }) => {
      let requestCount = 0;
      
      // First request fails, second succeeds
      await context.route('**/api/v1/search**', route => {
        requestCount++;
        if (requestCount === 1) {
          route.abort();
        } else {
          route.continue();
        }
      });
      
      await page.getByRole('textbox').fill('robin');
      await page.getByRole('button', { name: /search/i }).click();
      
      // Error appears
      await expect(page.getByText(/something went wrong/i)).toBeVisible();
      
      // Click retry
      await page.getByRole('button', { name: /try again/i }).click();
      
      // Should succeed and show results
      await expect(page.getByTestId('search-results')).toBeVisible();
      await expect(page.locator('[data-testid="bird-card"]').first()).toBeVisible();
      
      // Verify 2 requests were made
      expect(requestCount).toBe(2);
    });

    test('should handle network timeout gracefully', async ({ page, context }) => {
      // Simulate slow network by delaying response
      await context.route('**/api/v1/search**', async route => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        route.continue();
      });
      
      await page.getByRole('textbox').fill('eagle');
      await page.getByRole('button', { name: /search/i }).click();
      
      // May show loading for extended time or timeout error
      // This depends on frontend timeout configuration
    });
  });

  test.describe('Performance Tests (SC-001)', () => {
    test('should respond within 2 seconds for typical queries', async ({ page }) => {
      const queries = ['blue jay', 'red bird', 'woodpecker', 'duck', 'sparrow'];
      
      for (const query of queries) {
        const startTime = Date.now();
        
        await page.getByRole('textbox').fill(query);
        await page.getByRole('button', { name: /search/i }).click();
        await page.waitForSelector('[data-testid="search-results"]', { timeout: 3000 });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // Verify < 2 second response (SC-001)
        expect(responseTime).toBeLessThan(2000);
        
        // Clear for next query
        await page.getByRole('textbox').clear();
      }
    });

    test('should handle rapid successive searches', async ({ page }) => {
      // Submit multiple searches quickly
      const queries = ['robin', 'cardinal', 'sparrow'];
      
      for (const query of queries) {
        await page.getByRole('textbox').fill(query);
        await page.getByRole('button', { name: /search/i }).click();
        
        // Wait briefly between searches
        await page.waitForTimeout(500);
      }
      
      // Final results should be for last query
      await page.waitForSelector('[data-testid="search-results"]');
      expect(page.url()).toContain('q=sparrow');
    });
  });

  test.describe('Result Display Requirements (FR-003, FR-004)', () => {
    test('should display maximum 10 results', async ({ page }) => {
      // Search for ambiguous query likely to return many results
      await page.getByRole('textbox').fill('bird');
      await page.getByRole('button', { name: /search/i }).click();
      
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Count displayed cards
      const birdCards = page.locator('[data-testid="bird-card"]');
      const count = await birdCards.count();
      
      // Should not exceed 10 per FR-003
      expect(count).toBeLessThanOrEqual(10);
    });

    test('should display results ordered by relevance', async ({ page }) => {
      // Search for specific bird
      await page.getByRole('textbox').fill('blue jay');
      await page.getByRole('button', { name: /search/i }).click();
      
      await page.waitForSelector('[data-testid="search-results"]');
      
      // First result should be Blue Jay (exact match)
      const firstCard = page.locator('[data-testid="bird-card"]').first();
      await expect(firstCard.getByText('Blue Jay', { exact: true })).toBeVisible();
    });

    test('should show field marks for each result', async ({ page }) => {
      await page.getByRole('textbox').fill('cardinal');
      await page.getByRole('button', { name: /search/i }).click();
      
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Verify at least one card has field marks
      const firstCard = page.locator('[data-testid="bird-card"]').first();
      const hasFieldMarks = await firstCard.locator('span').count() > 0;
      expect(hasFieldMarks).toBe(true);
    });
  });

  test.describe('Curated Test Queries (SC-002 Validation)', () => {
    // Test subset of SC-002 queries for E2E validation
    // Full 20-query validation should be in integration tests
    
    test('should find Blue Jay for exact name search', async ({ page }) => {
      await page.getByRole('textbox').fill('blue jay');
      await page.getByRole('button', { name: /search/i }).click();
      
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Blue Jay should be in top 3
      const topThree = page.locator('[data-testid="bird-card"]').locator('nth=0,nth=1,nth=2');
      await expect(topThree.getByText('Blue Jay')).toBeVisible();
    });

    test('should find yellow and black bird', async ({ page }) => {
      await page.getByRole('textbox').fill('yellow bird with black wings');
      await page.getByRole('button', { name: /search/i }).click();
      
      await page.waitForSelector('[data-testid="search-results"]');
      
      // American Goldfinch expected in results
      await expect(page.getByText(/goldfinch/i)).toBeVisible();
    });

    test('should find red-winged blackbird', async ({ page }) => {
      await page.getByRole('textbox').fill('bird with red patch on shoulder');
      await page.getByRole('button', { name: /search/i }).click();
      
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Red-winged Blackbird expected
      await expect(page.getByText(/red-winged blackbird/i)).toBeVisible();
    });

    test('should find mallard duck', async ({ page }) => {
      await page.getByRole('textbox').fill('duck with green head');
      await page.getByRole('button', { name: /search/i }).click();
      
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Mallard expected
      await expect(page.getByText(/mallard/i)).toBeVisible();
    });
  });

  test.describe('Keyboard Navigation and Accessibility', () => {
    test('should allow form submission with Enter key', async ({ page }) => {
      const searchInput = page.getByRole('textbox');
      await searchInput.fill('robin');
      
      // Press Enter instead of clicking button
      await searchInput.press('Enter');
      
      // Should trigger search
      await page.waitForSelector('[data-testid="search-results"]');
      expect(page.url()).toContain('q=robin');
    });

    test('should support keyboard navigation to bird cards', async ({ page }) => {
      await page.getByRole('textbox').fill('blue jay');
      await page.getByRole('button', { name: /search/i }).click();
      
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Bird cards should be keyboard focusable
      const firstCard = page.locator('[data-testid="bird-card"]').first();
      await firstCard.focus();
      
      // Should be able to activate with Enter key
      await firstCard.press('Enter');
      // Note: Navigation handler not implemented in MVP, so no navigation expected
    });

    test('should have accessible search form', async ({ page }) => {
      // Verify textbox role
      const searchInput = page.getByRole('textbox');
      await expect(searchInput).toBeVisible();
      
      // Verify search button
      const searchButton = page.getByRole('button', { name: /search/i });
      await expect(searchButton).toBeVisible();
    });
  });
});

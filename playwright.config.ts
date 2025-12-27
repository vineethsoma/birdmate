import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Birdmate E2E Tests
 * 
 * Tests the complete bird search user journey with real backend/frontend.
 * Covers acceptance scenarios from spec: specs/001-bird-search-ui/spec.md
 */
export default defineConfig({
  testDir: './e2e',
  
  // Run tests sequentially for E2E reliability
  fullyParallel: false,
  
  // Timeout for individual tests
  timeout: 30000,
  
  // Retry failed tests once to handle transient failures
  retries: process.env.CI ? 2 : 1,
  
  // Number of workers (1 for sequential E2E)
  workers: 1,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  
  use: {
    // Base URL for navigation
    baseURL: 'http://localhost:5173',
    
    // Collect trace on first retry for debugging
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
  },

  // Configure projects for different browsers (optional)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment for cross-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'mobile',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // Start dev servers before running tests
  // Note: Playwright's webServer array has a known limitation where only the first
  // server starts reliably. See: https://github.com/microsoft/playwright/issues/8206
  // Workaround: Start both servers manually, then let Playwright use them.
  // For CI: servers are pre-started by the workflow.
  // For local: Start servers manually before running tests:
  //   Terminal 1: cd backend && npm run dev
  //   Terminal 2: cd frontend && npm run dev
  //   Terminal 3: npx playwright test
  webServer: undefined,
});

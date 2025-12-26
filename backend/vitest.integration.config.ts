import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

// Load environment variables for integration tests
dotenv.config();

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.integration.test.ts'],
    testTimeout: 30000, // Integration tests may take longer with real API calls
    env: {
      NODE_ENV: 'test'
    }
  }
});

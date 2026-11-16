import { defineConfig } from 'vitest/config';

// Verification suites live in verify/ and run via `npm run verify:*`.
// They are kept out of the default `vitest run` (unit tests) on purpose.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['verify/**/*.verify.ts'],
    env: { NODE_ENV: 'test' },
    testTimeout: 600_000,
    hookTimeout: 120_000,
    fileParallelism: false,
    // App/error logs are noise here; failures are reported via assertion messages.
    onConsoleLog: () => false,
  },
});

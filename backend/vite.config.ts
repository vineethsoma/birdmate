import { defineConfig } from 'vite';
import { resolve } from 'path';
import dotenv from 'dotenv';

// Load environment variables for tests
dotenv.config();

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/server.ts'),
      name: 'BirdmateBackend',
      fileName: 'server',
      formats: ['es']
    },
    rollupOptions: {
      external: ['express', 'better-sqlite3', 'openai', 'dotenv']
    },
    target: 'node20',
    outDir: 'dist'
  },
  test: {
    globals: true,
    environment: 'node',
    env: {
      NODE_ENV: 'test'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.test.ts']
    }
  }
});

# Delegation: Separate Unit and Integration Test Configurations

**Delegated To**: devops-specialist
**Started**: 2025-12-26T05:45:00Z
**Branch**: test/pr-workflow-validation
**PR**: #2

## Task Summary
Separate unit tests from integration tests using different Vitest configurations. Unit tests should run with mocks (no API key needed), integration tests should make real OpenAI calls (API key required).

## Current Problem
- `npm run test:coverage` runs ALL tests including integration tests
- Integration tests fail in CI because `OPENAI_API_KEY` is not set
- Unit tests in `search.test.ts` mock OpenAI but the mock doesn't work when integration tests also run

## Proposed Architecture

| Test Type | Config File | Include Pattern | Exclude Pattern | API Key |
|-----------|-------------|-----------------|-----------------|---------|
| Unit | `vitest.config.ts` | `**/*.test.ts` | `**/*.integration.test.ts` | Not needed |
| Integration | `vitest.integration.config.ts` | `**/*.integration.test.ts` | - | Required |

## Implementation Steps

### Step 1: Create `vitest.integration.config.ts`
Create a new config for integration tests only:
```typescript
// vitest.integration.config.ts
import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.integration.test.ts'],
    testTimeout: 30000, // Integration tests may take longer
    env: {
      NODE_ENV: 'test'
    }
  }
});
```

### Step 2: Update `vite.config.ts`
Exclude integration tests from unit test runs:
```typescript
test: {
  // ... existing config
  include: ['src/**/*.test.ts'],
  exclude: ['node_modules/', 'dist/', 'src/**/*.integration.test.ts']
}
```

### Step 3: Update `package.json` scripts
```json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:all": "vitest run && vitest run --config vitest.integration.config.ts",
    "test:coverage": "vitest run --coverage",
    "test:coverage:all": "vitest run --coverage && vitest run --config vitest.integration.config.ts --coverage"
  }
}
```

### Step 4: Update `.github/workflows/ci.yml`

**Backend Unit Tests job**: Use `npm run test:unit` (no API key needed)
**Integration Tests job**: Use `npm run test:integration` with `OPENAI_API_KEY` from secrets

```yaml
backend-tests:
  name: Backend Unit Tests
  steps:
    - name: Run unit tests with coverage
      working-directory: ./backend
      run: npm run test:coverage  # Only unit tests, no API key needed

integration-tests:
  name: Integration Tests
  needs: [backend-tests, frontend-tests]
  steps:
    - name: Run integration tests
      working-directory: ./backend
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      run: npm run test:integration
```

### Step 5: Remove `describe.skipIf` from integration tests
Since integration tests will only run when API key is available, remove the skipIf logic:
```typescript
// search.integration.test.ts
// Remove these lines:
// const skipIntegrationTests = !process.env.OPENAI_API_KEY;
// describe.skipIf(skipIntegrationTests)('Search Relevance...

// Change to just:
describe('Search Relevance Integration Tests', () => {
```

## Acceptance Criteria
- [ ] `npm run test:unit` runs only unit tests (excludes `*.integration.test.ts`)
- [ ] `npm run test:integration` runs only integration tests
- [ ] Unit tests pass without `OPENAI_API_KEY`
- [ ] CI workflow updated to use separate test commands
- [ ] Integration tests job uses `secrets.OPENAI_API_KEY`
- [ ] All changes committed and pushed

## Verification Commands
```bash
# Test unit tests pass without API key
cd /Users/vineethsoma/workspaces/ai/birdmate/backend
OPENAI_API_KEY= npm run test:unit

# Should see: all unit tests pass, integration tests NOT run

# Test integration tests run with API key
npm run test:integration
# Should see: integration tests run
```

## Context
- Working directory: /Users/vineethsoma/workspaces/ai/birdmate
- Branch: test/pr-workflow-validation  
- This fixes CI failures where unit tests fail because integration tests pollute the test environment

---

## 📝 SUBAGENT REPORT (Write Below After Completion)

<!-- devops-specialist: Write your completion report here -->


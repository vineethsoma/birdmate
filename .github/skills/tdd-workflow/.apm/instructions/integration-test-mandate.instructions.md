---
applyTo: "**"
description: "Mandatory integration testing requirements to prevent late-stage integration failures"
---

# Integration Testing Mandate (MANDATORY)

## Critical Learning: Why This Exists

**US-001 (birdmate) passed all 272 tests, merged to main, but failed in user acceptance with 3 integration bugs.**

This instruction prevents that from happening again.

## The Problem

- ✅ Backend: 172 unit tests passed
- ✅ Frontend: 100 unit tests passed  
- ✅ Code reviewed and merged
- ❌ **Nobody verified they work TOGETHER**

**Result**: CORS errors, type mismatches, stale builds discovered in live demo.

## Mandatory Integration Checklist (BLOCKING for Merge)

### CI/CD Requirements (Must Pass Before Merge)

```yaml
# .github/workflows/integration.yml (REQUIRED)
integration-test:
  - Start backend (port 3001)
  - Wait for /health endpoint (200 OK)
  - Start frontend (port 5173)
  - Run Playwright E2E tests
  - Assert: Zero console errors
  - Assert: Zero network failures
  - Assert: At least 1 search succeeds
```

### Manual Verification (Evidence Required in PR)

**Before requesting PR approval, developer MUST**:

```markdown
## Integration Verification ✅

**Services Started**:
- [ ] Backend: `cd backend && npm run dev` ✅ (port 3001)
- [ ] Frontend: `cd frontend && npm run dev` ✅ (port: [actual])

**Manual Test Scenarios** (minimum 3):
1. Search: "red bird" → [X results] ✅ Screenshot: [link]
2. Search: "blue crested" → [Y results] ✅  
3. Edge case: "zzzzz" → [0 results, no crash] ✅

**Browser Console**: [Screenshot showing ZERO errors] ✅
**Network Tab**: [Screenshot showing 200 OK responses] ✅

**API Contract Validation**:
```bash
curl -X POST http://localhost:3001/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}' | jq '.' > specs/[story]/api-sample.json
```
- [ ] Response structure saved ✅
- [ ] Matches frontend types ✅
```

**Without this section, PR MUST NOT be approved.**

## Updated Definition of Done

### Old (Insufficient)
- ✅ Tests pass
- ✅ Coverage ≥ 80%
- ✅ Code reviewed

### New (Required)
- ✅ Unit tests pass
- ✅ Coverage ≥ 80%
- ✅ **E2E integration test passing in CI**
- ✅ **Manual integration verified (screenshot evidence)**
- ✅ **Browser console clean (screenshot evidence)**
- ✅ **API contract validated (curl sample saved)**
- ✅ Code reviewed

## Common Integration Failures (From US-001)

### 1. CORS Misconfiguration
**Symptom**: `Access-Control-Allow-Origin header has value 'http://localhost:5173' that is not equal to supplied origin`

**Root Cause**: Backend hardcodes single port, dev server assigns different port

**Prevention**:
```typescript
// backend/.env
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175

// backend/src/server.ts  
const CORS_ORIGINS = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim());
app.use(cors({ origin: CORS_ORIGINS }));
```

**Test**:
```bash
# Terminal 1: Start backend
cd backend && npm run dev | grep "CORS origins:"
# Should show: ["http://localhost:5173", "http://localhost:5174", ...]

# Terminal 2: Start frontend (may get 5174 or 5175)
cd frontend && npm run dev

# Browser: Open frontend URL
# Console: Must show ZERO CORS errors
```

### 2. API Type Mismatch
**Symptom**: `Cannot read properties of undefined (reading 'id')`

**Root Cause**: Frontend expects `result.bird.id`, backend returns `result.id`

**Prevention**:
```typescript
// Validate contract in test BEFORE integration
test('API structure matches frontend types', async () => {
  const response = await fetch('http://localhost:3001/api/v1/search', {
    method: 'POST',
    body: JSON.stringify({ query: 'test' })
  });
  const data: ApiResponse = await response.json();
  
  // These assertions prevent type drift
  expect(data.results[0]).toHaveProperty('id');  // NOT bird.id
  expect(data.results[0]).toHaveProperty('commonName');
  expect(data).toHaveProperty('totalCount');  // NOT total
});
```

### 3. Stale Build Artifacts
**Symptom**: UI shows old code after source changes

**Root Cause**: Compiled `.js` files shadow `.tsx` sources

**Prevention**:
```json
// package.json
{
  "scripts": {
    "clean": "find src/ -name '*.js' -o -name '*.jsx' | xargs rm -f",
    "prebuild": "npm run clean",
    "predev": "npm run clean"
  }
}
```

**Test**:
```bash
# Verify no stale JS in TypeScript src/
find src/ -name "*.js" -o -name "*.jsx" | grep -v node_modules
# Should be empty
```

## Integration Test Template

```typescript
// e2e/integration-smoke.spec.ts (REQUIRED for every feature)
import { test, expect } from '@playwright/test';

test.describe('Full Stack Integration', () => {
  test.beforeAll(async () => {
    // Verify backend is running
    const health = await fetch('http://localhost:3001/health');
    expect(health.ok).toBeTruthy();
  });
  
  test('user can complete primary user flow', async ({ page }) => {
    // Monitor console for errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Execute user flow
    await page.goto('http://localhost:5173');
    await page.getByPlaceholder('Search...').fill('test query');
    await page.getByRole('button', { name: 'Search' }).click();
    
    // Verify success
    await expect(page.getByTestId('results')).toBeVisible();
    
    // Assert no integration errors
    expect(consoleErrors).toHaveLength(0);
    expect(consoleErrors.filter(e => e.includes('CORS'))).toHaveLength(0);
    expect(consoleErrors.filter(e => e.includes('undefined'))).toHaveLength(0);
  });
});
```

---

**Remember**: Unit tests prove components work. Integration tests prove THE SYSTEM works. Both are mandatory.

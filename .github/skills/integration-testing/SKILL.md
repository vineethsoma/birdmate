---
description: Frontend-backend integration patterns, CORS configuration, API contract
  validation, and build hygiene for full-stack TypeScript applications. Use when integrating
  separate services or debugging cross-origin issues.
metadata:
  apm_commit: unknown
  apm_installed_at: '2025-12-25T23:03:41.268290'
  apm_package: vineethsoma/agent-packages/skills/integration-testing
  apm_version: 1.0.0
name: integration-testing
---

# Integration Testing Skill

This skill captures critical learnings from US-001 (birdmate project) where 3 integration bugs appeared in demo despite 272 passing unit tests. Covers CORS configuration, API contract validation, and build artifact hygiene.

## CORS Development Configuration

**Critical Pattern**: Development CORS must accommodate dynamic port assignment

```typescript
// ❌ WRONG - Single hardcoded origin
const CORS_ORIGIN = 'http://localhost:5173';

// ✅ CORRECT - Support port range
const CORS_ORIGINS = (process.env.CORS_ORIGIN || 
  'http://localhost:5173,http://localhost:5174,http://localhost:5175'
).split(',').map(s => s.trim());

app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
```

**Why**: Vite/dev servers auto-increment ports when default is occupied

**Configuration Template**:
```bash
# backend/.env
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175

# backend/.env.example (commit this)
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

## API Contract Validation

**Critical**: Types at integration boundary must match wire format

### Anti-Pattern: Over-abstraction
```typescript
// Shared type (ideal design, not actual API)
interface SearchResult {
  bird: Bird;  // ❌ Nested structure
  score: number;
}
```

### Correct Pattern: Wire-format types
```typescript
// API response types (match actual backend)
interface ApiSearchResult {
  id: string;         // ✅ Flat structure
  commonName: string;
  score: number;
}

// Transform at boundary
function transformResults(apiResults: ApiSearchResult[]): AppResult[] {
  return apiResults.map(api => ({
    bird: { id: api.id, commonName: api.commonName },
    score: api.score
  }));
}
```

**Validation Checklist**:
- [ ] Test API endpoint with curl, inspect actual JSON
- [ ] Create `Api*` types matching exact response structure
- [ ] Transform to app types at integration boundary only
- [ ] Never assume shared types match wire format

## Build Artifact Hygiene

**Critical**: Compiled files must not shadow source files

### TypeScript Project .gitignore
```gitignore
# Compiled outputs
dist/
build/
*.js        # ⚠️ CRITICAL in src/ directories
*.js.map
*.jsx
*.jsx.map

# Exception: config files (use negation)
!vite.config.js
!playwright.config.js
!*.config.js
```

**Pre-demo validation**:
```bash
# Check for stale .js in src/
find src/ -name "*.js" -type f | grep -v node_modules

# Should return empty or only intentional .js files
```

**Package.json clean scripts**:
```json
{
  "scripts": {
    "clean": "find src/ -name '*.js' -o -name '*.jsx' | xargs rm -f",
    "prebuild": "npm run clean",
    "predev": "npm run clean"
  }
}
```

## Integration Testing Workflow

### 1. Start Backend
```bash
cd backend && npm run dev
```
Verify CORS origins logged at startup

### 2. Start Frontend
```bash
cd frontend && npm run dev
```
Note actual port assigned (may not be 5173)

### 3. Test CORS Preflight
```bash
curl -I -X OPTIONS http://localhost:3001/api/v1/search \
  -H "Origin: http://localhost:5175" \
  -H "Access-Control-Request-Method: POST"
# Should return: Access-Control-Allow-Origin: http://localhost:5175
```

### 4. Test API Contract
```bash
curl -X POST http://localhost:3001/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}' | jq '.' > actual-response.json

# Verify response structure matches frontend types
```

### 5. Browser Network Inspection
- Open DevTools → Network tab
- Execute feature in browser
- Verify no CORS errors (200 OK on OPTIONS + POST)
- Verify no type errors in console

## Common Failure Modes

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| `ERR_FAILED` network request | CORS misconfiguration | Add frontend port to backend CORS_ORIGIN |
| `Access-Control-Allow-Origin` error | Single port in CORS, frontend on different port | Use comma-separated port list |
| `Cannot read property 'x' of undefined` | Type mismatch (nested vs flat) | Create API-specific types at boundary |
| Old UI showing after code changes | Stale .js files shadowing .tsx | Remove compiled artifacts from src/ |
| Port already in use | Previous dev server still running | `lsof -ti:3001 \| xargs kill -9` |

## Pre-Demo Validation Checklist

Before demoing any full-stack feature:

- [ ] Backend `.env` has `CORS_ORIGIN` with port range (5173-5175)
- [ ] No `.js` or `.jsx` files in `frontend/src/` or `backend/src/`
- [ ] `curl` test confirms API response structure
- [ ] Network tab shows successful OPTIONS + POST requests
- [ ] Console shows no CORS or type errors
- [ ] URL state persistence working (if applicable)
- [ ] Both services started fresh (no cached state)

## Integration Test Template

```typescript
// e2e/integration-smoke.spec.ts
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

## When to Use This Skill

- Full-stack TypeScript projects with separate frontend/backend
- When backend and frontend run on different ports/origins
- Debugging CORS issues in development
- Verifying API contract alignment between services
- Before demoing features to users
- Setting up new full-stack projects

## Related Skills

- [tdd-workflow](../tdd-workflow/SKILL.md) - Unit testing discipline
- [playwright-testing](../playwright-testing/SKILL.md) - E2E test standards
- [fullstack-expertise](../fullstack-expertise/SKILL.md) - Full-stack development patterns
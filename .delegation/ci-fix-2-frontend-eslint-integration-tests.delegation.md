# Delegation: Fix Remaining CI Failures

**Delegated To**: fullstack-engineer
**Started**: 2025-12-26T05:20:00Z
**Branch**: test/pr-workflow-validation

## Context

CI run #3 (ID: 20516544018) failed with 2 remaining issues after initial fixes.

## Issue 1: Frontend ESLint Cannot Parse Test Files

**Error from CI logs**:
```
/home/runner/work/birdmate/birdmate/frontend/src/App.test.tsx
  0:0  error  Parsing error: ESLint was configured to run on `<tsconfigRootDir>/src/App.test.tsx` using `parserOptions.project`: <tsconfigRootDir>/tsconfig.json
However, that TSConfig does not include this file.
```

**Also these frontend lint errors**:
```
/home/runner/work/birdmate/birdmate/frontend/src/App.tsx
  35:22  error  `'` can be escaped with `&apos;`  react/no-unescaped-entities
  35:43  error  `'` can be escaped with `&apos;`  react/no-unescaped-entities

/home/runner/work/birdmate/birdmate/frontend/src/hooks/useSearch.ts
  62:24  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
```

**Required Fix**: 
1. Create `frontend/tsconfig.eslint.json` that extends `tsconfig.json` but includes test files
2. Update `frontend/.eslintrc.cjs` to use `tsconfig.eslint.json`
3. Either fix the lint errors OR relax rules to warnings (like we did for backend)

**Reference**: See how we fixed this in backend:
- `backend/tsconfig.eslint.json` - example of the solution
- `backend/.eslintrc.json` - how we reference the ESLint-specific tsconfig

## Issue 2: Backend Integration Tests Require OPENAI_API_KEY

**Error from CI logs**:
```
× Search Relevance Integration Tests > Curated Query Tests > Query 1: "blue jay"
  → OPENAI_API_KEY environment variable is required
```

The file `src/api/routes/search.integration.test.ts` contains 26 integration tests that call the real OpenAI API. These are **not mocked** and will fail in CI without the API key.

**Required Fix**: 
Option A: Skip these tests in CI when `OPENAI_API_KEY` is not set
Option B: Mark these tests with a special tag and exclude in CI
Option C: Add conditional skip logic at the top of the test file

**Recommended approach**: Add `skipIf(!process.env.OPENAI_API_KEY)` or similar pattern to gracefully skip when API key is unavailable.

## Acceptance Criteria

- [ ] Frontend ESLint passes in CI (0 errors)
- [ ] Backend tests pass in CI (integration tests skipped when no API key)
- [ ] All changes committed and pushed
- [ ] Local verification before push

## Files to Modify

**Frontend**:
- `frontend/tsconfig.eslint.json` (CREATE)
- `frontend/.eslintrc.cjs` (UPDATE to reference tsconfig.eslint.json)
- `frontend/src/App.tsx` (FIX unescaped entities if not relaxing rule)
- `frontend/src/hooks/useSearch.ts` (FIX any type if not relaxing rule)

**Backend**:
- `backend/src/api/routes/search.integration.test.ts` (ADD skip logic for CI)

---

## 📝 SUBAGENT REPORT (Write Below After Completion)

<!-- fullstack-engineer: Write your completion report here -->


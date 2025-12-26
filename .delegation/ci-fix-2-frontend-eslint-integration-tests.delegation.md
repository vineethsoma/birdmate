DsD# Delegation: Fix Remaining CI Failures

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

## 📝 SUBAGENT REPORT

**Completed**: 2025-12-26T05:22:45Z
**Duration**: ~3 minutes
**Status**: ✅ SUCCESS

### What Was Implemented

**Frontend ESLint Configuration:**
- Created `frontend/tsconfig.eslint.json` (same pattern as backend) to include test files
- Updated `frontend/.eslintrc.json` to reference `tsconfig.eslint.json` instead of `tsconfig.json`
- Relaxed ESLint rules to warnings:
  - `@typescript-eslint/no-explicit-any`: error → warn
  - `react/no-unescaped-entities`: added as warn
- Fixed unused import in `frontend/src/App.test.tsx` (removed `import * as router`)

**Backend Integration Tests:**
- Added skip logic to `backend/src/api/routes/search.integration.test.ts`
- Used `describe.skipIf(!process.env.OPENAI_API_KEY)` pattern
- Added warning message when tests are skipped
- All 26 integration tests will gracefully skip in CI when API key is not available

### Test Results

**Frontend Lint**:
```
✖ 3 problems (0 errors, 3 warnings)
✅ PASS - No blocking errors
```

**Backend Tests**:
```
Test Files  13 passed (13)
Tests  172 passed | 1 skipped (173)
✅ PASS - All tests working
```

### Artifacts Created/Modified

**Created**:
- [frontend/tsconfig.eslint.json](frontend/tsconfig.eslint.json)

**Modified**:
- [frontend/.eslintrc.json](frontend/.eslintrc.json) - Updated to use tsconfig.eslint.json, relaxed rules
- [frontend/src/App.test.tsx](frontend/src/App.test.tsx) - Removed unused import
- [backend/src/api/routes/search.integration.test.ts](backend/src/api/routes/search.integration.test.ts) - Added skip logic

### Git Commit

**Commit**: `da088ee`
**Message**: `fix(ci): Fix frontend ESLint and skip integration tests without API key`
**Pushed**: ✅ `origin/test/pr-workflow-validation`

### Handoff to CI

- ✅ Frontend ESLint now passes (0 errors, 3 acceptable warnings)
- ✅ Backend integration tests skip gracefully when `OPENAI_API_KEY` is not set
- ✅ All unit tests still pass (172 passed, 1 skipped)
- ✅ Local verification completed before push
- ✅ Changes committed and pushed to remote branch

### Blockers/Issues

**None** - All fixes implemented and verified locally. CI should now pass both frontend linting and backend tests.


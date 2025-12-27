# Delegation: Fix CI Pipeline Failures

**Delegated To**: fullstack-engineer
**Started**: 2025-12-26T05:00:00Z
**Branch**: test/pr-workflow-validation
**Priority**: High
**PR**: #2 - [TEST] Validate PR Workflow and CI Pipeline

## Context

The CI pipeline is failing on PR #2 with 3 failing checks:
- Backend Unit Tests
- Code Quality Checks
- CI Success (depends on above)

## Issues to Fix

### Issue 1: OPENAI_API_KEY Required at Module Load Time

**Problem**: The `embeddings.ts` module throws an error at import time if `OPENAI_API_KEY` is not set. This causes test files that import `SearchService` or `embeddings` to fail during module loading.

**Location**: `backend/src/utils/embeddings.ts:11-13`

**Solution**: 
- Make the API key validation lazy (check when function is called, not at module load)
- OR provide a mock/fallback for test environments
- OR set a dummy env var in CI for unit tests

### Issue 2: ESLint Cannot Parse Test Files

**Problem**: ESLint is configured to use `tsconfig.json` for type-aware linting, but test files (`*.test.ts`) are excluded from `tsconfig.json`. This causes ESLint parsing errors.

**Location**: 
- `backend/tsconfig.json` - excludes `src/**/*.test.ts`
- `backend/.eslintrc.json` - uses `project: ./tsconfig.json`

**Solution Options**:
A) Create a separate `tsconfig.eslint.json` that includes test files
B) Remove test file exclusion from tsconfig.json (may affect build output)
C) Configure ESLint to skip type-checking for test files

**Recommended**: Option A - Create `tsconfig.eslint.json` extending `tsconfig.json` with test files included

### Issue 3: TypeScript Strict Mode Violations

**Files with `any` type issues**:
- `backend/src/api/routes/search.ts` - Multiple unsafe `any` usages (lines 25, 39, 48, 51, 54, 56, 60, 67, 68, 69)
- `backend/src/api/routes/taxonomy.ts` - Line 52
- `backend/src/api/middleware/sanitize.ts` - Line 68
- `backend/src/db/migrations/run.ts` - Line 25 (floating promise)
- `backend/src/db/seeds/download-taxonomy.ts` - Line 30
- `backend/src/db/seeds/fetch-images.ts` - Line 23 (async without await)
- `backend/src/db/seeds/filter-na-species.ts` - Lines 13, 14

**Solution**: Add proper TypeScript types to replace `any` and fix async/promise issues

## Acceptance Criteria

- [ ] Backend unit tests pass in CI (all 13 test files)
- [ ] ESLint passes with no errors on both source and test files
- [ ] TypeScript type-check passes (`tsc --noEmit`)
- [ ] All 6 CI jobs pass (backend-tests, frontend-tests, integration-tests, e2e-tests, quality-checks, ci-success)
- [ ] PR #2 shows all checks passing

## Technical Approach

1. **Fix embeddings.ts** - Defer API key validation to function call time
2. **Create tsconfig.eslint.json** - Include test files for ESLint
3. **Update .eslintrc.json** - Point to new tsconfig
4. **Fix type violations** - Add proper types in flagged files
5. **Test locally** - Run `npm run lint` and `npm test` 
6. **Push to branch** - Commit fixes and push to trigger CI

## Files to Modify

```
backend/
├── src/
│   ├── utils/embeddings.ts          # Fix lazy API key validation
│   ├── api/routes/search.ts         # Fix type annotations
│   ├── api/routes/taxonomy.ts       # Fix type annotation
│   ├── api/middleware/sanitize.ts   # Fix type annotation
│   ├── db/migrations/run.ts         # Fix floating promise
│   ├── db/seeds/download-taxonomy.ts # Fix type
│   ├── db/seeds/fetch-images.ts     # Fix async/await
│   └── db/seeds/filter-na-species.ts # Fix types
├── tsconfig.json                    # Keep as-is (for build)
├── tsconfig.eslint.json             # NEW - for ESLint
└── .eslintrc.json                   # Update project reference
```

## Test Commands

```bash
cd backend
npm run lint          # Should pass
npm test              # Should pass
npx tsc --noEmit      # Should pass
```

---

## 📝 SUBAGENT REPORT (Write Below After Completion)

<!-- fullstack-engineer: Write your completion report here -->


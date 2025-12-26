# Delegation: Fix TypeScript Errors and Remaining Test Failures

**Delegated To**: fullstack-engineer
**Started**: 2025-12-26T05:28:00Z
**Branch**: test/pr-workflow-validation

## Context

CI run #4 (ID: 20516608494) still failing with 2 categories of issues.

## Issue 1: TypeScript Typecheck Errors (4 errors)

**Errors from CI logs**:
```
src/db/seeds/filter-na-species.ts(32,27): error TS2554: Expected 1 arguments, but got 2.
src/db/seeds/filter-na-species.ts(108,82): error TS2554: Expected 2 arguments, but got 3.
src/utils/embeddings.ts(55,18): error TS2532: Object is possibly 'undefined'.
src/utils/similarity.ts(36,61): error TS2532: Object is possibly 'undefined'.
```

**Required Fixes**:
1. `filter-na-species.ts` - Function call argument mismatches (likely outdated function signatures)
2. `embeddings.ts:55` - Add null check or non-null assertion
3. `similarity.ts:36` - Add null check or non-null assertion

## Issue 2: Backend Tests Still Failing (`search.test.ts`)

The **integration tests** (`search.integration.test.ts`) are now skipped ✅.

However, there's ANOTHER test file `search.test.ts` (Contract Tests) that:
- Uses real `SearchService` 
- Calls real `generateEmbedding`
- Fails without `OPENAI_API_KEY`

**Error from CI logs**:
```
Search error: {
  error: 'OPENAI_API_KEY environment variable is required',
  stack: 'Error: OPENAI_API_KEY environment variable is required
    at getOpenAIClient (/home/runner/work/birdmate/birdmate/backend/src/utils/embeddings.ts:16:13)
    at Module.generateEmbedding (/home/runner/work/birdmate/birdmate/backend/src/utils/embeddings.ts:45:18)
    at SearchService.search (/home/runner/work/birdmate/birdmate/backend/src/services/SearchService.ts:65:33)
```

**Required Fix Options**:
1. **Option A (Preferred)**: Mock the `generateEmbedding` function in `search.test.ts` so it doesn't call OpenAI
2. **Option B**: Skip tests in `search.test.ts` when `OPENAI_API_KEY` is not available (like we did for integration tests)
3. **Option C**: Mock the entire SearchService in tests

**Recommended approach**: Option A - mock `generateEmbedding` to return fake embeddings. This allows contract tests to run in CI without API key while still testing the Express route logic.

## Acceptance Criteria

- [ ] All 4 TypeScript errors fixed (no more `tsc --noEmit` errors)
- [ ] Backend tests pass in CI (either via mocking or skipping)
- [ ] All changes committed and pushed
- [ ] Local verification: `cd backend && npx tsc --noEmit && npm test`

## Files to Modify

**TypeScript Errors**:
- `backend/src/db/seeds/filter-na-species.ts` (lines 32, 108)
- `backend/src/utils/embeddings.ts` (line 55)
- `backend/src/utils/similarity.ts` (line 36)

**Test Mocking**:
- `backend/src/api/routes/search.test.ts` (add mocking or skipIf logic)

## Reference: How integration tests were skipped

In `search.integration.test.ts`, we added:
```typescript
describe.skipIf(!process.env.OPENAI_API_KEY)('Search Relevance Integration Tests', () => {
```

---

## 📝 SUBAGENT REPORT (Write Below After Completion)

<!-- fullstack-engineer: Write your completion report here -->


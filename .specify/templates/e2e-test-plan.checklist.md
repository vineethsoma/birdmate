# E2E Test Plan Checklist

> Ensure comprehensive E2E coverage for user story

## Pre-Implementation (Write Scenario Shells)

- [ ] **Acceptance scenarios mapped** - Each AC has 1+ E2E test scenario
- [ ] **User journey documented** - Step-by-step flow
- [ ] **Test data identified** - What fixtures/seeds are needed
- [ ] **External dependencies listed** - What APIs to mock

## Test Scenarios

> Map each acceptance criterion to E2E test

| AC # | Scenario | Priority | Test Status |
|------|----------|----------|-------------|
| AC-1 | [Name] | 🔴 Critical | ⏳ Pending |
| AC-2 | [Name] | 🟡 Important | ⏳ Pending |
| AC-3 | [Name] | 🟢 Nice-to-have | ⏳ Pending |

### Scenario: [Name from spec.md]

**User Goal**: [What user wants to accomplish]

**Steps**:
1. Navigate to [page]
2. Interact with [element]
3. Verify [expected outcome]

**Assertions**:
- [ ] [Visible element/text]
- [ ] [URL state]
- [ ] [Performance < Xms]

**Test Data**:
- Input: [fixture/seed data]
- Expected Output: [assertion values]

**Mocks/Stubs**:
- [ ] [API endpoint] → [response]

## E2E vs Unit Test Boundaries

**Unit Tested** (NOT in E2E):
- [ ] Validation logic
- [ ] Data transformations
- [ ] Edge cases (null, empty, boundary)
- [ ] Error message content

**E2E Tested** (Integration focus):
- [ ] Frontend ↔ Backend contract
- [ ] User-facing error states
- [ ] Full user journey
- [ ] URL state persistence
- [ ] Performance requirements

## Selector Strategy

Prefer user-facing selectors in this order:
1. `getByRole()` - Accessibility-first
2. `getByLabel()` - Form fields
3. `getByPlaceholder()` - Input hints
4. `getByText()` - Visible content
5. `getByTestId()` - Stable, explicit

**Avoid**: CSS classes, XPath, implementation details

## Test Quality Checklist

- [ ] All acceptance scenarios have E2E tests
- [ ] E2E tests pass locally (3 consecutive runs)
- [ ] E2E tests pass in CI
- [ ] Performance assertions added (if specified)
- [ ] Error scenarios covered
- [ ] No arbitrary waits (use explicit conditions)
- [ ] Tests are independent (can run in parallel)
- [ ] No flaky tests (>95% pass rate)

## CI/CD Requirements

- [ ] E2E tests configured in GitHub Actions
- [ ] Tests run on PR to main/develop
- [ ] **E2E must pass to merge** (blocking)
- [ ] Failure artifacts captured (screenshots, traces)
- [ ] Test duration < 5 minutes total

## Coverage Verification

| Criterion | E2E Tests | Status |
|-----------|-----------|--------|
| [AC-1] | `test_name_1` | ✅/❌ |
| [AC-2] | `test_name_2` | ✅/❌ |
| [AC-3] | `test_name_3` | ✅/❌ |

**Coverage**: X/Y acceptance criteria covered (100% required to merge)

## E2E Test Report

```
Tests: X passing, Y failing
Duration: Xm Xs
Flaky: 0
```

## Commands

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test e2e/[feature].spec.ts

# Run with UI (debugging)
npx playwright test --ui

# Run headed (see browser)
npx playwright test --headed

# Generate report
npx playwright show-report
```

---

**Completed by**: @playwright-specialist
**Date**: YYYY-MM-DD

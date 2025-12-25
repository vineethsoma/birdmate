# TDD Compliance Checklist

> Verify Test-Driven Development discipline for each implementation unit

## Pre-Implementation Checklist

- [ ] **Acceptance criteria reviewed** - Clear understanding of what to test
- [ ] **Test file created** - Named `[component].test.ts(x)`
- [ ] **Test structure defined** - describe/it blocks for all scenarios
- [ ] **Dependency mocking strategy defined** - What needs mocks/stubs?
- [ ] **Test data fixtures prepared** - Use factories, not inline objects
- [ ] **Isolation verified** - beforeEach/afterEach cleanup planned
- [ ] **Math functions have property tests** - Range/boundary invariants

## Per-Feature TDD Cycle

### Feature: [Feature Name]

#### Commit Convention

Use emoji prefixes for TDD cycle visibility:
- 🔴 `RED:` Failing test commit
- 🟢 `GREEN:` Passing implementation  
- ♻️ `REFACTOR:` Improvement with tests still green

**Example**:
```bash
git commit -m "🔴 RED: test similarity handles zero vectors"
git commit -m "🟢 GREEN: implement zero vector detection"
git commit -m "♻️ REFACTOR: extract vector validation to helper"
```

#### Red Phase (Write Failing Test)

- [ ] Test describes expected behavior (not implementation)
- [ ] Test uses Arrange-Act-Assert pattern
- [ ] Test naming follows convention: `should_[behavior]_when_[condition]`
- [ ] **RAN TEST - CONFIRMED FAILURE** ⬅️ Critical step
  - Failure reason: `[Expected X but got Y / Function not found / etc.]`
- [ ] **COMMITTED with 🔴 prefix**

#### Green Phase (Minimal Implementation)

- [ ] Wrote minimal code to pass test
- [ ] No extra features added beyond test requirements
- [ ] **RAN TEST - CONFIRMED PASSING** ⬅️ Critical step
- [ ] All previous tests still pass

#### Refactor Phase (Improve Code)

- [ ] Code cleaned up (naming, structure, DRY)
- [ ] No behavior changes made
- [ ] **RAN ALL TESTS - STILL PASSING** ⬅️ Critical step
- [ ] Committed changes

## TDD Violations Log

| # | File | Description | Justification | Remediation |
|---|------|-------------|---------------|-------------|
| 1 | | Code written before test | [Why unavoidable] | [Tests added after] |

**Acceptable Violation Reasons**:
- Spike/prototype code (must be deleted and rewritten with TDD)
- Third-party integration exploration
- Build/config changes (not application logic)

**Unacceptable Violations**:
- "Saving time" - TDD saves time long-term
- "Simple feature" - All features need tests
- "I'll add tests later" - Debt accumulates

## Coverage Requirements

| Layer | Minimum | Target | Actual |
|-------|---------|--------|--------|
| Backend Services | 80% | 90% | % |
| Backend API Routes | 85% | 95% | % |
| Frontend Components | 70% | 80% | % |
| Frontend Hooks | 80% | 90% | % |
| Utility Functions | 95% | 100% | % |
| Critical Paths* | 100% | 100% | % |

*Critical Paths: Authentication, payment, data persistence, security

## Test Quality Checklist

- [ ] Tests are independent (can run in any order)
- [ ] Tests don't share mutable state
- [ ] Tests use fixtures/factories for test data
- [ ] Tests clean up after themselves
- [ ] Tests don't rely on external services (mocked)
- [ ] Tests have descriptive failure messages
- [ ] Edge cases covered (null, empty, boundary values)
- [ ] Error scenarios tested

## Anti-Pattern Detection

- [ ] No test logic in production code (no `if (NODE_ENV === 'test')`)
- [ ] No tests testing mocks (verify actual behavior, not mock calls)
- [ ] No brittle assertions (snapshot overuse, implementation coupling)
- [ ] No test interdependence (Test A must run before Test B)
- [ ] No production code in test files (move to src/)

## End-of-Story TDD Verification

```bash
# Commands to run before marking story complete

# Backend
cd backend && npm test -- --coverage

# Frontend  
cd frontend && npm test -- --coverage

# Verify no skipped tests
npm test 2>&1 | grep -E "(skipped|pending|todo)"
```

### Final Verification

- [ ] All tests pass
- [ ] Coverage meets minimum thresholds
- [ ] No skipped tests without documented reason
- [ ] TDD violations documented and justified
- [ ] Test code reviewed for quality

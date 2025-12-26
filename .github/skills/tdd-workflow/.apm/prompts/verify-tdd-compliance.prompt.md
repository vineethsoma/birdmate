---
description: Verify TDD compliance throughout story development
tools: ['read', 'execute']
---

# Verify TDD Compliance

Guide the team through verifying TDD discipline and test quality throughout story development.

## Context Gathering

1. **Gather TDD metrics**:
   ```bash
   ./scripts/gather-tdd-metrics.sh <story-id>
   ```
   
   Reviews:
   - TDD commit pattern (🔴🟢♻️)
   - Test coverage (backend, frontend)
   - Test-to-code ratio
   - Test file counts

2. **Read checklist**:
   - Read: `specs/{feature}/stories/{story-id}/checklists/tdd-compliance.md`
   - Identify unchecked items

3. **Review commit history**:
   ```bash
   git log origin/main..feat-us{number} --oneline
   ```
   
   Look for:
   - 🔴 Commits with failing tests
   - 🟢 Commits with passing implementation
   - ♻️ Refactoring commits

## Verification Steps

### Step 1: Test-First Development

**Check commit order**:
```bash
git log --oneline --grep="🔴\|🟢" origin/main..feat-us{number}
```

**Expected pattern**:
```
abc123 🟢 Implement user validation
def456 🔴 Add failing test for user validation
ghi789 🟢 Add email validation
jkl012 🔴 Test: email must contain @
```

**Questions for team**:
- Did you write tests before implementation?
- Can you show the Red → Green → Refactor cycle in commits?
- Were any tests written after implementation? Why?

### Step 2: Test Coverage

**Run coverage reports**:
```bash
# Backend
cd backend && npm test -- --coverage

# Frontend
cd frontend && npm test -- --coverage
```

**Minimum thresholds**:
- Overall coverage: 80%+
- Critical paths: 100% (auth, payments, data mutations)

**Review coverage gaps**:
- Which files are below 80%?
- Are uncovered lines edge cases or critical logic?
- Action: Add tests for gaps

### Step 3: Test Quality

**Review test files**:
- Read test files in `{backend,frontend}/src/**/*.test.ts`
- Check for:
  - Clear test names (`test_function_scenario_expected`)
  - Arrange-Act-Assert structure
  - No skipped tests (`test.skip` without justification)
  - No commented-out tests
  - Independence (no shared mutable state)

**Questions**:
- Are test names descriptive?
- Do tests test behavior, not implementation?
- Are edge cases covered?
- Do tests run fast (< 100ms each)?

### Step 4: TDD Discipline

**Check for anti-patterns**:
```bash
# Find large commits (potential non-TDD work)
git log --oneline --shortstat origin/main..feat-us{number} | \
  awk '/files? changed/ {if ($1 > 20) print}'

# Find commits without test changes
git log --oneline origin/main..feat-us{number} -- ':(exclude)**/*.test.ts' ':(exclude)**/*.spec.ts'
```

**Red flags**:
- Large commits (> 20 files changed) without tests
- Implementation commits without corresponding test changes
- Tests all added at end of story

**Corrective actions**:
- Split large commits into smaller TDD cycles
- Add missing tests before merging
- Educate team on TDD workflow

## Validation Report

After verification, update checklist:

```markdown
## TDD Discipline

- [x] All commits follow TDD cycle (🔴→🟢→♻️)
  - Red commits: 12
  - Green commits: 12
  - Refactor commits: 3

- [x] Test coverage meets 80% minimum
  - Backend: 87%
  - Frontend: 84%

- [x] No skipped or commented tests

- [x] Tests run fast (all < 100ms)

- [ ] Edge cases covered
  - TODO: Add test for empty email input

## Action Items

- [ ] Add edge case test for empty email
- [ ] Split large commit abc123 into smaller TDD cycles
```

## Final Validation

Before merge:
```bash
./scripts/validate-tdd-compliance.sh <story-id>
```

**Must pass**:
- All checklist items checked
- Coverage ≥ 80%
- TDD commit pattern detected

If validation fails:
- Address failures
- Update checklist
- Re-run validation

If validation passes:
- Ready to merge
- Document TDD metrics in retrospective

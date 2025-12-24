---
description: Validate story is ready to merge to main branch
tags: [git, worktree, merge, validation, qa]
---

# Validate Merge Readiness

Comprehensive validation checklist before merging story to main.

## Instructions

You are a **Merge Validation Specialist**. Ensure story meets all quality gates before integration.

### Step 1: Verify Story Completion

**Check delegation document**:
```bash
cat worktrees/feat-us{story-id}/DELEGATION.md
```

**Acceptance criteria review**:
- [ ] All acceptance criteria items checked off
- [ ] No incomplete functionality
- [ ] Edge cases handled
- [ ] Error handling implemented

**Manual verification**:
1. Run the application
2. Test each acceptance criterion manually
3. Verify expected behavior matches spec

### Step 2: Constitution Compliance

**Review constitution requirements**:
```bash
cat specs/.specify/memory/constitution.md
# or
cat AGENTS.md  # Check SPEC-KIT CONSTITUTION section
```

**Validate against principles**:
- [ ] **Principle I**: Natural language first (if applicable)
- [ ] **Principle II**: Taxonomy accuracy (if bird data changed)
- [ ] **Principle III**: Test-first followed (tests exist, pass)
- [ ] **Principle IV**: Observability maintained (logging in place)
- [ ] **Principle V**: API-first design (if API changes)

**Architecture compliance**:
- [ ] TypeScript strict mode (no `any` types)
- [ ] Follows established patterns
- [ ] No architectural deviations without approval

### Step 3: Test Coverage & Quality

**Run full test suite**:
```bash
cd worktrees/feat-us{story-id}

# Unit tests
npm test

# Integration tests
npm run test:integration

# Check coverage
npm run test:coverage
```

**Coverage requirements**:
- [ ] Minimum 80% code coverage (constitution requirement)
- [ ] All new functions have tests
- [ ] Critical paths have 100% coverage
- [ ] Edge cases tested

**Test quality check**:
- [ ] Tests follow AAA pattern (Arrange-Act-Assert)
- [ ] Test names are descriptive
- [ ] No skipped or disabled tests without justification
- [ ] Tests are independent (no shared state)

### Step 4: Code Quality

**Linting & formatting**:
```bash
npm run lint
npm run format:check
```

**Type checking**:
```bash
npm run type-check
```

**Code review checklist**:
- [ ] No commented-out code
- [ ] No debug statements or console.logs
- [ ] Meaningful variable/function names
- [ ] Functions < 20 lines (CLAUDE principle C-4)
- [ ] No code duplication (CLAUDE principle C-2)
- [ ] Error messages are descriptive (CLAUDE principle E-2)

### Step 5: Cross-Story Consistency

**API contract validation**:
```bash
# Check OpenAPI spec is updated
cat specs/{feature-id}/contracts/api.openapi.yml

# Validate spec
npm run validate:openapi
```

**Check for conflicts**:
- [ ] No conflicting endpoint definitions with other stories
- [ ] Shared types are consistent
- [ ] Database schema aligns with other stories
- [ ] No naming conflicts

**Run consistency script**:
```bash
# If feature has consistency validation
npm run validate:consistency
```

### Step 6: Conflict Detection

**Check for merge conflicts**:
```bash
# Use conflict detection script
./scripts/worktree-conflicts.sh us{story-id}
```

**Expected output**: `✅ No conflicts detected!`

**If conflicts exist**:
1. STOP merge process
2. Run conflict resolution prompt
3. Re-validate after resolution

### Step 7: Handoff Validation

**If dependent stories exist**:

**Check handoff requirements**:
```bash
# From delegation document
grep "Handoff to Next Story" worktrees/feat-us{story-id}/DELEGATION.md
```

**Verify handoff items**:
- [ ] API endpoints implemented as promised
- [ ] Contracts published (OpenAPI, types)
- [ ] Shared types exported
- [ ] Database migrations complete
- [ ] Integration tests pass

**Notify dependent stories**:
```bash
# If US-002 depends on US-001
echo "US-001 ready for integration: API endpoints available" > .handoff-us002.txt
```

### Step 8: Pre-Merge Checklist

**Final validation**:
- [ ] All tests pass (unit + integration)
- [ ] No linting errors
- [ ] Type checking passes
- [ ] Code coverage meets requirements
- [ ] No merge conflicts with main
- [ ] Constitution compliance verified
- [ ] Acceptance criteria met
- [ ] Handoff documentation complete
- [ ] No uncommitted changes
- [ ] Branch is up to date with main (or synced)

**Performance check** (if applicable):
- [ ] No performance regressions
- [ ] Query optimizations in place
- [ ] Large dataset handling tested

**Security check** (if applicable):
- [ ] Input validation present
- [ ] No hardcoded secrets
- [ ] Authentication/authorization correct

### Step 9: Approval Decision

**If ALL checks pass**:
```bash
echo "✅ Story is READY TO MERGE"
echo "Proceed with: ./scripts/worktree-merge.sh us{story-id}"
```

**If ANY checks fail**:
```bash
echo "❌ Story is NOT READY TO MERGE"
echo "Blockers:"
# List specific failures
echo "- Tests failing: test/api.test.ts"
echo "- Coverage below 80%: 75%"
echo "- Merge conflicts with main"
```

**Return story to engineer**:
```markdown
## Validation Failed: US-{story-id}

**Status**: ❌ Not Ready

**Blockers**:
1. Test coverage: 75% (minimum: 80%)
   - Missing tests for: src/services/search.ts
2. Merge conflicts detected:
   - src/api/routes.ts conflicts with main

**Next Steps**:
1. Add tests for search service
2. Resolve merge conflicts
3. Re-run validation

**Timeline**: Estimate 2-4 hours
```

## Validation Report Template

```markdown
## Merge Validation Report: US-{story-id}

**Date**: {timestamp}
**Validator**: Feature Lead
**Story**: {story-title}

### ✅ Passed Checks
- [x] All acceptance criteria met
- [x] Constitution compliance verified
- [x] Tests pass (94% coverage)
- [x] No linting errors
- [x] Type checking clean
- [x] No merge conflicts
- [x] Handoff documentation complete

### 📊 Metrics
- **Test Coverage**: 94% (target: 80%)
- **Tests**: 47 passed, 0 failed
- **Commits**: 12 commits
- **Lines Changed**: +450, -120

### 🚀 Approval

**Status**: ✅ **APPROVED FOR MERGE**

**Next Steps**:
1. Merge to main: `./scripts/worktree-merge.sh us{story-id}`
2. Push to origin
3. Clean up worktree: `./scripts/worktree-remove.sh us{story-id} --delete-branch`
4. Update feature context
5. Notify dependent story: US-{n+1}

**Approver**: Feature Lead
```

## Common Failure Patterns

### Pattern 1: Incomplete Testing
**Symptom**: Coverage < 80%, missing edge case tests
**Resolution**: Add tests for uncovered code paths
**Timeline**: 1-3 hours

### Pattern 2: Constitution Violations
**Symptom**: TypeScript `any` types, hardcoded values, missing validation
**Resolution**: Refactor to comply with standards
**Timeline**: 2-4 hours

### Pattern 3: Merge Conflicts
**Symptom**: Conflicts with main branch
**Resolution**: Sync worktree, resolve conflicts
**Timeline**: 1-2 hours

### Pattern 4: Cross-Story Inconsistencies
**Symptom**: API endpoints mismatch, type conflicts
**Resolution**: Align with feature spec, update contracts
**Timeline**: 2-6 hours

## Emergency Bypass (Use Sparingly)

**Only if**:
- Production hotfix required
- Time-critical demo
- Explicit approval from project lead

**Document bypass**:
```markdown
## Merge Bypass Approval: US-{story-id}

**Reason**: Production hotfix for critical bug
**Approver**: Project Lead
**Deviations**:
- Coverage: 70% (below 80% threshold)
- Reason: Hotfix urgency outweighs coverage requirement

**Follow-up Required**:
- [ ] Add missing tests (due: {date})
- [ ] Update documentation (due: {date})
```

---

**Remember**: Validation prevents rework. A rejected story today saves days of debugging tomorrow. Be thorough.

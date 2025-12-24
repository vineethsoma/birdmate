---
description: Review completed user story for merge readiness and quality validation
tags: [delegation, review, validation, qa]
---

# Review Completed Story

Comprehensive review of completed user story before approving merge to main.

## Instructions

You are a **Feature Lead**. Review story completion, validate acceptance criteria, and ensure quality standards before merge approval.

### Step 1: Collect Completion Report

**Agent reports completion**:
```markdown
## Story Complete: US-[N]

**Completed**: [Timestamp]
**Agent**: [Name]
**Commits**: [List commit SHAs]
**Tests**: [Pass/Fail status with coverage]

### Acceptance Criteria
- [x] Criterion 1 completed
- [x] Criterion 2 completed
- [x] Criterion 3 completed

### Implementation Summary
[What was built, key decisions made]

### Handoff to Next Story
- API endpoints: [List]
- Shared types: [Files]
- Database changes: [Migrations]
- Integration points: [Details]

### Ready for Review
- [x] All tests passing
- [x] Code coverage meets standards
- [x] No linting errors
- [x] Documentation updated
```

### Step 2: Validate Acceptance Criteria

**Navigate to story worktree**:
```bash
cd worktrees/feat-us[N]
```

**Check each criterion manually**:
- [ ] Run application and verify behavior
- [ ] Test happy path scenarios
- [ ] Test edge cases mentioned in acceptance criteria
- [ ] Verify error handling works as specified

**If criteria NOT met**:
```markdown
## Review Feedback: US-[N]

**Status**: ❌ Incomplete

**Unmet Criteria**:
- Criterion 2: "Email validation" - Not working for international domains
- Criterion 3: "Error handling" - Missing validation for empty input

**Required Changes**:
1. Add international email domain support (test@domain.co.uk should work)
2. Add validation error for empty search query

**Return to**: [Agent Name]
**Timeline**: Estimate 2-3 hours
```

### Step 3: Code Quality Review

**Run automated checks**:
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Tests
npm test

# Coverage
npm run test:coverage
```

**Manual code review checklist**:
- [ ] **Naming**: Variables and functions have clear, descriptive names
- [ ] **Complexity**: Functions are < 20 lines (CLAUDE C-4)
- [ ] **DRY**: No duplicated code (CLAUDE C-2)
- [ ] **Error handling**: All errors have descriptive messages (CLAUDE E-2)
- [ ] **Comments**: Code is self-documenting, comments only where necessary
- [ ] **TODOs**: No unresolved TODOs in production code

**Coverage standards**:
- Minimum 80% overall coverage
- 100% coverage for critical paths (auth, payments, data integrity)

**If quality issues found**:
```markdown
## Review Feedback: US-[N]

**Status**: ⚠️ Quality Issues

**Issues Found**:
1. Code Quality:
   - `searchBirds()` function is 45 lines (max: 20) - needs extraction
   - Duplicated validation logic in 3 files - extract to shared utility
   
2. Test Coverage:
   - Coverage: 72% (minimum: 80%)
   - Missing tests: `src/services/nlp.ts` (0% coverage)
   
3. Type Safety:
   - 3 uses of `any` type in `src/api/routes.ts` - needs proper typing

**Required Refactoring**:
[Detailed list with file:line references]

**Return to**: [Agent Name]
**Timeline**: Estimate 3-4 hours
```

### Step 4: Constitution Compliance Check

**Review against project constitution**:
```bash
# Check constitution location
cat specs/.specify/memory/constitution.md
# or
cat AGENTS.md  # Look for SPEC-KIT CONSTITUTION section
```

**Validate against principles**:
- [ ] **Core Principle I**: [First principle check]
- [ ] **Core Principle II**: [Second principle check]
- [ ] **Core Principle III**: Test-first followed (tests exist and pass)
- [ ] **Core Principle IV**: [Observability principle]
- [ ] **Core Principle V**: [API/architecture principle]

**Constitution violations**:
```markdown
## Review Feedback: US-[N]

**Status**: ❌ Constitution Violation

**Violations**:
1. Principle III: Test-First Development
   - Tests written AFTER implementation (git log shows)
   - Expected: TDD cycle (Red → Green → Refactor)
   
2. Principle IV: Observability
   - No logging for critical operations (search queries, errors)
   - Expected: Structured logging with context

**Required Changes**:
1. Add logging to search endpoint with query + result count
2. Document TDD approach used for next story

**Return to**: [Agent Name]
**Timeline**: Estimate 1-2 hours
```

### Step 5: Cross-Story Consistency

**Check for conflicts with other stories**:
```bash
# Run consistency validation
npm run validate:consistency

# Check API contracts
cat specs/[feature-id]/contracts/api.openapi.yml

# Compare with other worktrees
diff worktrees/feat-us[N]/src/types/bird.ts worktrees/feat-us[M]/src/types/bird.ts
```

**Consistency checks**:
- [ ] API endpoints match documented contracts
- [ ] Shared types are consistent across stories
- [ ] Database schema aligns with other stories
- [ ] Naming conventions match project standards

**Inconsistencies found**:
```markdown
## Review Feedback: US-[N]

**Status**: ⚠️ Cross-Story Conflict

**Inconsistencies**:
1. API Contract Mismatch:
   - This story: `GET /api/birds/search?q=...`
   - US-002: `GET /api/search/birds?query=...`
   - **Resolution**: Follow spec (spec says `/api/search/birds`)
   
2. Type Definition Conflict:
   - This story: `Bird { species: string }`
   - US-002: `Bird { scientificName: string }`
   - **Resolution**: Merge both fields into shared type

**Required Changes**:
1. Update endpoint to `/api/search/birds?query=...`
2. Add `scientificName` field to Bird type
3. Update all usages

**Coordination**: Notify US-002 agent of type changes

**Return to**: [Agent Name]
**Timeline**: Estimate 2-3 hours
```

### Step 6: Handoff Validation

**If story has dependent stories**:

**Check handoff completeness**:
```bash
# From delegation document
grep "Handoff to Next Story" worktrees/feat-us[N]/DELEGATION.md
```

**Validate handoff items**:
- [ ] **API endpoints**: Documented and tested
- [ ] **Contracts**: OpenAPI spec updated
- [ ] **Shared types**: Exported and importable
- [ ] **Database migrations**: Applied and tested
- [ ] **Integration tests**: Pass with dependent story's mocks

**Incomplete handoff**:
```markdown
## Review Feedback: US-[N]

**Status**: ⚠️ Incomplete Handoff

**Missing for US-[M]**:
- API endpoint `/api/users/{id}` mentioned in plan but not implemented
- `UserProfile` type not exported from shared types
- Migration `002_user_profiles` not created

**Required Changes**:
1. Implement GET /api/users/{id} endpoint
2. Export UserProfile from src/types/user.ts
3. Create and test migration

**Blocker**: US-[M] cannot start until this is complete

**Return to**: [Agent Name]
**Timeline**: Estimate 4-6 hours
```

### Step 7: Approval Decision

**If ALL checks pass**:
```markdown
## Story Review: US-[N] ✅ APPROVED

**Reviewed By**: Feature Lead
**Date**: [Timestamp]

### Summary
- ✅ All acceptance criteria met
- ✅ Code quality standards met (coverage: 94%)
- ✅ Constitution compliance verified
- ✅ Cross-story consistency validated
- ✅ Handoff documentation complete

### Metrics
- **Commits**: 12
- **Files Changed**: +450, -120
- **Test Coverage**: 94% (target: 80%)
- **Tests**: 47 passed, 0 failed

### Next Steps
1. Run merge validation: `/worktree.validate-merge us[N]`
2. Check conflicts: `./scripts/worktree-conflicts.sh us[N]`
3. Merge: `./scripts/worktree-merge.sh us[N]`
4. Clean up: `./scripts/worktree-remove.sh us[N] --delete-branch`
5. Update feature context: `/feature-context-update`
6. Notify dependent story: US-[M]

**Approved**: [Feature Lead Name]
```

**If checks fail**:
```markdown
## Story Review: US-[N] ❌ NOT APPROVED

**Reviewed By**: Feature Lead
**Date**: [Timestamp]

### Issues Summary
- ❌ 2 acceptance criteria incomplete
- ⚠️ Code quality: 4 issues found
- ❌ Constitution: 1 violation (Principle III)
- ⚠️ Cross-story: 1 conflict with US-002

### Required Changes
[Detailed list from previous steps]

### Estimated Rework
**Timeline**: 6-8 hours
**Priority**: High (blocking US-[M])

**Return to**: [Agent Name]
**Status**: In Progress → Rework Required
```

### Step 8: Document Review Decision

**Update delegation document**:
```bash
cat >> worktrees/feat-us[N]/DELEGATION.md << 'EOF'

---

## Review Completed

**Date**: [Timestamp]
**Reviewer**: Feature Lead
**Decision**: APPROVED / NOT APPROVED

**Notes**: [Summary of review findings]

**Next Actions**: [What happens next]
EOF
```

**Update feature context**:
```bash
# Track review completion
echo "US-[N]: Reviewed and approved" >> .feature-context.md
# or
echo "US-[N]: Rework required" >> .feature-context.md
```

## Review Decision Framework

### APPROVE if:
- ✅ All acceptance criteria met
- ✅ Code quality meets standards (coverage ≥ 80%)
- ✅ Constitution compliant
- ✅ No blocking cross-story conflicts
- ✅ Handoff complete (if applicable)

### REQUEST CHANGES if:
- ⚠️ Minor quality issues (refactoring needed)
- ⚠️ Low coverage but tests exist (need more tests)
- ⚠️ Resolvable cross-story conflicts
- ⚠️ Handoff incomplete but fixable

### REJECT if:
- ❌ Acceptance criteria not met
- ❌ Constitution violations
- ❌ Critical bugs found
- ❌ Security vulnerabilities
- ❌ Breaking changes without approval

## Common Review Patterns

### Pattern 1: "Looks Good, Minor Polish"
```markdown
**Status**: ✅ Approved with Minor Polish

All critical items met. Suggest these improvements for future stories:
- Extract `validateInput()` to reduce duplication
- Add JSDoc comments to public API functions

**Approved**: Yes (polish can be addressed in refactoring story)
```

### Pattern 2: "Good Progress, Need Tests"
```markdown
**Status**: ⚠️ Changes Requested (Tests)

Implementation is solid, but coverage is 65% (target: 80%).

**Required**:
- Add tests for `searchByHabitat()` function
- Add edge case tests for empty queries

**Timeline**: 2-3 hours
```

### Pattern 3: "Architecture Deviation"
```markdown
**Status**: ❌ Rejected (Architecture)

Story deviates from constitution's API-first principle:
- Created UI before API implementation
- API contracts not defined

**Required**:
- Define OpenAPI contract first
- Implement API with tests
- Then build UI

**Timeline**: 1 day (significant rework)
```

## Success Criteria

Story is ready to merge when:
- ✅ Feature Lead approves after comprehensive review
- ✅ No blocking issues remain
- ✅ All automated checks pass
- ✅ Manual validation confirms behavior
- ✅ Cross-story consistency verified
- ✅ Handoff documentation complete

---

**Remember**: Your review determines if the story merges to main. Be thorough but fair. Provide clear, actionable feedback with estimated timelines.

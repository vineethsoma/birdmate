# Delegation Brief: [Task Summary]

> Complete context for subagent delegation

---
🚨 **BEFORE RETURNING TO FEATURE LEAD** 🚨

You MUST complete the "SUBAGENT COMPLETION REPORT" section at the bottom.
DO NOT yield control without filling: Status, Completed criteria, Files changed, Test results, Handoff notes.

---

## 📋 Delegation Metadata

| Field | Value |
|-------|-------|
| **Delegated To** | [fullstack-engineer / tdd-specialist / playwright-specialist] |
| **Story** | US-XXX: [Story Title] |
| **Task ID** | DEL-XXX |
| **Priority** | 🔴 High / 🟡 Medium / 🟢 Low |
| **Started** | YYYY-MM-DD HH:MM |
| **Expected Duration** | X hours |
| **Worktree** | `worktrees/feat-usX/` |

## 🎯 Task Description

[Clear, specific description of what needs to be done]

### Acceptance Criteria

- [ ] [Specific, testable criterion 1]
- [ ] [Specific, testable criterion 2]
- [ ] [Specific, testable criterion 3]

### Out of Scope

- [What NOT to do]
- [Boundaries to respect]

## 📁 Context

### Relevant Files

| File | Purpose | Action |
|------|---------|--------|
| `path/to/file.ts` | [What it does] | Read / Modify / Create |

### Dependencies

**Requires** (must be ready):
- [Dependency 1]: [What it provides]

**Provides** (for next tasks):
- [What this task outputs]

### Spec References

- Constitution: `.specify/memory/constitution.md`
- Feature Spec: `specs/XXX/spec.md`
- Plan: `specs/XXX/plan.md`

## 🧠 Domain Context

> CRITICAL: Provide domain knowledge to prevent implementation assumptions

### Core Concepts

| Concept | Explanation | Critical Details |
|---------|-------------|------------------|
| [Key concept] | [What it is] | [What implementer MUST know] |

### Common Pitfalls

| Pitfall | Why It Happens | How to Avoid |
|---------|----------------|---------------|
| [Mistake] | [Root cause] | [Prevention strategy] |

### Reference Materials

- Algorithm/Spec: [Link to explanation]
- Internal docs: [Path to domain guide]

## 🛠️ Implementation Guidance

### Approach

1. [Step 1]
2. [Step 2]
3. [Step 3]

### Technical Constraints

- [Constraint 1]
- [Constraint 2]

### Quality Requirements

- [ ] Follow TDD: Write failing test first
- [ ] Follow CLAUDE Framework standards
- [ ] Minimum 80% test coverage
- [ ] No console.log in production code
- [ ] Update types/interfaces as needed

## 🧪 TDD Artifacts

### Commit Discipline

Use prefixes for TDD cycle visibility:
- 🔴 `RED:` Failing test commit
- 🟢 `GREEN:` Passing implementation
- ♻️ `REFACTOR:` Improvement with tests still green

### Test Data Strategy

- Use test factories: `shared/test-factories.ts`
- Mock external dependencies
- Use beforeEach for isolation

### Coverage Expectations

| Layer | Minimum |
|-------|---------|
| Services | 90% |
| API Routes | 95% |
| Components | 80% |
| Utility Functions | 100% |

## ✅ Quality Milestones

| After Completing | Run | Expected |
|------------------|-----|----------|
| Each component | Component mini-audit | < 2 issues |
| All backend work | Full backend tests | All passing |
| Story completion | Full CLAUDE audit | 0 critical issues |

## ⚠️ Potential Issues

| Risk | Mitigation |
|------|------------|
| [Known risk] | [How to handle] |

## 📝 Commands

```bash
# Navigate to worktree
cd [worktree-path]

# Run tests
npm test

# Run specific test file
npm test -- path/to/test.ts

# Check coverage
npm test -- --coverage
```

---

## 📤 SUBAGENT COMPLETION REPORT

> **IMPORTANT**: Fill this section BEFORE returning

### Status

- [ ] ✅ SUCCESS - All acceptance criteria met
- [ ] ⚠️ PARTIAL - Some criteria met, blockers documented
- [ ] ❌ FAILED - Could not complete, reasons documented

### Completed

| Criterion | Status | Evidence |
|-----------|--------|----------|
| [AC 1] | ✅/❌ | [Test name / commit] |
| [AC 2] | ✅/❌ | |

### Files Changed

| File | Change Type | Summary |
|------|-------------|---------|
| `path/to/file.ts` | Created/Modified/Deleted | [What changed] |

### Test Results

```
Tests: X passing, Y failing
Coverage: XX%
```

### Blockers Encountered

| Blocker | Type | Resolution |
|---------|------|------------|
| [Description] | Technical/External | [How resolved / Still blocked] |

### Learnings

| Learning | Impact | Recommendation |
|----------|--------|----------------|
| [What we learned] | [How it affects future work] | [Action to take] |

### Handoff Notes

[What the next task/person needs to know]

### Retro Notes (For Retrospective)

**What Went Well**: [e.g., TDD caught edge case early]

**Friction Points**: [e.g., missing domain context, unclear acceptance criteria]

**Suggested Improvements**: [e.g., add property tests for math functions]

---

**Completed**: YYYY-MM-DD HH:MM
**Duration**: X hours
**Commits**: [hash1, hash2, ...]

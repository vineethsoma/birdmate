# Story Development Artifacts Guide

> Quick reference for using development artifacts consistently

## 📁 Artifact Locations

```
.specify/
├── templates/                        # Reusable templates
│   ├── story-tracker.template.md     # Progress tracking (Feature Lead)
│   ├── tdd-compliance.checklist.md   # TDD verification (TDD Specialist)
│   ├── delegation-brief.template.md  # Subagent tasks (Feature Lead → Agent)
│   ├── claude-audit.checklist.md     # Code quality (Code Quality Auditor)
│   ├── e2e-test-plan.checklist.md    # E2E testing (Playwright Specialist)
│   └── retro-process.md              # Retrospective workflow (Retro Specialist)
└── memory/
    └── constitution.md               # Project principles

specs/{feature-id}/
├── spec.md                           # Feature specification
├── plan.md                           # Implementation plan
├── tasks.md                          # User stories breakdown
└── retro-{story-id}.md               # Story retrospective

.delegation/                          # Active delegation files
└── archive/                          # Completed delegations

.retro/                               # Retro input files (YAML)
└── us-xxx-{agent}.yml                # Per-agent retro input

.memory/
└── retro-log.md                      # Improvement tracking
```

## 🎭 Template Ownership

| Template | Owner | Contributors | When Used |
|----------|-------|--------------|-----------|
| **story-tracker** | Feature Lead | All agents report | Throughout story |
| **tdd-compliance** | TDD Specialist (reviews) | Fullstack Engineer (fills) | Implementation |
| **delegation-brief** | Feature Lead (creates) | Receiving agent (completes) | Each delegation |
| **claude-audit** | Code Quality Auditor | Fullstack Engineer (fixes) | Each component + pre-merge |
| **e2e-test-plan** | Playwright Specialist | Fullstack Engineer (context) | Integration phase |
| **retro-process** | Retro Specialist | All agents contribute | Post-merge |

## 🔄 Story Lifecycle Workflow

### Phase 1: Story Kickoff (Feature Lead)

```bash
# 1. Create story tracker
cp .specify/templates/story-tracker.template.md specs/{feature}/tracker-{story}.md

# 2. Create worktree
git worktree add -b feat-{story} worktrees/feat-{story} main
```

### Phase 2: Implementation (Fullstack Engineer + TDD Specialist)

**For each delegation**:
```bash
# 1. Feature Lead creates delegation brief with domain context
cp .specify/templates/delegation-brief.template.md .delegation/{story}-{task}.md

# 2. Fill domain context, TDD requirements, quality milestones

# 3. Delegate to subagent

# 4. VERIFY completion report was filed
cat .delegation/{story}-{task}.md | grep -A 20 "SUBAGENT COMPLETION REPORT"

# 5. Archive after verification
mv .delegation/{story}-{task}.md .delegation/archive/
```

**Commit convention** (TDD cycles):
```bash
git commit -m "🔴 RED: test for [behavior]"
git commit -m "🟢 GREEN: implement [feature]"
git commit -m "♻️ REFACTOR: extract [helper]"
```

**Quality gates after each component**:
- Run component mini-audit (< 2 issues)
- Verify test coverage meets thresholds

### Phase 3: Integration (Playwright Specialist)

```bash
# 1. Create E2E test plan
cp .specify/templates/e2e-test-plan.checklist.md specs/{feature}/e2e-{story}.md

# 2. Implement E2E tests for all acceptance criteria

# 3. Verify tests pass 3 consecutive times

# 4. E2E must pass to merge (blocking)
```

### Phase 4: Pre-Merge (Code Quality Auditor)

```bash
# 1. Run full CLAUDE audit
cp .specify/templates/claude-audit.checklist.md specs/{feature}/audit-{story}.md

# 2. Fix all critical issues

# 3. Verify all tests pass
cd backend && npm test
cd frontend && npm test
npx playwright test
```

### Phase 5: Post-Merge Retro (Retro Specialist → Agent Package Manager)

```bash
# 1. Gather input from all agents
# Each agent creates: .retro/us-xxx-{agent}.yml

# 2. Synthesize learnings into process improvements

# 3. Create handoff spec for Agent Package Manager
# .delegation/retro-handoff-us-xxx.yml

# 4. Agent Package Manager implements changes
# Updates skills, agents, templates
# Bumps versions, updates .memory/retro-log.md

# 5. Clean up
git worktree remove worktrees/feat-{story}
git branch -d feat-{story}
```

### Phase 4: Post-Merge

```bash
# 1. Create retrospective
# Document learnings in specs/{feature}/retro-{story}.md

# 2. Clean up
git worktree remove worktrees/feat-{story}
git branch -d feat-{story}

# 3. Update skills with learnings
# Add new knowledge to agent-packages/skills/
```

## 📋 Artifact Cheat Sheet

| When | Use This Artifact |
|------|-------------------|
| Starting a story | `story-tracker.template.md` |
| Before writing code | `tdd-compliance.checklist.md` |
| Delegating to subagent | `delegation-brief.template.md` |
| Before merging | `claude-audit.checklist.md` |
| After merging | Create `retro-{story}.md` |

## ✅ Quality Gates Summary

| Gate | When | Required Score |
|------|------|----------------|
| TDD Red Phase | Before each implementation | Test must fail |
| TDD Green Phase | After implementation | Test must pass |
| Component Audit | After major component | No critical issues |
| Full CLAUDE Audit | Before merge | Grade C or higher (21+/30) |
| Constitution Check | Before merge | All principles verified |

## 🎯 Success Metrics

Track these per story:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Test Coverage | ≥80% | `npm test -- --coverage` |
| TDD Violations | 0 | Count in TDD checklist |
| Critical Issues | 0 | CLAUDE audit findings |
| Delegation Success | 100% | Reports filed / Delegations |
| Constitution Alignment | 100% | All principles checked |

## 🔧 Troubleshooting

### Subagent didn't write report
1. Check delegation file: `cat .delegation/{file}.md`
2. Verify task completed: run tests, check git status
3. If incomplete: re-delegate with explicit instructions
4. Document in story tracker under "Delegation Issues"

### Tests failing after refactor
1. Revert to last green: `git checkout -- {file}`
2. Make smaller change
3. Re-run tests
4. Document in TDD checklist

### CLAUDE audit failing
1. Fix all critical issues (required)
2. Fix high priority issues (recommended)
3. Document exceptions with justification
4. Re-run audit to verify

---

**Version**: 1.0.0
**Created**: 2025-12-25
**Based on**: US-001 Retrospective Learnings

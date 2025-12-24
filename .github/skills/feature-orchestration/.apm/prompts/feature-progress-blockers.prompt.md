---
description: Identify blockers preventing story or feature progress
tags: [feature, blockers, dependencies, troubleshooting]
---

# Identify Progress Blockers

Analyze feature context to identify and categorize blockers preventing story or feature progress.

## Instructions

You are investigating blockers affecting feature velocity and proposing solutions.

### Step 1: Gather Context

Read:
- `specs/{feature-id}/.feature-context.md` - Feature context
- `specs/{feature-id}/tasks.md` - Story statuses
- Git worktree list - Active branches
- Recent progress log entries

### Step 2: Identify Blocker Types

Classify blockers into categories:

## Blocker Categories

### 1. Dependency Blockers

**Definition**: Story cannot progress because it depends on incomplete work.

**Symptoms**:
- Story marked as ⏳ Blocked in context
- Dependency story still in progress
- Cannot start without prerequisite data/API/component

**Example**:
```markdown
**Blocker**: US-003 depends on US-002 API endpoints

**Impact**: US-003 cannot start until US-002 merged
**Story**: US-003 (Integration tests)
**Depends On**: US-002 (Backend API)
**Status**: US-002 is 60% complete
**ETA**: US-002 expected completion in 2 days

**Resolution Options**:
1. Wait for US-002 completion (recommended)
2. Mock US-002 API and start US-003 in parallel
3. Re-prioritize US-003 to later in backlog
```

### 2. WIP Limit Blockers

**Definition**: Cannot start new story because WIP limit reached.

**Symptoms**:
- WIP tracker shows 3/3 slots filled
- Stories in backlog ready to start
- All agents busy

**Example**:
```markdown
**Blocker**: WIP limit reached (3/3)

**Current WIP**:
- US-001: Agent A (90% complete, expected today)
- US-002: Agent B (40% complete, expected 3 days)
- US-004: Agent C (70% complete, expected tomorrow)

**Waiting Stories**:
- US-003: Ready to start (depends on US-001)
- US-005: Ready to start (no dependencies)

**Resolution**:
1. Wait for US-001 or US-004 completion (< 1 day)
2. Do NOT violate WIP limit
3. Prioritize US-003 next (has dependency just completing)
```

### 3. Technical Blockers

**Definition**: Implementation issue preventing progress.

**Symptoms**:
- Agent reports technical challenge
- Failing tests blocking merge
- Performance issues discovered
- Library/dependency issues

**Example**:
```markdown
**Blocker**: TypeScript compilation errors in US-002

**Details**:
- Agent B reports type conflicts between frontend/backend
- Error: "Type 'User' is not assignable to type 'UserProfile'"
- Affects: frontend/src/types/user.ts

**Root Cause**:
- US-001 defined User type with { id, email }
- US-002 expects { id, email, name }
- Missing shared type definition

**Resolution**:
1. Update shared types in src/types/shared.ts
2. Agent A (US-001 author) to add name field
3. Coordinate type definition between agents
4. ETA: 2 hours
```

### 4. Merge Conflict Blockers

**Definition**: Story ready but conflicts with main branch.

**Symptoms**:
- Story complete, tests passing
- Git merge shows conflicts
- Cannot merge without resolution

**Example**:
```markdown
**Blocker**: Merge conflicts in US-003 with main

**Conflicts**:
- File: src/api/users.ts (lines 45-67)
- Cause: US-004 merged first, modified same function
- Impact: Cannot merge US-003 until resolved

**Resolution**:
1. Agent C to rebase US-003 on latest main
2. Resolve conflicts (favor US-004 changes, integrate US-003 logic)
3. Re-run tests after rebase
4. ETA: 1 hour
```

### 5. Clarity/Spec Blockers

**Definition**: Agent unclear about requirements.

**Symptoms**:
- Agent asks clarifying questions
- Implementation diverging from intent
- Ambiguous acceptance criteria

**Example**:
```markdown
**Blocker**: Ambiguous requirement in US-002

**Question from Agent B**:
"Spec says 'search returns relevant results' - what's the ranking algorithm?"

**Impact**:
- Agent B paused implementation (waiting for clarification)
- 50% complete, needs guidance to continue

**Resolution**:
1. Feature Lead to clarify: Use TF-IDF relevance scoring
2. Update spec.md with ranking algorithm section
3. Agent B to resume implementation
4. ETA: Unblocked immediately after clarification
```

### 6. Resource/Availability Blockers

**Definition**: Agent unavailable or overloaded.

**Symptoms**:
- No progress updates from agent
- Agent reports overload
- Story assigned but not started

**Example**:
```markdown
**Blocker**: Agent A unavailable (out sick)

**Impact**:
- US-001 paused at 80% complete
- US-003 depends on US-001 (cannot start)

**Resolution Options**:
1. Wait for Agent A return (ETA: tomorrow)
2. Reassign US-001 to Agent D (context handoff needed)
3. Prioritize US-005 instead (no dependencies)

**Recommendation**: Wait 1 day, reassign if Agent A not back
```

## Blocker Analysis Template

```markdown
# Feature Progress Blocker Analysis

**Feature**: [Feature Name]
**Analysis Date**: [Timestamp]
**Analyzer**: Feature Lead

## Current Blockers

### Critical Blockers (Stopping Progress)

**Blocker 1**: [Title]
- **Type**: [Dependency | WIP Limit | Technical | Merge Conflict | Clarity | Resource]
- **Affected Story**: [Story ID]
- **Impact**: [What cannot progress]
- **Root Cause**: [Why it's blocked]
- **Resolution**: [Proposed solution]
- **ETA**: [When resolved]
- **Owner**: [Who will resolve]

### Non-Critical Blockers (Slowing Progress)

[Less urgent issues]

## Blocker Impact Analysis

**Stories Blocked**: [Count and list]
**Estimated Delay**: [Days impacted]
**Workarounds Available**: [Yes/No - describe if yes]

## Resolution Plan

### Immediate Actions (Today)
1. [Action with owner]
2. [Action with owner]

### Short-Term (This Week)
1. [Action with owner]

### Preventive Measures
[How to avoid similar blockers]

## Velocity Impact

**Before Blockers**: [Stories per week]
**Current**: [Stories per week]
**After Resolution**: [Expected stories per week]
```

## Example Analysis

```markdown
# Feature Progress Blocker Analysis: Bird Search

**Feature**: Natural Language Bird Search
**Analysis Date**: 2025-12-24 10:00
**Analyzer**: Feature Lead

## Current Blockers

### Critical Blockers

**Blocker 1**: US-003 Depends on US-002 API
- **Type**: Dependency Blocker
- **Affected Story**: US-003 (Integration Tests)
- **Impact**: Cannot start US-003 until US-002 complete
- **Root Cause**: US-003 tests require /api/search endpoint from US-002
- **Resolution**: Complete US-002 first, then unblock US-003
- **ETA**: US-002 completion in 2 days
- **Owner**: Agent B (US-002) to notify when ready

**Blocker 2**: Type Conflicts in US-002
- **Type**: Technical Blocker
- **Affected Story**: US-002 (Frontend UI)
- **Impact**: TypeScript compilation failing, cannot merge
- **Root Cause**: User type mismatch between US-001 and US-002
- **Resolution**: 
  1. Agent A to update shared User type
  2. Agent B to recompile and test
- **ETA**: 2 hours
- **Owner**: Agent A (update types), Agent B (verify fix)

### Non-Critical Blockers

**Blocker 3**: WIP Limit Reached
- **Type**: WIP Limit Blocker
- **Affected Story**: US-004 (waiting to start)
- **Impact**: Cannot delegate US-004 yet
- **Root Cause**: All 3 WIP slots filled
- **Resolution**: Wait for US-001 completion (expected tomorrow)
- **ETA**: 1 day
- **Owner**: Feature Lead (monitor WIP, delegate when slot opens)

## Blocker Impact Analysis

**Stories Blocked**: 2 (US-003, US-004)
**Estimated Delay**: 2-3 days total
**Workarounds Available**: 
- US-003: Could mock US-002 API, but not recommended (increases rework)
- US-004: None (WIP limit is hard constraint)

## Resolution Plan

### Immediate Actions (Today)
1. **Agent A**: Update shared User type to resolve US-002 blocker (2 hours)
2. **Agent B**: Verify type fix and continue US-002 (30 minutes after fix)

### Short-Term (This Week)
1. **Feature Lead**: Monitor US-002 completion, unblock US-003 when ready
2. **Feature Lead**: Delegate US-004 when US-001 completes (frees WIP slot)

### Preventive Measures
1. **Establish shared types early**: Define all shared types before parallel work
2. **Daily sync**: 15-minute daily check-in to catch blockers early
3. **Spec clarity checkpoint**: Review acceptance criteria with agents before starting

## Velocity Impact

**Before Blockers**: ~3 stories per week
**Current**: 1 story per week (2 blocked)
**After Resolution**: Expected return to 3 stories per week
```

## When to Run Blocker Analysis

- **Daily**: Quick scan for new blockers
- **When story reports blocker**: Immediate deep dive
- **When velocity drops**: Investigate why stories slowing
- **Before retrospective**: Learn from blocker patterns

## Blocker Resolution Principles

1. **Unblock fast**: Address blockers within 24 hours
2. **Root cause**: Don't just work around, fix underlying issue
3. **Prevent recurrence**: Add processes to prevent similar blockers
4. **Communicate**: Keep all agents informed of blocker status
5. **Prioritize**: Focus on critical path blockers first

---

**Remember**: Blockers are velocity killers. Identify early, resolve fast, prevent future recurrence.

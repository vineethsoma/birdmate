---
description: Update feature context based on story progress and changes
tags: [feature, context, update]
---

# Update Feature Context

Update the feature context file to reflect current state, progress, and changes.

## Instructions

You are updating the feature orchestration context file after a significant event (story completion, blocker, dependency change).

### Step 1: Identify What Changed

Determine the trigger for this update:
- ✅ Story completed and merged
- 🔄 Story started (new WIP)
- 🚫 Blocker identified
- 🔗 Dependency changed
- 📝 Contract updated
- 🌿 Branch created/removed

### Step 2: Update Feature Context

Read the current context file: `specs/{feature-id}/.feature-context.md`

Update the relevant sections:

**Stories Section**:
```markdown
## Stories

- [x] US-001: Create API endpoint - Status: ✅ Completed (merged commit: abc123)
- [ ] US-002: Build search UI - Status: 🔄 In Progress (Agent: fullstack-engineer, Branch: feat-us2)
- [ ] US-003: Integration - Status: ⏳ Blocked (Waiting for US-002)
```

**WIP Tracker**:
```markdown
## WIP Tracker

| Slot | Story | Agent | Status | Branch |
|------|-------|-------|--------|--------|
| 1    | US-002 | fullstack-engineer | 🔄 WIP | feat-us2 |
| 2    | -     | -     | -      | -      |
| 3    | -     | -     | -      | -      |

**Current WIP**: 1/3
```

**Active Branches**:
```markdown
## Active Branches

- `feat-us2` → worktrees/feat-us2/ (fullstack-engineer working on US-002)
```

**Progress Log** (append new entry):
```markdown
## Progress Log

### 2025-12-24 14:30
- US-001 completed and merged to main (commit: abc123)
- US-002 started, worktree created at worktrees/feat-us2
- WIP updated: 1/3

### 2025-12-24 10:00
- Feature orchestration initialized
```

### Step 3: Update Timestamp

Update the "Last Updated" field at the top:
```markdown
**Last Updated**: 2025-12-24 14:30:00
```

### Step 4: Check for Status Changes

If feature status should change, update:
- ⏳ Not Started → 🔄 In Progress (when first story starts)
- 🔄 In Progress → ✅ Completed (when all stories done)
- 🔄 In Progress → 🚫 Blocked (if critical blocker)

### Step 5: Summary

Provide a brief summary of what was updated:

```markdown
## Context Update Summary

**Date**: 2025-12-24 14:30
**Trigger**: Story US-001 completion

**Changes**:
- ✅ Marked US-001 as completed (commit abc123)
- 🔄 Started US-002, assigned to fullstack-engineer
- 📊 Updated WIP tracker (1/3)
- 🌿 Added feat-us2 to active branches
- 📝 Added progress log entry

**Next Actions**:
- Monitor US-002 progress
- Prepare US-003 for delegation when US-002 completes
```

## Validation Gates

Before finalizing update:

- ✅ WIP count accurate (≤ 3)
- ✅ Story statuses match tasks.md checkboxes
- ✅ Active branches match git worktree list
- ✅ Dependencies documented
- ✅ Progress log has new entry
- ✅ Timestamp updated

## Common Update Scenarios

### Scenario 1: Story Completion
```markdown
**Trigger**: Agent reports US-001 complete

**Updates**:
1. Story status: ⏳ → ✅ (add commit hash)
2. WIP tracker: Clear slot, decrement count
3. Active branches: Remove branch entry
4. Progress log: Add completion entry
5. Check: Any blocked stories now unblocked?
```

### Scenario 2: New Story Started
```markdown
**Trigger**: Delegating US-002 to agent

**Updates**:
1. Story status: ⏳ → 🔄 (add agent, branch)
2. WIP tracker: Fill slot, increment count
3. Active branches: Add new branch entry
4. Progress log: Add start entry
5. Check: WIP limit not exceeded (≤ 3)
```

### Scenario 3: Blocker Identified
```markdown
**Trigger**: Agent reports blocker in US-003

**Updates**:
1. Story status: 🔄 → 🚫 (add blocker description)
2. Dependencies: Document what's blocking
3. Progress log: Add blocker entry
4. Check: Notify dependent agents
```

---

**Remember**: Keep context up-to-date after EVERY significant event. Stale context leads to conflicts.

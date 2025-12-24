---
description: Change story priority and resequence backlog based on new information
tags: [delegation, prioritization, planning, backlog]
---

# Reprioritize Stories

Adjust story priorities and resequence backlog when requirements, blockers, or business priorities change.

## Instructions

You are a **Feature Lead**. Manage story priorities to maximize value delivery and minimize blockers.

### Step 1: Understand Reprioritization Trigger

**Common triggers**:

1. **Blocker Discovered**
   ```markdown
   US-005 is blocked by US-003 (unexpected dependency discovered)
   → Deprioritize US-005 until US-003 completes
   ```

2. **Business Priority Shift**
   ```markdown
   Stakeholder: "We need search feature for demo next week"
   → Elevate US-002 (search UI) to High priority
   ```

3. **Technical Risk Identified**
   ```markdown
   US-007 has higher technical risk than expected
   → Move to end of backlog, schedule spike first
   ```

4. **Resource Constraint**
   ```markdown
   Only 1 fullstack engineer available this week
   → Prioritize stories for available skill set
   ```

5. **Dependency Chain Optimization**
   ```markdown
   US-004 enables US-006 and US-007
   → Elevate US-004 to unblock parallel work
   ```

### Step 2: Review Current Backlog

**List all stories with current priorities**:
```bash
# Read task breakdown
cat specs/[feature-id]/tasks.md
```

**Current state example**:
```markdown
## Backlog

| Story | Title | Priority | Status | Dependencies | Agent |
|-------|-------|----------|--------|--------------|-------|
| US-001 | Search API | High | 🔄 WIP | None | Agent-A |
| US-002 | Search UI | High | 🔄 WIP | US-001 | Agent-B |
| US-003 | Taxonomy DB | Medium | 🔄 WIP | None | Agent-C |
| US-004 | User Auth | Medium | ⏳ Queued | None | - |
| US-005 | Search History | Low | ⏳ Queued | US-002 | - |
| US-006 | Export Results | Low | ⏳ Queued | US-002 | - |
| US-007 | Advanced Filters | Low | ⏳ Queued | US-001 | - |
```

### Step 3: Analyze Impact

**For each proposed change**:

**Questions to ask**:
1. What stories does this affect?
2. Will this create new blockers?
3. What's the cost of delaying other stories?
4. Does this violate WIP limits?
5. Can we parallelize differently?

**Impact analysis template**:
```markdown
## Reprioritization Impact Analysis

**Proposed Change**: [What you want to change]

**Affected Stories**:
- US-[N]: [Impact description]
- US-[M]: [Impact description]

**Benefits**:
- [Benefit 1]
- [Benefit 2]

**Costs/Risks**:
- [Cost/Risk 1]
- [Cost/Risk 2]

**Recommendation**: [Proceed / Defer / Alternative]
```

### Example Impact Analyses

#### Example 1: Business Priority Shift
```markdown
## Reprioritization Impact Analysis

**Proposed Change**: Elevate US-002 (Search UI) from High to Critical for demo

**Current State**:
- US-001 (Search API): 🔄 WIP, 80% complete
- US-002 (Search UI): 🔄 WIP, 40% complete, blocked by US-001
- US-003 (Taxonomy DB): 🔄 WIP, 60% complete

**Affected Stories**:
- US-002: Would prioritize finishing over other WIP
- US-003: Might delay if we shift resources

**Benefits**:
- Meets demo deadline
- Shows user-facing value early

**Costs/Risks**:
- US-002 blocked until US-001 completes (can't accelerate much)
- US-003 delay might block US-004 (User Auth needs taxonomy)

**Recommendation**: 
- Keep current priorities BUT
- Add pressure to complete US-001 (unblocks US-002)
- Have US-002 agent prepare mocked data to work in parallel
- US-003 continues as-is (needed for US-004)
```

#### Example 2: Blocker Discovered
```markdown
## Reprioritization Impact Analysis

**Proposed Change**: Deprioritize US-005 (Search History) - blocked by US-004 (User Auth)

**Current State**:
- US-004 (User Auth): ⏳ Queued (not started)
- US-005 (Search History): ⏳ Queued (next in line)

**Affected Stories**:
- US-005: Was next, now must wait
- US-004: Should be elevated to unblock US-005

**Benefits**:
- Prevents starting work on blocked story
- Focuses effort on unblocking dependencies

**Costs/Risks**:
- Delays US-005 by ~3 days (US-004 implementation time)

**Recommendation**: 
1. Move US-004 ahead of US-005 in backlog
2. Start US-004 as soon as WIP slot available
3. Document dependency in US-005 delegation
4. Consider: Can US-005 start with mocked auth? (probably not, needs real user sessions)
```

#### Example 3: Resource Constraint
```markdown
## Reprioritization Impact Analysis

**Proposed Change**: Resequence stories for single fullstack engineer this week

**Current State**:
- 1 fullstack engineer available
- 3 stories queued (US-004, US-005, US-006)

**Affected Stories**:
- US-004 (User Auth): Backend + Frontend
- US-005 (Search History): Backend + Frontend + DB
- US-006 (Export Results): Frontend-only

**Benefits**:
- Optimize for available skills
- Maintain velocity despite resource constraint

**Costs/Risks**:
- Might shift delivery order
- US-005 more complex (higher risk)

**Recommendation**:
1. US-004 first (critical dependency, medium complexity)
2. US-006 second (simpler, frontend-only, quick win)
3. US-005 third (most complex, schedule when more time available)

**Rationale**: US-006 can be done faster, shows progress, less risky than US-005
```

### Step 4: Make Reprioritization Decision

**Decision criteria**:
- ✅ Unblocks critical path
- ✅ Aligns with business priorities
- ✅ Respects dependencies
- ✅ Considers resource availability
- ✅ Maintains quality (no corner-cutting)

**Decision template**:
```markdown
## Reprioritization Decision

**Date**: [Timestamp]
**Decided By**: Feature Lead

**Change**:
[FROM] Old priority order / assignments
[TO] New priority order / assignments

**Rationale**: [Why this change is made]

**Action Items**:
1. [What needs to happen]
2. [Who needs to be notified]
3. [What documentation to update]

**Effective**: [Immediate / After US-[N] completes]
```

### Step 5: Update Backlog

**Update task breakdown**:
```bash
vim specs/[feature-id]/tasks.md
```

**New backlog order**:
```markdown
## Updated Backlog (2025-12-24)

| Story | Title | Priority | Status | Dependencies | Agent | Notes |
|-------|-------|----------|--------|--------------|-------|-------|
| US-001 | Search API | Critical | 🔄 WIP | None | Agent-A | Demo blocker |
| US-004 | User Auth | High | ⏳ Queued | None | - | Unblocks US-005 |
| US-002 | Search UI | High | 🔄 WIP | US-001 | Agent-B | Demo blocker |
| US-003 | Taxonomy DB | Medium | 🔄 WIP | None | Agent-C | - |
| US-006 | Export Results | Medium | ⏳ Queued | US-002 | - | Quick win |
| US-005 | Search History | Low | ⏳ Queued | US-002, US-004 | - | Deprioritized (blocked) |
| US-007 | Advanced Filters | Low | ⏳ Queued | US-001 | - | - |

**Change Log**:
- 2025-12-24: Elevated US-004 to High (unblocks US-005)
- 2025-12-24: Moved US-006 ahead of US-005 (simpler, fewer dependencies)
- 2025-12-24: US-001 marked Critical for demo deadline
```

**Commit changes**:
```bash
git add specs/[feature-id]/tasks.md
git commit -m "refactor: reprioritize stories (US-004 elevated, US-005 deprioritized)"
git push origin main
```

### Step 6: Communicate Changes

**Notify affected agents**:
```markdown
## Backlog Reprioritization Notice

**Date**: 2025-12-24
**Effective**: Immediately

### Changes Made

1. **US-004 (User Auth)**: Elevated to High priority
   - **Reason**: Unblocks US-005 (Search History)
   - **Impact**: Will be started as soon as WIP slot available
   - **Agent**: TBD (assign when slot opens)

2. **US-005 (Search History)**: Deprioritized to Low
   - **Reason**: Blocked by US-004 (newly discovered dependency)
   - **Impact**: Delayed ~3 days until US-004 completes
   - **Agent**: N/A (not assigned yet)

3. **US-006 (Export Results)**: Moved ahead of US-005
   - **Reason**: Simpler, fewer dependencies, quick win
   - **Impact**: Will be started before US-005
   - **Agent**: TBD

### Current WIP (No Change)
- US-001 (Search API) - Agent-A - 80% complete
- US-002 (Search UI) - Agent-B - 40% complete
- US-003 (Taxonomy DB) - Agent-C - 60% complete

### Next Story to Start
When a WIP slot opens: **US-004 (User Auth)**

**Questions?** Contact Feature Lead
```

**Update feature context**:
```bash
cat >> .feature-context.md << 'EOF'

### Backlog Changes (2025-12-24)
- US-004 elevated (High) - unblocks US-005
- US-005 deprioritized (Low) - blocked by US-004
- US-006 moved ahead - simpler, quick win

**Reason**: Optimize for dependencies and resource availability
EOF
```

### Step 7: Adjust Delegation Plans

**If story already assigned**:
```markdown
## Priority Change Notice: US-[N]

**Previous Priority**: Medium
**New Priority**: High
**Reason**: [Explanation]

**Impact on Your Work**:
- [How this affects agent's timeline]
- [Any new expectations]

**Action Required**:
- [If any changes to approach needed]
- [If completion timeline changes]
```

**If story not yet assigned**:
- Update delegation document template
- Add priority context to handoff
- Adjust assignment criteria if needed

## Reprioritization Anti-Patterns

**🚫 DON'T**:
- Change priorities without analysis
- Skip communicating changes to team
- Forget to update backlog documentation
- Interrupt WIP stories unnecessarily
- Ignore dependencies when reordering
- Reprioritize too frequently (creates chaos)

**✅ DO**:
- Analyze impact before changing
- Communicate clearly with rationale
- Update all documentation
- Respect WIP limits and dependencies
- Document decision reasoning
- Batch related changes when possible

## Reprioritization Frequency Guidelines

**When to reprioritize**:
- ✅ Major blocker discovered
- ✅ Business priority shift (stakeholder request)
- ✅ Technical risk identified
- ✅ Resource availability changes
- ✅ Dependency chain optimization opportunity

**When NOT to reprioritize**:
- ❌ Minor inconvenience
- ❌ Agent preference without clear benefit
- ❌ Every day (creates instability)
- ❌ Mid-story (let current WIP complete)

**Best practice**: Batch reprioritization at natural boundaries (story completions, sprint transitions)

## Success Criteria

Reprioritization is successful when:
- ✅ Rationale is clear and documented
- ✅ All affected parties notified
- ✅ Backlog documentation updated
- ✅ Dependencies respected
- ✅ Quality standards maintained
- ✅ Team velocity improved or maintained

---

**Remember**: Reprioritization is about optimizing value delivery. Every change should have a clear rationale and be communicated to affected agents.

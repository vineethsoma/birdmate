---
description: Coordinate multi-story feature development with context management, consistency
  validation, and progress tracking across parallel workstreams
metadata:
  apm_commit: unknown
  apm_installed_at: '2025-12-23T18:13:07.059399'
  apm_package: vineethsoma/agent-packages/skills/feature-orchestration
  apm_version: 1.0.0
name: feature-orchestration
---

# Feature Orchestration

Manage complex features spanning multiple user stories with parallel development, cross-story consistency, and adherence to feature specifications.

---

## Core Responsibilities

### 1. Feature Context Management

**Maintain the big picture across all user stories**

```markdown
## Feature Context Template

**Feature**: [Feature Name from Constitution/Spec]
**Stories**: [List of user stories with status]
**Active Branches**: [Worktree branches currently WIP]
**Dependencies**: [Cross-story dependencies]
**Last Sync**: [When context was last updated]

### Story Handoffs
- Story A → Story B: [What state/data/contracts must be ready]
- Story B → Story C: [Dependencies and prerequisites]

### Known Issues
- [Cross-story concerns that need resolution]
```

**Commands**:
- `/feature.context.update`: Update feature context after story completion
- `/feature.context.review`: Review current feature state vs. spec

**Workflow**:
1. **At feature start**: Initialize context from spec/plan
2. **After each story**: Update dependencies, note handoff requirements
3. **Before new story**: Check context for prerequisites
4. **At merge time**: Validate feature completeness against spec

---

### 2. Consistency Validation

**Ensure all stories align with constitution and feature spec**

**Validation Checklist**:
```markdown
## Cross-Story Consistency Check

### Constitution Alignment
- [ ] All stories follow [Constitution Principle I]
- [ ] Test coverage meets constitution standards (e.g., 80%+)
- [ ] Security requirements applied across all stories

### Specification Consistency
- [ ] API contracts match across stories (no breaking changes)
- [ ] Data models consistent (no schema conflicts)
- [ ] User flows connect properly (Story A output → Story B input)
- [ ] Performance targets met across all stories

### Technical Debt
- [ ] No duplicate code across story branches
- [ ] Shared utilities extracted (not copied)
- [ ] Consistent error handling patterns
```

**Commands**:
- `/feature.validate.consistency`: Check for cross-story conflicts
- `/feature.validate.spec`: Verify feature completeness against spec
- `/feature.validate.constitution`: Audit constitution compliance

**Anti-Patterns to Detect**:
- ❌ **API Drift**: Story A defines `/api/birds`, Story B expects `/api/v1/birds`
- ❌ **Data Model Conflicts**: Story A uses `userId`, Story B uses `user_id`
- ❌ **Duplicate Code**: Same utility function in 3 different branches
- ❌ **Test Gaps**: Story A has 90% coverage, Story B has 20%

---

### 3. Progress Tracking

**Monitor WIP limits and story completion**

**Progress Dashboard**:
```markdown
## Feature Progress

**WIP Limit**: 3 stories (ENFORCED)
**Completed**: 5/12 stories
**In Progress**: 3 stories (AT LIMIT)
**Blocked**: 1 story (waiting on Story 3)

| Story | Status | Branch | Assignee | Blockers | ETA |
|-------|--------|--------|----------|----------|-----|
| US1   | ✅ Done | merged | - | - | - |
| US2   | ✅ Done | merged | - | - | - |
| US3   | 🔄 WIP | feat/us3 | Agent-A | None | Today |
| US4   | 🔄 WIP | feat/us4 | Agent-B | None | Tomorrow |
| US5   | 🔄 WIP | feat/us5 | Agent-C | None | Tomorrow |
| US6   | ⏸️ Blocked | - | - | Needs US3 API | TBD |
| US7   | 📋 Ready | - | - | None | - |
```

**Commands**:
- `/feature.progress.status`: Show current progress dashboard
- `/feature.progress.next`: Determine next story to start (respecting WIP limit)
- `/feature.progress.blockers`: Identify and resolve blockers

**WIP Limit Enforcement**:
```markdown
## WIP Limit Protocol

1. **Before starting new story**:
   - Check: `current_wip < wip_limit` (default: 3)
   - If at limit: STOP. Wait for story completion.
   - If under limit: Proceed with task delegation

2. **When story completes**:
   - Update progress tracker
   - Merge story branch
   - Check for unblocked stories
   - Start next story if under WIP limit

3. **If story is blocked**:
   - Mark as blocked with reason
   - Does NOT count against WIP limit
   - Re-evaluate after each story completion
```

---

## Integration with Spec-Driven Development

**Feature orchestration operates at the feature level, above individual stories**:

```
Constitution (spec-kit)
    ↓
Feature Spec (spec-kit: /speckit.specify)
    ↓
Feature Plan (spec-kit: /speckit.plan)
    ↓
📍 FEATURE ORCHESTRATION STARTS HERE
    ↓
Story Breakdown (spec-kit: /speckit.tasks → user stories)
    ↓
Story 1 Branch ← Fullstack Engineer (TDD, claude-framework)
Story 2 Branch ← Fullstack Engineer (TDD, claude-framework)
Story 3 Branch ← Fullstack Engineer (TDD, claude-framework)
    ↓
📍 FEATURE ORCHESTRATION: Merge & Validate
    ↓
Feature Complete (spec-kit: /speckit.analyze)
```

**Handoff Points**:
1. **From Spec-Kit to Feature Orchestration**: Tasks broken down into parallelizable user stories
2. **From Feature Orchestration to Engineers**: Story context + branch + acceptance criteria
3. **From Engineers to Feature Orchestration**: Completed story + tests + merge request
4. **From Feature Orchestration to Spec-Kit**: Feature completion validation

---

## Commands Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/feature.init` | Initialize feature orchestration | At feature kickoff |
| `/feature.context.update` | Update feature context | After story completion |
| `/feature.context.review` | Review feature state | Before starting new story |
| `/feature.validate.consistency` | Check cross-story conflicts | Before merging stories |
| `/feature.validate.spec` | Verify spec completeness | At feature completion |
| `/feature.validate.constitution` | Audit constitution compliance | Continuous |
| `/feature.progress.status` | Show progress dashboard | Daily standup |
| `/feature.progress.next` | Determine next story | When under WIP limit |
| `/feature.progress.blockers` | Identify blockers | When stories stall |

---

## Best Practices

### ✅ Do This

- **Maintain living context**: Update after every story completion
- **Enforce WIP limits strictly**: No exceptions to 3-story limit
- **Validate early and often**: Run consistency checks before merging
- **Document handoffs explicitly**: Make dependencies crystal clear
- **Use git worktree**: Keep story branches isolated

### ❌ Don't Do This

- **Skip context updates**: Leads to merge conflicts and confusion
- **Exceed WIP limits**: Reduces throughput and increases context switching
- **Validate only at end**: Catch conflicts early, not at merge time
- **Assume implicit dependencies**: Document everything
- **Mix stories in one branch**: Keep stories isolated for parallel work

---

## Success Metrics

- ✅ **WIP limit respected**: Never exceed 3 concurrent stories
- ✅ **No merge conflicts**: Cross-story consistency maintained
- ✅ **Constitution compliance**: All stories pass validation
- ✅ **Spec completeness**: All requirements implemented
- ✅ **Handoffs smooth**: Dependencies clearly documented and met
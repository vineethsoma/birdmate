---
applyTo: "**"
description: Feature coordination and multi-story consistency management
---

# Feature Orchestration Standards

Coordinate multi-story features with consistency validation and progress tracking.

## Feature Context Management

**Maintain big picture across all stories**:

```markdown
## Feature Context

**Feature**: [Name from Constitution/Spec]
**Stories**: [List with status]
**Active Branches**: [Worktrees currently WIP]
**Dependencies**: [Cross-story dependencies]
**Last Sync**: [Timestamp]

### Story Handoffs
- Story A → Story B: [Required state/contracts]
- Story B → Story C: [Prerequisites]
```

## Cross-Story Consistency

**Validate consistency across stories**:
- Shared contracts (API schemas, types, interfaces)
- Naming conventions across frontend/backend
- Database schema alignment
- Error handling patterns

**Run consistency checks**:
```bash
# Type checking across frontend/backend
npm run type-check  # Frontend
mypy src/          # Backend

# Contract validation
npm run validate-openapi
```

## Progress Tracking

**Story Status Board**:
```markdown
| Story | Status | Assignee | Branch | Tests | Blockers |
|-------|--------|----------|--------|-------|----------|
| US-001 | ✅ Done | Agent A | - | ✅ Pass | - |
| US-002 | 🔄 WIP | Agent B | feat-us2 | 🔄 Running | - |
| US-003 | ⏳ Blocked | Agent C | - | - | Needs US-002 |
```

## Merge Coordination

**Merge order matters**:
1. Stories must merge in dependency order
2. Integration tests run after each merge
3. Feature branch stays updated with main

**Merge protocol**:
```bash
# Agent completes story
git worktree remove worktrees/feat-us1
git checkout main
git merge feat-us1 --no-ff
git push origin main

# Update feature context
# Notify next dependent story
```

## Anti-Patterns to Avoid

**🚫 Forgetting cross-story impacts**:
- Changes to shared contracts must notify all stories
- Database migrations affect all dependent stories

**🚫 Merging out of order**:
- Story C depends on Story B → B must merge first

**🚫 Stale feature context**:
- Update context after every story completion
- Review dependencies before starting new story

---

**Remember**: Feature Lead owns the feature context. Update after every story milestone.

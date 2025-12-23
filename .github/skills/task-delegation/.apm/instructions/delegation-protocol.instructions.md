---
applyTo: "**"
description: Task delegation protocol for multi-agent coordination
---

# Task Delegation Standards

Delegate user stories to specialized agents with complete context and clear ownership.

## Delegation Principles

### 1. Complete Context Transfer

Every delegation includes:
- **User story specification**: What to build
- **Acceptance criteria**: Definition of done
- **Dependencies**: What must be ready first
- **Handoff requirements**: What next story needs
- **Branch/worktree assignment**: Where to work
- **Constitution/spec references**: Project standards

### 2. Clear Ownership

- One agent per story (no shared ownership)
- Agent owns story from start to merge
- Agent responsible for tests and documentation
- Agent reports completion status

### 3. Skill Matching

Match story requirements to agent expertise:
- Frontend work → Agent with frontend skills
- Backend API → Agent with backend + database skills
- Full-stack → Agent with both frontend and backend
- Infrastructure → Agent with DevOps skills

## Delegation Template

```markdown
## Story Delegation: US-[Number]

**Assigned To**: [Agent Name/Role]
**Story Title**: [User story title]
**Priority**: [High | Medium | Low]
**Estimated Effort**: [Hours or points]

### Context
[Brief description of what this story achieves within the feature]

### Acceptance Criteria
- [ ] [Specific, testable criterion 1]
- [ ] [Specific, testable criterion 2]
- [ ] [Specific, testable criterion 3]

### Dependencies
**Requires** (must be complete first):
- US-[X]: [What it provides]

**Blocks** (waiting on this story):
- US-[Y]: [What it needs from this]

### Technical Details
**Branch**: `feat-us[number]`
**Worktree**: `worktrees/feat-us[number]/`
**Files to modify**: [List of main files]
**New files to create**: [List if known]

### Handoff to Next Story
[What the next story needs from this one:
- API endpoints
- Shared types/interfaces
- Database schema
- Configuration]

### Standards
- Follow CLAUDE Framework coding standards
- Use TDD workflow (Red → Green → Refactor)
- Minimum 80% test coverage
- Reference constitution: [link to AGENTS.md or Constitution]

### Communication
- Report progress daily
- Flag blockers immediately
- Update status when complete
```

## Delegation Workflow

### 1. Feature Lead Prepares Delegation

```bash
# Create worktree for story
git worktree add -b feat-us1 worktrees/feat-us1 main

# Create delegation document
cat > worktrees/feat-us1/DELEGATION.md << 'EOF'
[Use template above]
EOF
```

### 2. Agent Accepts Delegation

```markdown
## Delegation Accepted: US-001

**Agent**: Fullstack Engineer Agent
**Acknowledged**: [Timestamp]
**Estimated Completion**: [Date]

### Understanding Confirmed
- [x] Read acceptance criteria
- [x] Reviewed dependencies
- [x] Understood handoff requirements
- [x] Worktree set up and tested

### Questions/Clarifications
[None | List any questions before starting]
```

### 3. Agent Works on Story

- Work in assigned worktree
- Follow TDD workflow
- Commit regularly with clear messages
- Run tests frequently

### 4. Agent Reports Completion

```markdown
## Story Complete: US-001

**Completed**: [Timestamp]
**Commits**: [abc123, def456, ...]
**Tests**: ✅ All passing (Coverage: 85%)

### Acceptance Criteria
- [x] POST /api/users endpoint implemented
- [x] Email validation working
- [x] Tests pass with >80% coverage

### Handoff to US-002
- API endpoints ready: POST /api/users
- OpenAPI spec updated: contracts/api.openapi.yml
- Shared types exported: src/types/user.ts
- Integration tests pass

### Merge Request
Ready to merge `feat-us1` to `main`
- [x] All tests pass
- [x] Rebased on latest main
- [x] No merge conflicts
- [x] Documentation updated
```

### 5. Feature Lead Reviews and Merges

```bash
# Review story
cd worktrees/feat-us1
npm test  # Verify tests pass

# Merge to main
cd ../../main/
git merge feat-us1 --no-ff
git push origin main

# Cleanup
git worktree remove worktrees/feat-us1

# Update feature context
# Notify next dependent story
```

## Multi-Agent Coordination

**Parallel execution**:
```markdown
## Feature: User Management

**Active Delegations**:
- US-001: Backend API → Agent A (Worktree: feat-us1) - Status: 🔄 WIP
- US-002: Frontend UI → Agent B (Worktree: feat-us2) - Status: ⏳ Blocked (needs US-001)
- US-003: Integration → Agent C (Worktree: feat-us3) - Status: ⏳ Blocked (needs US-001, US-002)

**Merge Order**:
1. US-001 (no dependencies)
2. US-002 (depends on US-001)
3. US-003 (depends on US-001, US-002)
```

## Anti-Patterns

**🚫 Unclear acceptance criteria**:
- Criteria must be specific and testable
- "Make it work" is NOT acceptance criteria
- "API returns 201 with user object" IS

**🚫 Missing dependencies**:
- Always document what must be ready first
- Don't let agents discover dependencies mid-work

**🚫 No handoff requirements**:
- Next story needs to know what's available
- Document API contracts, types, schemas

**🚫 Delegating without worktree**:
- Every story gets its own worktree
- Prevents branch switching and conflicts

---

**Remember**: Clear delegation = successful execution. Complete context prevents rework.

---
description: Create delegation brief with complete context and acceptance criteria
tools: ['read', 'edit']
---

# Create Delegation Brief

Guide the user through creating a comprehensive delegation brief for an agent.

## Context Gathering

1. **Read story context**:
   - Read: `specs/{feature}/stories/{story-id}/story-tracker.md`
   - Read: `specs/{feature}/spec.md` for feature overview
   - Read: `specs/{feature}/plan.md` for technical approach
   - Identify which tasks belong to this agent

2. **Identify agent capabilities**:
   - What is this agent's expertise? (backend, frontend, full-stack, testing)
   - What tools does this agent have access to?
   - What boundaries does this agent have?

## Guided Delegation Brief Creation

### Step 1: Context

Ask user:
- What is the user value of this story?
- How does this agent's work fit into the bigger picture?
- What is the business context this agent needs to understand?

Write concise context (2-3 paragraphs):
```markdown
## Context

[User value and business context]

[How this work fits into feature]

[Why this agent is assigned]
```

### Step 2: Acceptance Criteria

From story tracker, extract criteria relevant to this agent:

For **backend agent**:
```markdown
- [ ] POST /api/{resource} endpoint implemented
- [ ] Request validation with Zod schemas
- [ ] Database operations with transactions
- [ ] Error responses with proper status codes
- [ ] Integration tests with 80%+ coverage
```

For **frontend agent**:
```markdown
- [ ] {ComponentName} renders with props
- [ ] Form validation displays errors
- [ ] API calls with error handling
- [ ] Loading states and user feedback
- [ ] Unit tests with Testing Library
```

For **full-stack agent**:
```markdown
- [ ] End-to-end user workflow functional
- [ ] Backend and frontend integrated
- [ ] Data flows correctly through stack
- [ ] Error handling at all layers
- [ ] Integration and E2E tests pass
```

**Validation**: Each criterion must be:
- Specific (not "works well")
- Testable (can verify pass/fail)
- Relevant to this agent's scope

### Step 3: Dependencies

Document what must be ready before agent starts:

**Requires (blocks this work)**:
```markdown
- US-XXX: Database schema for {resource}
- US-YYY: API contract for {endpoint}
- Design mockups for {feature}
```

**Blocks (depends on this work)**:
```markdown
- US-ZZZ: Frontend needs {API endpoint}
- US-AAA: Integration depends on {component}
```

### Step 4: Technical Details

Provide actionable technical guidance:

**Branch/Worktree**:
```markdown
**Branch**: `feat-us{number}`
**Worktree**: `worktrees/feat-us{number}/`
```

**Files to Modify**:
- List specific files agent will work with
- Indicate if creating new files

**Architecture Notes**:
- Specific patterns to follow
- Libraries/frameworks to use
- Performance considerations

**Example**:
```markdown
**Files to modify**:
- `backend/src/api/users.ts` - Add POST endpoint
- `backend/src/database/repositories/userRepository.ts` - Add createUser method
- `shared/types/user.ts` - Export User type

**New files to create**:
- `backend/src/api/validation/userSchemas.ts` - Zod schemas
- `backend/tests/integration/users.test.ts` - Integration tests
```

### Step 5: Handoff Requirements

What does the next story/agent need from this work?

```markdown
## Handoff to Next Story

**For US-{next-story}**:
- API endpoints ready: POST /api/{resource}
- OpenAPI spec updated: `contracts/api.openapi.yml`
- Shared types exported: `shared/types/{domain}.ts`
- Database migrations applied and documented
- Integration tests passing
```

### Step 6: Standards

Reference relevant standards:
```markdown
## Standards

- Follow CLAUDE Framework coding standards
- Use TDD workflow (Red → Green → Refactor)
- Minimum 80% test coverage
- Reference constitution: [link to AGENTS.md or spec]
- Code review required before merge
```

## Validation

Before finalizing:
1. Run: `./scripts/validate-delegation-brief.sh <story-id> <agent-name>`
2. Verify:
   - [ ] All required sections present
   - [ ] No [Fill] placeholders
   - [ ] Acceptance criteria specific and testable
   - [ ] Dependencies documented
   - [ ] Branch/worktree assigned
   - [ ] Standards referenced

If validation passes, delegation is ready to share with agent.

## Agent Acceptance

After sharing brief, agent should respond with:
```markdown
## Delegation Accepted: US-XXX

**Agent**: {Agent Name}
**Acknowledged**: {Timestamp}
**Estimated Completion**: {Date}

### Understanding Confirmed
- [x] Read acceptance criteria
- [x] Reviewed dependencies
- [x] Understood handoff requirements
- [x] Worktree set up and tested

### Questions/Clarifications
[None | List any questions before starting]
```

## Next Steps

After delegation accepted:
1. Agent works in assigned worktree
2. Agent reports progress regularly
3. Agent reports completion with handoff status
4. Feature Lead reviews and merges
5. Agent creates completion report (optional)

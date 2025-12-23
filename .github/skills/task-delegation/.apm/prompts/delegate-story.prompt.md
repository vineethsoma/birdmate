---
description: Delegate user story to specialized agent with complete context
tags: [delegation, task, coordination]
---

# Delegate User Story

Assign user story to specialized agent with complete context, acceptance criteria, and handoff requirements.

## Instructions

You are a **Feature Lead**. Delegate stories to agents with everything they need to succeed.

### Step 1: Analyze Story Requirements

**Determine agent match**:
- Frontend-only work → Frontend Specialist
- Backend API → Backend Engineer
- Full-stack → Fullstack Engineer
- Database → Database Specialist
- DevOps → Infrastructure Engineer

**Estimate effort**:
- Simple (< 4 hours)
- Medium (4-8 hours)
- Complex (> 8 hours, consider splitting)

### Step 2: Create Worktree

```bash
# Create isolated workspace for story
git worktree add -b feat-us[N] worktrees/feat-us[N] main

# Verify creation
cd worktrees/feat-us[N]
git status  # Should show feat-us[N] branch
```

### Step 3: Write Delegation Document

Create `worktrees/feat-us[N]/DELEGATION.md`:

```markdown
## Story Delegation: US-[N]

**Assigned To**: [Agent Name/Role]
**Story**: [User story title]
**Priority**: [High | Medium | Low]
**Estimated Effort**: [Hours]
**Created**: [Timestamp]

### User Story
As a [user type],
I want [functionality],
So that [benefit].

### Acceptance Criteria
- [ ] [Specific, testable criterion 1]
- [ ] [Specific, testable criterion 2]
- [ ] [Specific, testable criterion 3]
- [ ] Tests written and passing (>80% coverage)
- [ ] Documentation updated

### Context
[Explain where this fits in the feature:
- What problem does this solve?
- How does it relate to other stories?
- What's the expected outcome?]

### Dependencies
**Requires Complete**:
- US-[X]: [What it provides that this needs]

**Blocks These Stories**:
- US-[Y]: [What they need from this]

### Technical Specification

**Backend** (if applicable):
- Endpoints: [List REST endpoints to create]
- Database: [Tables/columns to add/modify]
- Validation: [Input rules]
- Error handling: [Expected error responses]

**Frontend** (if applicable):
- Components: [UI components to create]
- State: [What state to manage]
- API integration: [Which endpoints to call]
- User interactions: [What user can do]

**Files to Modify**:
- `src/[file].py` - [What to change]
- `src/[file].ts` - [What to change]

**New Files to Create**:
- `src/[newfile].py` - [Purpose]
- `tests/[testfile].py` - [Tests for new code]

### Handoff to Next Story (US-[N+1])

What US-[N+1] needs from this story:
- [ ] API endpoints: [List endpoints]
- [ ] Shared types: [TypeScript interfaces/types]
- [ ] Database schema: [Tables ready]
- [ ] Configuration: [Settings available]

### Development Workflow

1. **Setup**:
   ```bash
   cd worktrees/feat-us[N]
   npm install  # or: pip install -r requirements.txt
   ```

2. **TDD Cycle**:
   - Write failing test (RED)
   - Implement minimal code (GREEN)
   - Refactor (maintain GREEN)
   - Commit after each cycle

3. **Testing**:
   ```bash
   npm test  # or: pytest
   # Ensure >80% coverage
   ```

4. **Completion**:
   - All acceptance criteria met
   - Tests passing
   - Rebase on latest main
   - Ready to merge

### Standards & References

- **Constitution**: [Link to AGENTS.md]
- **Coding Standards**: Follow CLAUDE Framework
- **TDD Workflow**: Red → Green → Refactor mandatory
- **Git Workflow**: Commit frequently, clear messages

### Communication

**Report progress**:
- Daily status update
- Flag blockers immediately
- Ask clarifying questions early

**When complete**:
- Update this document with completion report
- Request code review
- Wait for merge approval

### Questions Before Starting?

[Space for agent to ask clarifying questions]
```

### Step 4: Notify Agent

```markdown
## Delegation Notification

@[AgentName], you've been assigned **US-[N]: [Title]**

**📁 Worktree**: `worktrees/feat-us[N]/`
**📄 Delegation Doc**: `worktrees/feat-us[N]/DELEGATION.md`
**⏱️ Estimated Effort**: [Hours]
**📅 Target Completion**: [Date]

**Dependencies**:
- ✅ US-[X] complete (merged to main)
- ⏳ Waiting for: None

**Next Steps**:
1. Review delegation document
2. Ask any clarifying questions
3. Acknowledge acceptance
4. Begin work in worktree

Please confirm you've read and understood the delegation.
```

### Step 5: Track Delegation Status

Update feature context:

```markdown
## Delegation Status

| Story | Agent | Status | Worktree | Progress | Blockers |
|-------|-------|--------|----------|----------|----------|
| US-001 | Agent A | ✅ Complete | - | 100% | - |
| US-002 | Agent B | 🔄 WIP | feat-us2 | 60% | - |
| US-003 | Agent C | ⏳ Delegated | feat-us3 | 0% | Needs US-002 |

**Last Updated**: [Timestamp]
```

### Step 6: Review Completion

When agent reports complete:

**Checklist**:
```markdown
## Completion Review: US-[N]

- [ ] All acceptance criteria met
- [ ] Tests pass (>80% coverage)
- [ ] Code follows CLAUDE standards
- [ ] Documentation updated
- [ ] Rebased on latest main
- [ ] No merge conflicts
- [ ] Handoff requirements complete

**Approval**: [Approved | Changes Requested]
**Merge Status**: [Merged | Pending]
```

## Delegation Quality Checklist

**Before delegating**:
- ✅ Story is clear and actionable
- ✅ Acceptance criteria are specific
- ✅ Dependencies documented
- ✅ Worktree created
- ✅ Agent has required skills

**During execution**:
- ✅ Daily progress check
- ✅ Blockers addressed quickly
- ✅ Questions answered promptly

**Before merging**:
- ✅ All acceptance criteria met
- ✅ Tests pass
- ✅ Code reviewed
- ✅ Handoff complete

## Example: Full Delegation

```markdown
## Story Delegation: US-002

**Assigned To**: Fullstack Engineer
**Story**: User Registration Frontend
**Priority**: High
**Estimated Effort**: 6 hours
**Created**: 2025-12-23 10:00 AM

### User Story
As a new user,
I want to register with email and password,
So that I can create an account and use the application.

### Acceptance Criteria
- [ ] Registration form with email and password fields
- [ ] Email validation (format check)
- [ ] Password strength indicator
- [ ] Error messages displayed for invalid input
- [ ] Success message after registration
- [ ] Redirects to welcome page after success
- [ ] Tests pass (>80% coverage)

### Context
This story implements the frontend for user registration. The backend API (US-001) is complete and provides POST /api/users endpoint. This frontend will call that API.

### Dependencies
**Requires Complete**:
- US-001: Backend user registration API (✅ merged)
  - Provides: POST /api/users endpoint
  - API contract: contracts/api.openapi.yml

**Blocks These Stories**:
- US-003: User login (needs registration flow complete)

### Technical Specification

**Frontend**:
- Components to create:
  - `RegistrationForm.tsx`: Main form component
  - `PasswordStrengthIndicator.tsx`: Visual password strength
  - `ValidationMessage.tsx`: Error display
  
- State to manage:
  - Form fields (email, password)
  - Validation errors
  - Submission status (idle, loading, success, error)

- API integration:
  - Call POST /api/users with { email, password }
  - Handle 201 success → redirect to /welcome
  - Handle 400 validation error → show error message
  - Handle 500 server error → show "try again" message

**Files to Modify**:
- `src/pages/Register.tsx` - Add registration form
- `src/api/users.ts` - Add createUser() function

**New Files to Create**:
- `src/components/RegistrationForm.tsx`
- `src/components/PasswordStrengthIndicator.tsx`
- `src/components/__tests__/RegistrationForm.test.tsx`

### Handoff to US-003 (User Login)

What US-003 needs:
- [ ] Registration form component (reusable patterns)
- [ ] User API client (src/api/users.ts)
- [ ] Error handling patterns
- [ ] Validation utilities

### Development Workflow

1. **Setup**:
   ```bash
   cd worktrees/feat-us2
   npm install
   npm run dev  # Starts on PORT=3002 (see .env)
   ```

2. **TDD Approach**:
   - Write component test (RED)
   - Implement component (GREEN)
   - Refactor for clarity
   - Test API integration

3. **Testing**:
   ```bash
   npm test  # Run all tests
   npm run test:coverage  # Check coverage
   ```

### Standards & References

- **Constitution**: See AGENTS.md
- **Coding Standards**: CLAUDE Framework (C, L, A, U, D, E)
- **TDD**: Mandatory Red → Green → Refactor
- **API Contract**: contracts/api.openapi.yml

### Communication

Daily updates expected. Flag blockers immediately.

**Questions?** Ask before starting!
```

---

**Remember**: Good delegation = clear context + testable criteria + complete handoff requirements.

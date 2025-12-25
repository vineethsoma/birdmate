---
description: Fill story tracker with acceptance criteria and task breakdown
tools: ['read', 'edit']
---

# Fill Story Tracker

Guide the user through populating a story tracker with complete acceptance criteria and task breakdown.

## Context Gathering

1. **Read story tracker**:
   - Run: `./scripts/validate-story-tracker.sh <story-id>` (will fail initially)
   - Read: `specs/{feature}/stories/{story-id}/story-tracker.md`
   - Identify sections needing completion

2. **Read related specification**:
   - Read: `specs/{feature}/spec.md` for context
   - Read: `specs/{feature}/plan.md` for technical approach
   - Read: `specs/{feature}/tasks.md` for this story's definition

## Guided Story Tracker Completion

### Step 1: Story Overview

Ask user:
- What is the core user value of this story?
- What user pain point does this solve?
- How does this fit into the overall feature?

Fill the Story Overview section with concise summary.

### Step 2: Acceptance Criteria

For each acceptance criterion:
1. **Ask user for functional requirements**:
   - What should the user be able to do?
   - What is the expected behavior?
   - What edge cases must work?

2. **Convert to testable criteria**:
   ```markdown
   - [ ] User can [action] with [constraints]
   - [ ] System displays [result] when [condition]
   - [ ] Error shows [message] when [invalid case]
   ```

3. **Validate specificity**:
   - Each criterion must be verifiable (pass/fail)
   - No vague statements ("works well", "is fast")
   - Include edge cases

### Step 3: Task Breakdown

For each major component of work:
1. **Identify technical tasks**:
   - Database changes (schema, migrations)
   - API endpoints (contracts, validation)
   - Frontend components (UI, state management)
   - Tests (unit, integration, E2E)
   - Documentation updates

2. **Break into atomic tasks** (1-4 hours each):
   ```markdown
   - [ ] Create database migration for [table]
   - [ ] Implement POST /api/[resource] endpoint
   - [ ] Add validation for [field]
   - [ ] Create [ComponentName] with [props]
   - [ ] Write integration tests for [workflow]
   ```

3. **Estimate each task**:
   - 1-2 hours: Simple, well-defined
   - 2-4 hours: Moderate complexity
   - 4+ hours: Needs further breakdown

### Step 4: Dependencies

Ask user:
- What must be complete before starting this story?
- What stories depend on this one?
- Are there external dependencies (APIs, data, approvals)?

Document in Dependencies section.

### Step 5: Implementation Status

Initialize status fields:
```markdown
- **Status**: Not Started
- **Assigned To**: [Agent/Developer name]
- **Started**: [Date when work begins]
- **Completed**: [Date when all tasks done]
- **Merged**: [Date when merged to main]
```

## Validation

Before marking complete:
1. Run: `./scripts/validate-story-tracker.sh <story-id>`
2. Verify:
   - [ ] No [Fill] placeholders remaining
   - [ ] Acceptance criteria are specific and testable
   - [ ] Tasks are atomic (1-4 hours each)
   - [ ] All tasks have checkboxes
   - [ ] Dependencies documented
   - [ ] Status fields initialized

If validation passes, story tracker is ready for implementation.

## Next Steps

After story tracker complete:
1. Create delegation briefs: `/create-delegation-brief` (task-delegation skill)
2. Begin implementation following TDD workflow
3. Update tracker as tasks complete
4. Run retrospective after merge

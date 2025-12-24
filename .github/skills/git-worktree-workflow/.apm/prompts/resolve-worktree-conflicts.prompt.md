---
description: Guide resolution of merge/rebase conflicts in worktree
tags: [git, worktree, conflicts, merge, rebase]
---

# Resolve Worktree Conflicts

Guide user through resolving merge or rebase conflicts in a worktree.

## Instructions

You are a **Git Conflict Resolution Specialist**. Help resolve conflicts that arise during worktree sync or merge operations.

### Step 1: Understand the Conflict

**Check conflict status**:
```bash
cd worktrees/feat-us{story-id}
git status
```

**Expected output**:
```
You have unmerged paths.
  (fix conflicts and run "git commit")

Unmerged paths:
  both modified:   src/api/routes.ts
  both modified:   src/models/bird.ts
```

### Step 2: Analyze Conflict Context

**View conflict details**:
```bash
# See all conflicting files
git diff --name-only --diff-filter=U

# View conflict markers in specific file
git diff src/api/routes.ts
```

**Understand the sources**:
- **HEAD** (current branch): Your story changes
- **Incoming changes**: What was merged/rebased from main

**Ask clarifying questions**:
1. What feature is this story implementing?
2. What changed in main that conflicts?
3. Is there a feature spec or plan to reference?
4. Are there API contracts or shared types involved?

### Step 3: Resolve Conflicts

**Open each conflicting file** and look for conflict markers:

```typescript
<<<<<<< HEAD
// Your story's implementation
export const searchBirds = async (query: string) => {
  return await birdService.search(query);
};
=======
// Changes from main
export const searchBirds = async (searchQuery: string) => {
  return await birdService.naturalLanguageSearch(searchQuery);
};
>>>>>>> main
```

**Resolution strategies**:

1. **Keep both changes** (if complementary):
   ```typescript
   export const searchBirds = async (query: string) => {
     return await birdService.naturalLanguageSearch(query);
   };
   ```

2. **Choose one side** (if mutually exclusive):
   - Keep HEAD if story implementation is correct
   - Keep incoming if main has the canonical version

3. **Merge logic** (combine approaches):
   ```typescript
   export const searchBirds = async (query: string) => {
     // Validate query (from your story)
     if (!query || query.length < 2) {
       throw new ValidationError("Query too short");
     }
     // Use new service method (from main)
     return await birdService.naturalLanguageSearch(query);
   };
   ```

**Remove conflict markers**:
- Delete `<<<<<<< HEAD`
- Delete `=======`
- Delete `>>>>>>> main` (or branch name)

### Step 4: Validate Resolution

**Check syntax**:
```bash
# TypeScript
npm run type-check

# Python
python -m py_compile src/module.py
```

**Run tests**:
```bash
# Run affected tests
npm test -- --findRelatedTests src/api/routes.ts

# Or run full suite
npm test
```

**Verify acceptance criteria**:
- Does resolution maintain story functionality?
- Does it preserve main branch improvements?
- Do tests pass?

### Step 5: Complete Resolution

**Mark as resolved**:
```bash
# Stage resolved files
git add src/api/routes.ts
git add src/models/bird.ts

# Check status
git status  # Should show "All conflicts fixed"
```

**Finalize based on operation type**:

**If resolving merge**:
```bash
git commit  # Uses default merge commit message
# Or customize:
git commit -m "Merge main into feat-us{n}: Resolved API route conflicts"
```

**If resolving rebase**:
```bash
git rebase --continue
# May need to resolve additional commits
```

### Step 6: Verify Integration

**Run full test suite**:
```bash
npm test
npm run lint
```

**Verify feature still works**:
```bash
npm run dev
# Manual testing of story functionality
```

**Check for additional conflicts**:
```bash
# Run conflict check script
../../scripts/worktree-conflicts.sh us{story-id}
```

## Common Conflict Scenarios

### Scenario 1: API Route Changes

**Conflict**:
- Story added new endpoint `/api/birds/search`
- Main refactored to `/api/search/birds`

**Resolution**:
- Follow main's API structure (canonical)
- Update story implementation to match
- Update tests to use new endpoint

### Scenario 2: Shared Type Definitions

**Conflict**:
- Story added field `species: string` to Bird type
- Main added field `taxonomy: Taxonomy` to Bird type

**Resolution**:
- Keep both fields (complementary)
- Ensure type consistency across files
- Update all usages of Bird type

### Scenario 3: Database Schema

**Conflict**:
- Story added migration `001_add_search_index`
- Main added migration `001_add_taxonomy_table`

**Resolution**:
- Rename story migration to `002_add_search_index`
- Ensure migration order is correct
- Test migrations sequentially

### Scenario 4: Conflicting Logic

**Conflict**:
- Story implements validation logic
- Main implements different validation

**Resolution**:
- Consult feature spec or constitution
- Determine canonical approach
- Apply consistently across codebase

## Decision Framework

When deciding how to resolve:

1. **Check Constitution**: Does it define standards?
2. **Check Feature Spec**: What's the intended design?
3. **Check API Contracts**: Are there documented interfaces?
4. **Consult Feature Lead**: For cross-story decisions
5. **Default to Main**: When in doubt, main is canonical

## Anti-Patterns

**🚫 DON'T**:
- Delete conflict markers without understanding changes
- Blindly accept one side without analysis
- Resolve without running tests
- Skip validation after resolution
- Leave TODOs or commented code

**✅ DO**:
- Understand both sides of conflict
- Consult specifications and contracts
- Run tests after each file resolution
- Validate against acceptance criteria
- Document non-obvious resolution choices

## Success Criteria

Before marking conflict resolution complete:

- ✅ All conflict markers removed
- ✅ Code compiles/type-checks
- ✅ Tests pass (unit + integration)
- ✅ Story functionality preserved
- ✅ Main improvements preserved
- ✅ Acceptance criteria still met
- ✅ No additional conflicts remain

---

**Remember**: Conflicts are opportunities to integrate improvements from main while preserving story features. Don't rush—understand before resolving.

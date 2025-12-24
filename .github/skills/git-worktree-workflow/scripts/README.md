# Git Worktree Workflow Scripts

Automated shell scripts for managing parallel story development with git worktrees.

## Overview

These scripts enable Feature Leads to manage multiple concurrent user stories with isolated worktrees, automatic conflict detection, and merge validation.

## Scripts

### 📊 worktree-status.sh

**Purpose**: Display all active worktrees and their status

**Usage**:
```bash
./scripts/worktree-status.sh
```

**Output**:
```
📊 Git Worktree Status
====================

Path                    Branch          Status
------------------------------------------------------------
main                    main            ✓ Clean
feat-us1               feat-us1        ⚠ 3 changes ↑2
feat-us2               feat-us2        ✓ Clean ↑1

💡 Tip: Run 'git worktree list' for full paths
```

**Features**:
- Shows uncommitted changes per worktree
- Displays unpushed commits count
- Color-coded status indicators
- WIP slot tracking

---

### 🌿 worktree-create.sh

**Purpose**: Create a new worktree for a user story

**Usage**:
```bash
./scripts/worktree-create.sh <story-id> [base-branch]
```

**Examples**:
```bash
# Create worktree for US-001 from main
./scripts/worktree-create.sh us1

# Create from develop branch
./scripts/worktree-create.sh us42 develop
```

**Features**:
- Auto-generates branch name: `feat-us{id}`
- Creates worktree at `worktrees/feat-us{id}/`
- Validates WIP limit (max 3 worktrees)
- Updates base branch before creating
- Provides next steps guidance

**WIP Limit Enforcement**:
```
❌ Error: WIP limit reached (3/3 worktrees active)

Active worktrees:
  worktrees/feat-us1  [feat-us1]
  worktrees/feat-us2  [feat-us2]
  worktrees/feat-us3  [feat-us3]

Complete and merge a story before starting a new one.
```

---

### 🗑️ worktree-remove.sh

**Purpose**: Clean up completed worktree

**Usage**:
```bash
./scripts/worktree-remove.sh <story-id> [--delete-branch] [--force]
```

**Examples**:
```bash
# Remove worktree only
./scripts/worktree-remove.sh us1

# Remove worktree and delete branch
./scripts/worktree-remove.sh us1 --delete-branch

# Force remove with uncommitted changes
./scripts/worktree-remove.sh us1 --force
```

**Safety Features**:
- Warns about uncommitted changes
- Warns about unpushed commits
- Checks if branch is merged before deletion
- Requires confirmation for destructive operations
- Updates WIP slot count

---

### 🔍 worktree-conflicts.sh

**Purpose**: Check for merge conflicts with base branch

**Usage**:
```bash
./scripts/worktree-conflicts.sh <story-id> [base-branch]
```

**Examples**:
```bash
# Check conflicts with main
./scripts/worktree-conflicts.sh us1

# Check conflicts with develop
./scripts/worktree-conflicts.sh us42 develop
```

**Process**:
1. Fetches latest base branch
2. Shows commit divergence
3. Performs dry-run merge
4. Reports conflicts or success
5. Provides resolution steps if conflicts exist

**Output (No Conflicts)**:
```
✅ No conflicts detected!

The branch can be merged cleanly into main.

Files to be merged:
M       src/api/search.ts
A       src/services/nlp.ts
```

**Output (Conflicts)**:
```
❌ Conflicts detected!

Conflicting files:
src/api/routes.ts
src/models/bird.ts

Resolution steps:
  1. cd worktrees/feat-us1
  2. git fetch origin main
  3. git rebase origin/main
  4. Resolve conflicts in each file
  5. git add <resolved-files>
  6. git rebase --continue
  7. Run this script again to verify
```

---

### 🔄 worktree-sync.sh

**Purpose**: Sync worktree with latest base branch

**Usage**:
```bash
./scripts/worktree-sync.sh <story-id> [base-branch] [--strategy=<merge|rebase>]
```

**Examples**:
```bash
# Merge main into story (default)
./scripts/worktree-sync.sh us1

# Rebase story on main (cleaner history)
./scripts/worktree-sync.sh us1 --strategy=rebase

# Sync with develop
./scripts/worktree-sync.sh us42 develop
```

**Strategies**:
- **merge** (default): Preserves story commit history, creates merge commit
- **rebase**: Linear history, cleaner but rewrites commits

**Safety Features**:
- Checks for uncommitted changes
- Shows ahead/behind commit count
- Detects conflicts and provides resolution steps
- Auto-aborts on conflict (manual resolution required)

---

### 🔀 worktree-merge.sh

**Purpose**: Merge story branch to target branch

**Usage**:
```bash
./scripts/worktree-merge.sh <story-id> [target-branch] [--no-ff|--squash]
```

**Examples**:
```bash
# Merge to main (no-fast-forward)
./scripts/worktree-merge.sh us1

# Squash merge (single commit)
./scripts/worktree-merge.sh us1 --squash

# Merge to develop
./scripts/worktree-merge.sh us42 develop
```

**Merge Strategies**:
- **--no-ff** (default): Preserves branch history with merge commit
- **--squash**: Combines all story commits into single commit

**Pre-Merge Validation**:
- Checks for uncommitted changes in worktree
- Verifies story is synced with target
- Warns if behind target branch
- Requires confirmation if not synced

**Post-Merge Steps**:
```
✅ Story merged into main!

Next steps:
  1. Review the merge commit
  2. Run integration tests
  3. Push: git push origin main
  4. Clean up: ./worktree-remove.sh us1 --delete-branch
```

---

## Workflow Example

Complete workflow for managing a user story:

```bash
# 1. Check current status
./scripts/worktree-status.sh

# 2. Create worktree for new story (if WIP < 3)
./scripts/worktree-create.sh us4

# 3. Agent works in worktree
cd worktrees/feat-us4
# ... implement story ...
git commit -m "feat(us4): implement feature"
cd ../..

# 4. Daily sync with main
./scripts/worktree-sync.sh us4

# 5. Before merge: check for conflicts
./scripts/worktree-conflicts.sh us4

# 6. Merge to main
./scripts/worktree-merge.sh us4

# 7. Clean up
./scripts/worktree-remove.sh us4 --delete-branch

# 8. Check status again
./scripts/worktree-status.sh
```

---

## Integration with AI Prompts

Scripts handle automation, prompts provide guidance:

| Scenario | Use Script | Use Prompt |
|----------|------------|------------|
| Create worktree | ✅ `worktree-create.sh` | Initial setup: `/worktree.init` |
| Check status | ✅ `worktree-status.sh` | - |
| Sync with main | ✅ `worktree-sync.sh` | If conflicts: `/worktree.resolve-conflicts` |
| Check conflicts | ✅ `worktree-conflicts.sh` | - |
| Validate merge readiness | - | ✅ `/worktree.validate-merge` |
| Merge to main | ✅ `worktree-merge.sh` | - |
| Resolve conflicts | - | ✅ `/worktree.resolve-conflicts` |
| Remove worktree | ✅ `worktree-remove.sh` | - |

**Best Practice**: Use scripts for deterministic operations, prompts for validation and conflict resolution guidance.

---

## Error Handling

All scripts include:
- ✅ Input validation
- ✅ Repository state checks
- ✅ Uncommitted changes detection
- ✅ Conflict detection and reporting
- ✅ Confirmation prompts for destructive operations
- ✅ Color-coded output (green=success, yellow=warning, red=error)
- ✅ Exit codes (0=success, 1=error)

---

## Requirements

- Git 2.5+ (for worktree support)
- Bash 4.0+
- Standard Unix tools: `grep`, `awk`, `wc`

**Check compatibility**:
```bash
git --version  # Should be >= 2.5
bash --version # Should be >= 4.0
```

---

## Troubleshooting

### Scripts not executable

```bash
chmod +x scripts/*.sh
```

### "Command not found"

```bash
# Run from repository root
./skills/git-worktree-workflow/scripts/worktree-status.sh

# Or add to PATH
export PATH="$PATH:$(pwd)/skills/git-worktree-workflow/scripts"
```

### WIP limit errors

Scripts enforce max 3 concurrent worktrees. Complete and merge stories before creating new ones.

---

## Contributing

When modifying scripts:
1. Test with edge cases (conflicts, uncommitted changes, etc.)
2. Maintain color-coded output consistency
3. Provide clear error messages with resolution steps
4. Update this README with new features
5. Bump version in `apm.yml`

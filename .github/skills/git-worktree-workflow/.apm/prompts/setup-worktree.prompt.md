---
description: Set up git worktree for parallel story development
tags: [git, worktree, parallel-development]
---

# Setup Git Worktree for Story

Create isolated workspace for user story development with git worktree.

## Instructions

You are a **Git Workflow Specialist**. Set up worktrees for parallel story execution.

### Step 1: Verify Repository State

**Check current worktrees**:
```bash
git worktree list
```

**Ensure main is clean**:
```bash
git status  # Should be clean
git pull origin main  # Get latest
```

### Step 2: Create Worktree

**For new story**:
```bash
# Create branch and worktree
git worktree add -b feat-us1 worktrees/feat-us1 main

# Verify creation
git worktree list
# Should show: worktrees/feat-us1  [feat-us1]
```

**For existing branch**:
```bash
# Checkout existing branch into worktree
git worktree add worktrees/feat-us1 feat-us1
```

### Step 3: Configure Worktree

**Navigate to worktree**:
```bash
cd worktrees/feat-us1
```

**Install dependencies** (if needed):
```bash
npm install  # or: pip install -r requirements.txt
```

**Configure environment** (unique ports, etc.):
```bash
# Create .env for this worktree
echo "PORT=3001" > .env
echo "DB_NAME=birdmate_us1" >> .env
```

### Step 4: Verify Independence

**Test that worktrees are isolated**:

```bash
# Terminal 1: Main worktree
cd main/
git status  # Should show main branch

# Terminal 2: Story worktree
cd worktrees/feat-us1/
git status  # Should show feat-us1 branch

# Changes in one don't affect the other
```

### Step 5: Development Workflow

**Work in worktree**:
```bash
cd worktrees/feat-us1

# Make changes
vim src/feature.py

# Test locally
npm test

# Commit regularly
git add .
git commit -m "Implement feature X"
```

**Keep worktree updated**:
```bash
# Fetch latest main
git fetch origin main

# Rebase on main (if main has new commits)
git rebase origin/main
```

### Step 6: Ready to Merge

**Pre-merge checklist**:
```bash
cd worktrees/feat-us1

# All tests pass
npm test  # ✅

# Rebase on latest main
git fetch origin main
git rebase origin/main  # ✅

# No uncommitted changes
git status  # ✅ Clean
```

**Merge to main**:
```bash
# Switch to main
cd ../../main/

# Merge story branch
git merge feat-us1 --no-ff -m "Merge story US-001: Feature X"

# Push to remote
git push origin main
```

### Step 7: Cleanup

**Remove worktree after merge**:
```bash
# Remove worktree
git worktree remove worktrees/feat-us1

# Delete branch (optional)
git branch -d feat-us1

# Verify removal
git worktree list  # Should not show feat-us1
```

## Parallel Development Example

**Scenario**: 3 agents working on 3 stories simultaneously

```bash
# Feature Lead sets up worktrees
git worktree add -b feat-us1 worktrees/feat-us1 main
git worktree add -b feat-us2 worktrees/feat-us2 main
git worktree add -b feat-us3 worktrees/feat-us3 main

# Agent A works on US-001
cd worktrees/feat-us1
# ... develop ...

# Agent B works on US-002 (simultaneously!)
cd worktrees/feat-us2
# ... develop ...

# Agent C works on US-003 (simultaneously!)
cd worktrees/feat-us3
# ... develop ...

# No branch switching, no conflicts, clean separation
```

**Port management**:
```bash
# worktrees/feat-us1/.env
PORT=3001
DB_NAME=birdmate_us1

# worktrees/feat-us2/.env
PORT=3002
DB_NAME=birdmate_us2

# worktrees/feat-us3/.env
PORT=3003
DB_NAME=birdmate_us3
```

## Worktree Commands Reference

| Command | Purpose |
|---------|---------|
| `git worktree add -b <branch> <path> <base>` | Create new branch in worktree |
| `git worktree add <path> <existing-branch>` | Checkout existing branch to worktree |
| `git worktree list` | Show all worktrees |
| `git worktree remove <path>` | Remove worktree |
| `git worktree remove --force <path>` | Force remove (with uncommitted changes) |
| `git worktree prune` | Clean up stale worktree metadata |

## Troubleshooting

**"Cannot add worktree, already exists"**:
```bash
# Remove existing worktree first
git worktree remove worktrees/feat-us1
# Then create new one
git worktree add -b feat-us1 worktrees/feat-us1 main
```

**"Port already in use"**:
```bash
# Use different port in worktree
cd worktrees/feat-us1
echo "PORT=3001" > .env
npm run dev
```

**"Database conflict"**:
```bash
# Use separate database per worktree
echo "DB_NAME=birdmate_us1" >> .env
```

## Worktree Checklist

**Setup**:
- ✅ Main branch clean and updated
- ✅ Worktree created with unique branch name
- ✅ Dependencies installed in worktree
- ✅ Environment configured (ports, database)

**Development**:
- ✅ All work happens in worktree directory
- ✅ Regular commits to story branch
- ✅ Tests run in worktree
- ✅ Rebase on main before merge

**Cleanup**:
- ✅ Merged to main
- ✅ Worktree removed
- ✅ Branch deleted (optional)
- ✅ No stale worktrees (`git worktree list`)

---

**Remember**: One story = one worktree = one agent. Clean isolation, no conflicts.

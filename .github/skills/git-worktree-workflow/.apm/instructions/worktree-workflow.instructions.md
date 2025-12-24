---
applyTo: "**"
description: Git worktree workflow for parallel story development
---

# Git Worktree Standards

Enable parallel development with isolated working directories per user story.

## Core Concept

**Git worktree creates multiple working directories from one repository**:

```
project/
├── .git/                    # Shared repository
├── main/                    # Primary worktree (main branch)
└── worktrees/
    ├── feat-us1/           # Story 1 isolated workspace
    ├── feat-us2/           # Story 2 isolated workspace
    └── feat-us3/           # Story 3 isolated workspace
```

**Benefits**:
- ✅ No branch switching
- ✅ No stashing
- ✅ Parallel testing
- ✅ Clear story boundaries

## Worktree Setup

**Create worktree for story**:
```bash
# Create branch and worktree
git worktree add -b feat-us1 worktrees/feat-us1 main

# Agent A works in worktrees/feat-us1/
cd worktrees/feat-us1
# ... implement story ...
```

**List worktrees**:
```bash
git worktree list
# main                     /path/to/project  [main]
# worktrees/feat-us1       /path/to/worktrees/feat-us1  [feat-us1]
# worktrees/feat-us2       /path/to/worktrees/feat-us2  [feat-us2]
```

## Development Workflow

**Story lifecycle**:

1. **Create**: `git worktree add -b feat-us1 worktrees/feat-us1 main`
2. **Develop**: Work in `worktrees/feat-us1/`, commit regularly
3. **Test**: Run tests in worktree: `cd worktrees/feat-us1 && npm test`
4. **Merge**: Return to main, merge branch: `git merge feat-us1 --no-ff`
5. **Cleanup**: Remove worktree: `git worktree remove worktrees/feat-us1`

**Parallel development**:
```bash
# Agent A works on US-001
cd worktrees/feat-us1
npm run dev  # Server on port 3000

# Agent B works on US-002 simultaneously
cd worktrees/feat-us2
npm run dev  # Server on port 3001 (different port!)
```

## Merge Coordination

**Merge order matters**:

```bash
# US-001 complete first (no dependencies)
cd main/
git merge feat-us1 --no-ff
git push origin main

# US-002 depends on US-001, rebase first
cd worktrees/feat-us2
git fetch origin main
git rebase origin/main
# Resolve conflicts if any
cd ../../main/
git merge feat-us2 --no-ff
git push origin main
```

## Worktree Cleanup

**After merge**:
```bash
# Remove worktree
git worktree remove worktrees/feat-us1

# Delete branch (optional)
git branch -d feat-us1
```

**Force remove (if uncommitted changes)**:
```bash
git worktree remove --force worktrees/feat-us1
```

## Anti-Patterns

**🚫 Forgetting to rebase before merge**:
- Always fetch latest main
- Rebase worktree branch on main
- Then merge to main

**🚫 Leaving stale worktrees**:
- Clean up after merge
- Run `git worktree list` to audit

**🚫 Using same port for parallel servers**:
- Each worktree needs unique ports
- Configure in `.env` or command line

---

**Remember**: Worktrees enable true parallel development. One story, one worktree, one agent.

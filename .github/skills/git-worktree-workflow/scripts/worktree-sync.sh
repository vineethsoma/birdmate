#!/usr/bin/env bash
# worktree-sync.sh - Sync worktree with latest main branch

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Usage
usage() {
    echo "Usage: $0 <story-id> [base-branch] [--strategy=<merge|rebase>]"
    echo
    echo "Options:"
    echo "  --strategy=merge   Use merge to sync (default)"
    echo "  --strategy=rebase  Use rebase to sync (cleaner history)"
    echo
    echo "Examples:"
    echo "  $0 us1                        # Merge main into story branch"
    echo "  $0 us1 --strategy=rebase      # Rebase story on main"
    echo "  $0 us42 develop               # Sync with develop branch"
    echo
    exit 1
}

# Validate arguments
if [ $# -lt 1 ]; then
    usage
fi

STORY_ID=$1
BASE_BRANCH="main"
STRATEGY="merge"

# Parse arguments
shift
while [ $# -gt 0 ]; do
    case $1 in
        --strategy=*)
            STRATEGY="${1#*=}"
            shift
            ;;
        *)
            BASE_BRANCH=$1
            shift
            ;;
    esac
done

# Validate strategy
if [[ ! "$STRATEGY" =~ ^(merge|rebase)$ ]]; then
    echo -e "${RED}❌ Error: Invalid strategy '$STRATEGY'. Use 'merge' or 'rebase'${NC}"
    exit 1
fi

BRANCH_NAME="feat-${STORY_ID}"
WORKTREE_PATH="worktrees/${BRANCH_NAME}"

echo "🔄 Syncing Worktree with ${BASE_BRANCH}"
echo "======================================="
echo

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

# Check if worktree exists
if [ ! -d "$WORKTREE_PATH" ]; then
    echo -e "${RED}❌ Error: Worktree '$WORKTREE_PATH' does not exist${NC}"
    exit 1
fi

# Check if branch exists
if ! git rev-parse --verify "$BRANCH_NAME" > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Branch '$BRANCH_NAME' does not exist${NC}"
    exit 1
fi

# Fetch latest
echo -e "${BLUE}📥 Fetching latest changes from origin/${BASE_BRANCH}...${NC}"
git fetch origin "$BASE_BRANCH"
echo

# Navigate to worktree
cd "$WORKTREE_PATH"

# Check for uncommitted changes
if [ -n "$(git status --short)" ]; then
    echo -e "${YELLOW}⚠ Warning: Worktree has uncommitted changes${NC}"
    echo "Please commit or stash changes before syncing."
    echo
    git status --short
    cd - > /dev/null
    exit 1
fi

# Get commit counts
MERGE_BASE=$(git merge-base "$BRANCH_NAME" "origin/$BASE_BRANCH")
BEHIND_COUNT=$(git log --oneline "${BRANCH_NAME}..origin/${BASE_BRANCH}" | wc -l | tr -d ' ')
AHEAD_COUNT=$(git log --oneline "origin/${BASE_BRANCH}..${BRANCH_NAME}" | wc -l | tr -d ' ')

echo "Status:"
echo "  Story branch: ${BRANCH_NAME}"
echo "  Base branch:  origin/${BASE_BRANCH}"
echo "  Behind by:    ${BEHIND_COUNT} commits"
echo "  Ahead by:     ${AHEAD_COUNT} commits"
echo

if [ "$BEHIND_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✅ Already up to date!${NC}"
    cd - > /dev/null
    exit 0
fi

# Perform sync based on strategy
echo -e "${BLUE}🔄 Syncing using ${STRATEGY} strategy...${NC}"
echo

if [ "$STRATEGY" = "merge" ]; then
    # Merge strategy
    if git merge "origin/$BASE_BRANCH" --no-edit; then
        echo -e "${GREEN}✅ Merge successful!${NC}"
        SUCCESS=true
    else
        echo -e "${RED}❌ Merge conflicts detected${NC}"
        echo
        echo "Conflicting files:"
        git diff --name-only --diff-filter=U
        SUCCESS=false
    fi
elif [ "$STRATEGY" = "rebase" ]; then
    # Rebase strategy
    if git rebase "origin/$BASE_BRANCH"; then
        echo -e "${GREEN}✅ Rebase successful!${NC}"
        SUCCESS=true
    else
        echo -e "${RED}❌ Rebase conflicts detected${NC}"
        echo
        echo "Conflicting files:"
        git diff --name-only --diff-filter=U
        SUCCESS=false
    fi
fi

cd - > /dev/null

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$SUCCESS" = true ]; then
    echo -e "${GREEN}✅ Worktree synced successfully!${NC}"
    echo
    echo "Next steps:"
    echo "  1. cd ${WORKTREE_PATH}"
    echo "  2. Run tests to verify"
    echo "  3. Continue development"
else
    echo -e "${YELLOW}⚠ Manual conflict resolution needed${NC}"
    echo
    echo "Resolution steps:"
    echo "  1. cd ${WORKTREE_PATH}"
    echo "  2. Review conflicts in files marked with conflict markers"
    echo "  3. Edit each file to resolve conflicts"
    echo "  4. git add <resolved-files>"
    
    if [ "$STRATEGY" = "merge" ]; then
        echo "  5. git commit"
    else
        echo "  5. git rebase --continue"
    fi
    
    echo "  6. Run this script again to verify"
    echo
    echo "Or abort with:"
    if [ "$STRATEGY" = "merge" ]; then
        echo "  git merge --abort"
    else
        echo "  git rebase --abort"
    fi
    
    exit 1
fi

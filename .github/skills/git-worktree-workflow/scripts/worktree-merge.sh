#!/usr/bin/env bash
# worktree-merge.sh - Merge story branch to main

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Usage
usage() {
    echo "Usage: $0 <story-id> [target-branch] [--no-ff] [--squash]"
    echo
    echo "Options:"
    echo "  --no-ff     Use no-fast-forward merge (default, preserves history)"
    echo "  --squash    Squash commits into single commit"
    echo
    echo "Examples:"
    echo "  $0 us1                    # Merge feat-us1 to main (no-ff)"
    echo "  $0 us1 --squash           # Squash merge feat-us1 to main"
    echo "  $0 us42 develop           # Merge to develop branch"
    echo
    exit 1
}

# Validate arguments
if [ $# -lt 1 ]; then
    usage
fi

STORY_ID=$1
TARGET_BRANCH="main"
NO_FF=true
SQUASH=false

# Parse arguments
shift
while [ $# -gt 0 ]; do
    case $1 in
        --no-ff)
            NO_FF=true
            shift
            ;;
        --squash)
            SQUASH=true
            NO_FF=false
            shift
            ;;
        *)
            TARGET_BRANCH=$1
            shift
            ;;
    esac
done

BRANCH_NAME="feat-${STORY_ID}"
WORKTREE_PATH="worktrees/${BRANCH_NAME}"

echo "🔀 Merging Story to ${TARGET_BRANCH}"
echo "===================================="
echo

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

# Check if target branch exists
if ! git rev-parse --verify "$TARGET_BRANCH" > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Target branch '$TARGET_BRANCH' does not exist${NC}"
    exit 1
fi

# Check if story branch exists
if ! git rev-parse --verify "$BRANCH_NAME" > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Story branch '$BRANCH_NAME' does not exist${NC}"
    exit 1
fi

# Check if worktree exists and is clean
if [ -d "$WORKTREE_PATH" ]; then
    cd "$WORKTREE_PATH"
    if [ -n "$(git status --short)" ]; then
        echo -e "${RED}❌ Error: Worktree has uncommitted changes${NC}"
        echo "Please commit or stash changes before merging."
        echo
        git status --short
        cd - > /dev/null
        exit 1
    fi
    cd - > /dev/null
fi

# Fetch latest
echo -e "${BLUE}📥 Fetching latest changes...${NC}"
git fetch origin "$TARGET_BRANCH"
echo

# Check if story branch is up to date with target
MERGE_BASE=$(git merge-base "$BRANCH_NAME" "origin/$TARGET_BRANCH")
BEHIND_COUNT=$(git log --oneline "${BRANCH_NAME}..origin/${TARGET_BRANCH}" | wc -l | tr -d ' ')

if [ "$BEHIND_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Warning: Story branch is ${BEHIND_COUNT} commits behind origin/${TARGET_BRANCH}${NC}"
    echo "Consider syncing the worktree first:"
    echo "  ./worktree-sync.sh ${STORY_ID} ${TARGET_BRANCH}"
    echo
    read -p "Continue with merge anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted"
        exit 1
    fi
fi

# Get commit info
STORY_COMMITS=$(git log --oneline "origin/${TARGET_BRANCH}..${BRANCH_NAME}" | wc -l | tr -d ' ')
echo "Merge Details:"
echo "  Source:      ${BRANCH_NAME}"
echo "  Target:      ${TARGET_BRANCH}"
echo "  Commits:     ${STORY_COMMITS}"
if [ "$SQUASH" = true ]; then
    echo "  Strategy:    Squash merge (single commit)"
else
    echo "  Strategy:    No-fast-forward (preserve history)"
fi
echo

# Checkout target branch
echo -e "${BLUE}📍 Checking out ${TARGET_BRANCH}...${NC}"
git checkout "$TARGET_BRANCH"

# Pull latest
echo -e "${BLUE}📥 Pulling latest ${TARGET_BRANCH}...${NC}"
git pull origin "$TARGET_BRANCH"
echo

# Perform merge
echo -e "${BLUE}🔀 Merging ${BRANCH_NAME} into ${TARGET_BRANCH}...${NC}"

MERGE_CMD="git merge"
if [ "$SQUASH" = true ]; then
    MERGE_CMD="$MERGE_CMD --squash"
elif [ "$NO_FF" = true ]; then
    MERGE_CMD="$MERGE_CMD --no-ff"
fi
MERGE_CMD="$MERGE_CMD ${BRANCH_NAME}"

if eval "$MERGE_CMD"; then
    # If squash, we need to commit
    if [ "$SQUASH" = true ]; then
        echo
        echo "Enter commit message for squashed commit:"
        read -p "> " COMMIT_MSG
        git commit -m "$COMMIT_MSG"
    fi
    
    echo
    echo -e "${GREEN}✅ Merge successful!${NC}"
    SUCCESS=true
else
    echo
    echo -e "${RED}❌ Merge conflicts detected${NC}"
    echo
    echo "Conflicting files:"
    git diff --name-only --diff-filter=U
    SUCCESS=false
fi

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$SUCCESS" = true ]; then
    echo -e "${GREEN}✅ Story merged into ${TARGET_BRANCH}!${NC}"
    echo
    echo "Next steps:"
    echo "  1. Review the merge commit"
    echo "  2. Run integration tests"
    echo "  3. Push: git push origin ${TARGET_BRANCH}"
    echo "  4. Clean up: ./worktree-remove.sh ${STORY_ID} --delete-branch"
    echo
    echo "View merged commits:"
    echo "  git log --oneline -n ${STORY_COMMITS}"
else
    echo -e "${YELLOW}⚠ Manual conflict resolution needed${NC}"
    echo
    echo "Resolution steps:"
    echo "  1. Review conflicts in files marked with conflict markers"
    echo "  2. Edit each file to resolve conflicts"
    echo "  3. git add <resolved-files>"
    echo "  4. git commit"
    echo "  5. Verify tests pass"
    echo "  6. git push origin ${TARGET_BRANCH}"
    echo
    echo "Or abort with:"
    echo "  git merge --abort"
    
    exit 1
fi

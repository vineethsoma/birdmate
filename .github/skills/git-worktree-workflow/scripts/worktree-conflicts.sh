#!/usr/bin/env bash
# worktree-conflicts.sh - Check for merge conflicts with main branch

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Usage
usage() {
    echo "Usage: $0 <story-id> [base-branch]"
    echo
    echo "Examples:"
    echo "  $0 us1              # Check conflicts with main"
    echo "  $0 us42 develop     # Check conflicts with develop"
    echo
    exit 1
}

# Validate arguments
if [ $# -lt 1 ]; then
    usage
fi

STORY_ID=$1
BASE_BRANCH=${2:-main}
BRANCH_NAME="feat-${STORY_ID}"
WORKTREE_PATH="worktrees/${BRANCH_NAME}"

echo "🔍 Checking for Conflicts"
echo "========================="
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
echo -e "${BLUE}📥 Fetching latest changes from origin...${NC}"
git fetch origin "$BASE_BRANCH"
echo

# Check for uncommitted changes first
cd "$WORKTREE_PATH"
if [ -n "$(git status --short)" ]; then
    echo -e "${YELLOW}⚠ Warning: Worktree has uncommitted changes${NC}"
    echo "Please commit or stash changes before checking conflicts."
    echo
    git status --short
    cd - > /dev/null
    exit 1
fi

# Get merge base
MERGE_BASE=$(git merge-base "$BRANCH_NAME" "origin/$BASE_BRANCH")
BASE_SHORT=$(echo "$MERGE_BASE" | cut -c1-7)

# Get current commits
STORY_COMMIT=$(git rev-parse "$BRANCH_NAME" | cut -c1-7)
MAIN_COMMIT=$(git rev-parse "origin/$BASE_BRANCH" | cut -c1-7)

echo "Branch Information:"
echo "  Story branch:  ${BRANCH_NAME} (${STORY_COMMIT})"
echo "  Base branch:   origin/${BASE_BRANCH} (${MAIN_COMMIT})"
echo "  Merge base:    ${BASE_SHORT}"
echo

# Count commits
STORY_COMMITS=$(git log --oneline "${MERGE_BASE}..${BRANCH_NAME}" | wc -l | tr -d ' ')
MAIN_COMMITS=$(git log --oneline "${MERGE_BASE}..origin/${BASE_BRANCH}" | wc -l | tr -d ' ')

echo "Commits:"
echo "  In ${BRANCH_NAME}:    ${STORY_COMMITS} new commits"
echo "  In origin/${BASE_BRANCH}: ${MAIN_COMMITS} new commits"
echo

# Check for conflicts using dry-run merge
echo -e "${BLUE}🔍 Performing dry-run merge...${NC}"

# Create temporary branch for test merge
TEST_BRANCH="__test_merge_${STORY_ID}__"
git branch -D "$TEST_BRANCH" 2>/dev/null || true
git checkout -b "$TEST_BRANCH" "origin/$BASE_BRANCH" --quiet

# Try merge
if git merge --no-commit --no-ff "$BRANCH_NAME" 2>&1; then
    # Merge succeeded
    echo -e "${GREEN}✅ No conflicts detected!${NC}"
    echo
    echo "The branch can be merged cleanly into ${BASE_BRANCH}."
    
    # Show files that will be changed
    echo
    echo "Files to be merged:"
    git diff --name-status HEAD
    
    CONFLICT=false
else
    # Merge failed - conflicts exist
    echo -e "${RED}❌ Conflicts detected!${NC}"
    echo
    echo "Conflicting files:"
    git diff --name-only --diff-filter=U
    echo
    echo "Conflict details:"
    git status --short | grep "^UU\|^AA\|^DD"
    
    CONFLICT=true
fi

# Cleanup
git merge --abort 2>/dev/null || true
git checkout "$BRANCH_NAME" --quiet
git branch -D "$TEST_BRANCH" --quiet

cd - > /dev/null

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$CONFLICT" = true ]; then
    echo -e "${RED}⚠ Conflicts must be resolved before merge${NC}"
    echo
    echo "Resolution steps:"
    echo "  1. cd ${WORKTREE_PATH}"
    echo "  2. git fetch origin ${BASE_BRANCH}"
    echo "  3. git rebase origin/${BASE_BRANCH}"
    echo "  4. Resolve conflicts in each file"
    echo "  5. git add <resolved-files>"
    echo "  6. git rebase --continue"
    echo "  7. Run this script again to verify"
    exit 1
else
    echo -e "${GREEN}✅ Ready to merge!${NC}"
    echo
    echo "Next steps:"
    echo "  1. Final review of changes"
    echo "  2. Run: cd main && git merge ${BRANCH_NAME} --no-ff"
    echo "  3. Push: git push origin main"
    exit 0
fi

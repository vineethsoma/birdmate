#!/usr/bin/env bash
# worktree-create.sh - Create a new worktree for a user story

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
    echo "  $0 us1              # Create worktree for story US-001 from main"
    echo "  $0 us42 develop     # Create worktree from develop branch"
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

echo "🌳 Creating Worktree for Story"
echo "==============================="
echo

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

# Check if base branch exists
if ! git rev-parse --verify "$BASE_BRANCH" > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Base branch '$BASE_BRANCH' does not exist${NC}"
    exit 1
fi

# Check if branch already exists
if git rev-parse --verify "$BRANCH_NAME" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Warning: Branch '$BRANCH_NAME' already exists${NC}"
    read -p "Continue and checkout existing branch? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted"
        exit 1
    fi
    CREATE_BRANCH=false
else
    CREATE_BRANCH=true
fi

# Check if worktree directory already exists
if [ -d "$WORKTREE_PATH" ]; then
    echo -e "${RED}❌ Error: Worktree directory '$WORKTREE_PATH' already exists${NC}"
    exit 1
fi

# Check WIP limit (count existing worktrees excluding main)
WORKTREE_COUNT=$(git worktree list | grep -c "worktrees/" || true)
MAX_WIP=3

if [ "$WORKTREE_COUNT" -ge "$MAX_WIP" ]; then
    echo -e "${RED}❌ Error: WIP limit reached ($WORKTREE_COUNT/$MAX_WIP worktrees active)${NC}"
    echo
    echo "Active worktrees:"
    git worktree list | grep "worktrees/"
    echo
    echo "Complete and merge a story before starting a new one."
    exit 1
fi

# Update base branch
echo -e "${BLUE}📥 Updating base branch '$BASE_BRANCH'...${NC}"
git fetch origin "$BASE_BRANCH"

# Create worktree
echo -e "${BLUE}🌿 Creating worktree at '$WORKTREE_PATH'...${NC}"
if [ "$CREATE_BRANCH" = true ]; then
    git worktree add -b "$BRANCH_NAME" "$WORKTREE_PATH" "$BASE_BRANCH"
else
    git worktree add "$WORKTREE_PATH" "$BRANCH_NAME"
fi

echo
echo -e "${GREEN}✅ Worktree created successfully!${NC}"
echo
echo "Details:"
echo "  Story ID:    ${STORY_ID}"
echo "  Branch:      ${BRANCH_NAME}"
echo "  Path:        ${WORKTREE_PATH}"
echo "  Base:        ${BASE_BRANCH}"
echo
echo "Next steps:"
echo "  1. cd ${WORKTREE_PATH}"
echo "  2. Configure environment (ports, DB, etc.)"
echo "  3. Install dependencies if needed"
echo "  4. Start development"
echo
echo "WIP Status: $((WORKTREE_COUNT + 1))/$MAX_WIP worktrees active"

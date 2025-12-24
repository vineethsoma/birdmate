#!/usr/bin/env bash
# worktree-remove.sh - Remove a worktree and optionally delete the branch

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Usage
usage() {
    echo "Usage: $0 <story-id> [--delete-branch] [--force]"
    echo
    echo "Options:"
    echo "  --delete-branch    Delete the branch after removing worktree"
    echo "  --force            Force remove even with uncommitted changes"
    echo
    echo "Examples:"
    echo "  $0 us1                        # Remove worktree for US-001"
    echo "  $0 us1 --delete-branch        # Remove worktree and delete branch"
    echo "  $0 us1 --force                # Force remove with uncommitted changes"
    echo
    exit 1
}

# Validate arguments
if [ $# -lt 1 ]; then
    usage
fi

STORY_ID=$1
BRANCH_NAME="feat-${STORY_ID}"
WORKTREE_PATH="worktrees/${BRANCH_NAME}"
DELETE_BRANCH=false
FORCE=false

# Parse options
shift
while [ $# -gt 0 ]; do
    case $1 in
        --delete-branch)
            DELETE_BRANCH=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            usage
            ;;
    esac
done

echo "🗑️  Removing Worktree"
echo "===================="
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

# Check for uncommitted changes
cd "$WORKTREE_PATH"
if [ -n "$(git status --short)" ]; then
    echo -e "${YELLOW}⚠ Warning: Worktree has uncommitted changes${NC}"
    git status --short
    echo
    
    if [ "$FORCE" = false ]; then
        read -p "Remove anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Aborted"
            exit 1
        fi
    fi
fi

# Check for unpushed commits
if git rev-parse --verify "$BRANCH_NAME" > /dev/null 2>&1; then
    UNPUSHED=$(git log origin/"$BRANCH_NAME".."$BRANCH_NAME" --oneline 2>/dev/null | wc -l | tr -d ' ')
    if [ "$UNPUSHED" -gt 0 ]; then
        echo -e "${YELLOW}⚠ Warning: Branch has $UNPUSHED unpushed commit(s)${NC}"
        echo
        
        if [ "$FORCE" = false ]; then
            read -p "Continue? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "Aborted"
                exit 1
            fi
        fi
    fi
fi

cd - > /dev/null

# Remove worktree
echo -e "${BLUE}🗑️  Removing worktree at '$WORKTREE_PATH'...${NC}"
if [ "$FORCE" = true ]; then
    git worktree remove --force "$WORKTREE_PATH"
else
    git worktree remove "$WORKTREE_PATH"
fi

echo -e "${GREEN}✅ Worktree removed successfully${NC}"

# Delete branch if requested
if [ "$DELETE_BRANCH" = true ]; then
    if git rev-parse --verify "$BRANCH_NAME" > /dev/null 2>&1; then
        echo -e "${BLUE}🗑️  Deleting branch '$BRANCH_NAME'...${NC}"
        
        # Check if branch is merged
        if git branch --merged main | grep -q "$BRANCH_NAME"; then
            git branch -d "$BRANCH_NAME"
            echo -e "${GREEN}✅ Branch deleted${NC}"
        else
            echo -e "${YELLOW}⚠ Warning: Branch is not merged to main${NC}"
            read -p "Force delete? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git branch -D "$BRANCH_NAME"
                echo -e "${GREEN}✅ Branch force-deleted${NC}"
            else
                echo "Branch kept"
            fi
        fi
    fi
fi

echo
echo "Details:"
echo "  Story ID:    ${STORY_ID}"
echo "  Branch:      ${BRANCH_NAME} $([ "$DELETE_BRANCH" = true ] && echo "(deleted)" || echo "(kept)")"
echo "  Path:        ${WORKTREE_PATH} (removed)"
echo

# Show remaining worktrees
WORKTREE_COUNT=$(git worktree list | grep -c "worktrees/" || true)
echo "WIP Status: ${WORKTREE_COUNT}/3 worktrees active"

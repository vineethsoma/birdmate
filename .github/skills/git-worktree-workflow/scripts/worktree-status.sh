#!/usr/bin/env bash
# worktree-status.sh - Display all active worktrees and their status

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "📊 Git Worktree Status"
echo "===================="
echo

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Get list of worktrees
worktree_list=$(git worktree list --porcelain)

if [ -z "$worktree_list" ]; then
    echo "No worktrees found"
    exit 0
fi

# Parse and display worktrees
echo -e "${BLUE}Path${NC}\t\t\t\t${BLUE}Branch${NC}\t\t${BLUE}Status${NC}"
echo "------------------------------------------------------------"

current_path=""
current_branch=""
current_head=""

while IFS= read -r line; do
    if [[ $line == worktree* ]]; then
        # Extract path
        current_path=$(echo "$line" | awk '{print $2}')
    elif [[ $line == branch* ]]; then
        # Extract branch
        current_branch=$(echo "$line" | awk -F'refs/heads/' '{print $2}')
    elif [[ $line == HEAD* ]]; then
        # Extract commit
        current_head=$(echo "$line" | awk '{print $2}' | cut -c1-7)
    elif [[ -z $line ]] && [[ -n $current_path ]]; then
        # End of worktree entry, display it
        
        # Get status
        if cd "$current_path" 2>/dev/null; then
            status=$(git status --short 2>/dev/null || echo "")
            if [ -z "$status" ]; then
                status_text="${GREEN}✓ Clean${NC}"
            else
                modified_count=$(echo "$status" | wc -l | tr -d ' ')
                status_text="${YELLOW}⚠ ${modified_count} changes${NC}"
            fi
            
            # Check for unpushed commits
            if [ -n "$current_branch" ]; then
                unpushed=$(git log origin/"$current_branch"..HEAD --oneline 2>/dev/null | wc -l | tr -d ' ')
                if [ "$unpushed" -gt 0 ]; then
                    status_text="${status_text} ${BLUE}↑${unpushed}${NC}"
                fi
            fi
            
            cd - > /dev/null
        else
            status_text="${RED}✗ Inaccessible${NC}"
        fi
        
        # Format output
        path_short=$(basename "$current_path")
        branch_display="${current_branch:-detached@$current_head}"
        
        echo -e "${path_short}\t\t${branch_display}\t\t${status_text}"
        
        # Reset for next entry
        current_path=""
        current_branch=""
        current_head=""
    fi
done <<< "$worktree_list"

echo
echo "💡 Tip: Run 'git worktree list' for full paths"

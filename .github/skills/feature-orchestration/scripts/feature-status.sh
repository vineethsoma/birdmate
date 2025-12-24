#!/bin/bash
# Feature status dashboard
# Displays current progress across all stories

set -e

FEATURE_ID="$1"

if [ -z "$FEATURE_ID" ]; then
  echo "❌ Error: Feature ID required"
  echo "Usage: feature-status.sh <feature-id>"
  echo "Example: feature-status.sh 001-bird-search"
  exit 1
fi

FEATURE_DIR="specs/$FEATURE_ID"
CONTEXT_FILE="$FEATURE_DIR/.feature-context.md"

if [ ! -f "$CONTEXT_FILE" ]; then
  echo "❌ Error: Feature context not found: $CONTEXT_FILE"
  echo "Run feature-init.sh first"
  exit 1
fi

echo "📊 Feature Status Dashboard: $FEATURE_ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Extract feature name and status
FEATURE_NAME=$(grep -m 1 "^# Feature Context:" "$CONTEXT_FILE" | sed 's/^# Feature Context: //')
STATUS=$(grep "^\*\*Status\*\*:" "$CONTEXT_FILE" | sed 's/^\*\*Status\*\*: //')
LAST_UPDATED=$(grep "^\*\*Last Updated\*\*:" "$CONTEXT_FILE" | sed 's/^\*\*Last Updated\*\*: //')

echo "📦 Feature: $FEATURE_NAME"
echo "🔖 Status: $STATUS"
echo "🕐 Last Updated: $LAST_UPDATED"
echo ""

# Parse WIP tracker
echo "🔄 Work In Progress"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
grep -A 5 "^## WIP Tracker" "$CONTEXT_FILE" | grep -E "^\| [0-9]" || echo "No WIP data"
echo ""

# Parse stories and count statuses
echo "📋 Stories Overview"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TOTAL=0
NOT_STARTED=0
IN_PROGRESS=0
BLOCKED=0
COMPLETED=0

if [ -f "$FEATURE_DIR/tasks.md" ]; then
  # Count completed stories
  COMPLETED=$(grep -c "^- \[x\]" "$FEATURE_DIR/tasks.md" 2>/dev/null || echo 0)
  # Count not started stories  
  NOT_STARTED=$(grep -c "^- \[ \]" "$FEATURE_DIR/tasks.md" 2>/dev/null || echo 0)
  TOTAL=$((COMPLETED + NOT_STARTED))
  
  echo "✅ Completed: $COMPLETED"
  echo "⏳ Not Started: $NOT_STARTED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📈 Total: $TOTAL stories"
  
  if [ $TOTAL -gt 0 ]; then
    PERCENT=$((COMPLETED * 100 / TOTAL))
    echo "🎯 Progress: $PERCENT%"
  fi
else
  echo "⚠️  No tasks.md found"
fi

echo ""

# Show active branches
echo "🌿 Active Branches"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if git worktree list 2>/dev/null | grep -q "worktrees/"; then
  git worktree list | grep "worktrees/" | while IFS= read -r line; do
    echo "  $line"
  done
else
  echo "  No active worktrees"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

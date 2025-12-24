#!/bin/bash
# Suggest next story to work on based on dependencies and WIP limits

set -e

FEATURE_ID="$1"

if [ -z "$FEATURE_ID" ]; then
  echo "❌ Error: Feature ID required"
  echo "Usage: feature-next.sh <feature-id>"
  echo "Example: feature-next.sh 001-bird-search"
  exit 1
fi

FEATURE_DIR="specs/$FEATURE_ID"
CONTEXT_FILE="$FEATURE_DIR/.feature-context.md"
TASKS_FILE="$FEATURE_DIR/tasks.md"

if [ ! -f "$CONTEXT_FILE" ]; then
  echo "❌ Error: Feature context not found: $CONTEXT_FILE"
  exit 1
fi

if [ ! -f "$TASKS_FILE" ]; then
  echo "❌ Error: Tasks file not found: $TASKS_FILE"
  exit 1
fi

echo "🔍 Analyzing next story to delegate..."
echo ""

# Check WIP limit
CURRENT_WIP=$(grep -c "🔄" "$CONTEXT_FILE" 2>/dev/null || echo 0)

if [ "$CURRENT_WIP" -ge 3 ]; then
  echo "⚠️  WIP LIMIT REACHED (3/3)"
  echo ""
  echo "Cannot delegate new story until one completes."
  echo ""
  echo "Current WIP stories:"
  grep "🔄" "$CONTEXT_FILE" | head -3
  exit 0
fi

echo "✅ WIP Available: $CURRENT_WIP/3 ($(( 3 - CURRENT_WIP )) slots free)"
echo ""

# Find first unchecked story
NEXT_STORY=$(grep -m 1 "^- \[ \]" "$TASKS_FILE")

if [ -z "$NEXT_STORY" ]; then
  echo "🎉 No more stories to delegate - feature complete!"
  exit 0
fi

echo "📋 Suggested Next Story:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$NEXT_STORY"
echo ""

# Extract story ID if present
STORY_ID=$(echo "$NEXT_STORY" | grep -oE "US-[0-9]+" || echo "")

if [ -n "$STORY_ID" ]; then
  echo "📍 Story ID: $STORY_ID"
  echo ""
  
  # Check if there's a detailed spec for this story
  if [ -f "$FEATURE_DIR/$STORY_ID.md" ]; then
    echo "📄 Detailed spec available: $FEATURE_DIR/$STORY_ID.md"
  fi
  
  echo ""
  echo "📍 Next steps:"
  echo "  1. Review story acceptance criteria"
  echo "  2. Check dependencies in feature context"
  echo "  3. Run: /delegate.assign $STORY_ID [agent-name]"
else
  echo "⚠️  Story ID not found in task format"
  echo "Ensure tasks follow format: - [ ] US-XXX: [description]"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

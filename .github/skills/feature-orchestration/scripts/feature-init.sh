#!/bin/bash
# Feature initialization script
# Creates tracking files and directory structure for a new feature

set -e

FEATURE_ID="$1"

if [ -z "$FEATURE_ID" ]; then
  echo "❌ Error: Feature ID required"
  echo "Usage: feature-init.sh <feature-id>"
  echo "Example: feature-init.sh 001-bird-search"
  exit 1
fi

FEATURE_DIR="specs/$FEATURE_ID"

if [ ! -d "$FEATURE_DIR" ]; then
  echo "❌ Error: Feature directory not found: $FEATURE_DIR"
  echo "Run /speckit.specify first to create the feature spec"
  exit 1
fi

echo "🚀 Initializing feature orchestration for: $FEATURE_ID"

# Create feature context file
CONTEXT_FILE="$FEATURE_DIR/.feature-context.md"

if [ -f "$CONTEXT_FILE" ]; then
  echo "⚠️  Feature context already exists: $CONTEXT_FILE"
  echo "Skipping initialization"
  exit 0
fi

# Extract feature name from spec.md
FEATURE_NAME=$(grep -m 1 "^# " "$FEATURE_DIR/spec.md" | sed 's/^# //')

# Create feature context from template
cat > "$CONTEXT_FILE" <<EOF
# Feature Context: $FEATURE_NAME

**Feature ID**: $FEATURE_ID
**Status**: 🔄 In Progress
**Owner**: Feature Lead
**Started**: $(date +"%Y-%m-%d")
**Last Updated**: $(date +"%Y-%m-%d %H:%M:%S")

## Overview

[Brief overview of feature - update as needed]

## Stories

EOF

# Parse tasks.md if it exists and add stories
if [ -f "$FEATURE_DIR/tasks.md" ]; then
  echo "📋 Parsing user stories from tasks.md..."
  grep -E "^- \[ \]" "$FEATURE_DIR/tasks.md" | while IFS= read -r line; do
    echo "$line - Status: ⏳ Not Started" >> "$CONTEXT_FILE"
  done
else
  echo "⚠️  No tasks.md found. Add stories manually to context file."
  echo "- [ ] US-001: [Story title] - Status: ⏳ Not Started" >> "$CONTEXT_FILE"
fi

cat >> "$CONTEXT_FILE" <<EOF

## Dependencies

[Document story dependencies here]

Example:
- US-002 depends on US-001 (API endpoints)
- US-003 depends on US-002 (shared types)

## Shared Contracts

- **API Schema**: \`contracts/api.openapi.yml\`
- **TypeScript Types**: \`src/types/shared.ts\`
- **Database Schema**: \`migrations/\`

## Active Branches

None yet

## WIP Tracker

| Slot | Story | Agent | Status | Branch |
|------|-------|-------|--------|--------|
| 1    | -     | -     | -      | -      |
| 2    | -     | -     | -      | -      |
| 3    | -     | -     | -      | -      |

**Current WIP**: 0/3

## Progress Log

### $(date +"%Y-%m-%d")
- Feature orchestration initialized
- Ready for story delegation

EOF

echo "✅ Feature context created: $CONTEXT_FILE"
echo ""
echo "📍 Next steps:"
echo "  1. Review and update dependencies"
echo "  2. Define shared contracts"
echo "  3. Start delegating stories with /delegate.assign"

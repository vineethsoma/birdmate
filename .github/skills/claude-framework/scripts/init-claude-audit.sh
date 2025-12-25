#!/bin/bash
# Initialize CLAUDE audit checklist
# Usage: ./init-claude-audit.sh us-001

set -e

STORY_ID=$1

if [ -z "$STORY_ID" ]; then
    echo "Usage: ./init-claude-audit.sh <story-id>"
    echo "Example: ./init-claude-audit.sh us-001"
    exit 1
fi

# Load configuration
if [ -f ".apm-workflow.yml" ]; then
    FEATURE=$(grep 'current_feature:' .apm-workflow.yml | awk '{print $2}')
else
    echo "❌ .apm-workflow.yml not found"
    exit 1
fi

# Define paths
STORY_ROOT="specs/${FEATURE}/stories/${STORY_ID}"
CHECKLIST_DIR="${STORY_ROOT}/checklists"
CHECKLIST_FILE="${CHECKLIST_DIR}/claude-audit.md"

# Check if story exists
if [ ! -d "$STORY_ROOT" ]; then
    echo "❌ Story not found: ${STORY_ROOT}"
    echo "   Run: ./scripts/init-story.sh ${STORY_ID}"
    exit 1
fi

# Check if checklist already exists
if [ -f "$CHECKLIST_FILE" ]; then
    echo "⚠️  CLAUDE audit checklist already exists: ${CHECKLIST_FILE}"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted"
        exit 1
    fi
fi

# Find template
TEMPLATE=$(find . -path "*/claude-framework/.apm/templates/claude-audit.checklist.md" | head -1)

if [ -z "$TEMPLATE" ]; then
    echo "❌ CLAUDE audit template not found. Is claude-framework skill installed?"
    exit 1
fi

echo "📋 Creating CLAUDE audit checklist for ${STORY_ID}..."

# Copy template
cp "$TEMPLATE" "$CHECKLIST_FILE"

# Populate story ID
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/\[Story ID\]/${STORY_ID}/g" "$CHECKLIST_FILE"
else
    sed -i "s/\[Story ID\]/${STORY_ID}/g" "$CHECKLIST_FILE"
fi

echo "✅ CLAUDE audit checklist created at ${CHECKLIST_FILE}"
echo ""
echo "Next steps:"
echo "  1. Review CLAUDE standards (Code, Naming, Error, Security, Testing, Database, Logging)"
echo "  2. Run audit during code review: /run-claude-audit"
echo "  3. Validate before merge: ./scripts/validate-claude-audit.sh ${STORY_ID}"

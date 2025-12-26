#!/bin/bash
# Initialize TDD compliance checklist
# Usage: ./init-tdd-checklist.sh us-001

set -e

STORY_ID=$1

if [ -z "$STORY_ID" ]; then
    echo "Usage: ./init-tdd-checklist.sh <story-id>"
    echo "Example: ./init-tdd-checklist.sh us-001"
    exit 1
fi

# Auto-detect feature directory from speckit structure
FEATURE_DIR=$(find specs -maxdepth 1 -type d -name "[0-9]*-*" | head -1)

if [ -z "$FEATURE_DIR" ]; then
    echo "❌ No feature directory found in specs/"
    exit 1
fi

# Define paths
STORY_ROOT="${FEATURE_DIR}/stories/${STORY_ID}"
CHECKLIST_DIR="${STORY_ROOT}/checklists"
CHECKLIST_FILE="${CHECKLIST_DIR}/tdd-compliance.md"

# Check if story exists
if [ ! -d "$STORY_ROOT" ]; then
    echo "❌ Story not found: ${STORY_ROOT}"
    echo "   Run: ./scripts/init-story.sh ${STORY_ID}"
    exit 1
fi

# Check if checklist already exists
if [ -f "$CHECKLIST_FILE" ]; then
    echo "⚠️  TDD checklist already exists: ${CHECKLIST_FILE}"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted"
        exit 1
    fi
fi

# Find template
TEMPLATE=$(find . -path "*/tdd-workflow/.apm/templates/tdd-compliance.checklist.md" | head -1)

if [ -z "$TEMPLATE" ]; then
    echo "❌ TDD compliance template not found. Is tdd-workflow skill installed?"
    exit 1
fi

echo "📋 Creating TDD compliance checklist for ${STORY_ID}..."

# Copy template
cp "$TEMPLATE" "$CHECKLIST_FILE"

# Populate story ID
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/\[Story ID\]/${STORY_ID}/g" "$CHECKLIST_FILE"
else
    sed -i "s/\[Story ID\]/${STORY_ID}/g" "$CHECKLIST_FILE"
fi

echo "✅ TDD checklist created at ${CHECKLIST_FILE}"
echo ""
echo "Next steps:"
echo "  1. Review checklist sections:"
echo "     - Test-First Development"
echo "     - Test Coverage"
echo "     - Test Quality"
echo "     - TDD Discipline"
echo "  2. Track compliance throughout story"
echo "  3. Validate before merge: ./scripts/validate-tdd-compliance.sh ${STORY_ID}"

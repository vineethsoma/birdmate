#!/bin/bash
# Initialize E2E test plan
# Usage: ./init-e2e-test-plan.sh us-001

set -e

STORY_ID=$1

if [ -z "$STORY_ID" ]; then
    echo "Usage: ./init-e2e-test-plan.sh <story-id>"
    echo "Example: ./init-e2e-test-plan.sh us-001"
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
CHECKLIST_FILE="${CHECKLIST_DIR}/e2e-test-plan.md"

# Check if story exists
if [ ! -d "$STORY_ROOT" ]; then
    echo "❌ Story not found: ${STORY_ROOT}"
    echo "   Run: ./scripts/init-story.sh ${STORY_ID}"
    exit 1
fi

# Check if test plan already exists
if [ -f "$CHECKLIST_FILE" ]; then
    echo "⚠️  E2E test plan already exists: ${CHECKLIST_FILE}"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted"
        exit 1
    fi
fi

# Find template
TEMPLATE=$(find . -path "*/playwright-testing/.apm/templates/e2e-test-plan.checklist.md" | head -1)

if [ -z "$TEMPLATE" ]; then
    echo "❌ E2E test plan template not found. Is playwright-testing skill installed?"
    exit 1
fi

echo "📋 Creating E2E test plan for ${STORY_ID}..."

# Copy template
cp "$TEMPLATE" "$CHECKLIST_FILE"

# Populate story ID
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/\[Story ID\]/${STORY_ID}/g" "$CHECKLIST_FILE"
else
    sed -i "s/\[Story ID\]/${STORY_ID}/g" "$CHECKLIST_FILE"
fi

echo "✅ E2E test plan created at ${CHECKLIST_FILE}"
echo ""
echo "Next steps:"
echo "  1. Define user workflows to test"
echo "  2. Write Playwright E2E tests"
echo "  3. Gather metrics: ./scripts/gather-e2e-metrics.sh ${STORY_ID}"
echo "  4. Validate coverage: ./scripts/validate-e2e-coverage.sh ${STORY_ID}"

#!/bin/bash
# Create delegation brief for agent
# Usage: ./init-delegation.sh us-001 fullstack-engineer

set -e

STORY_ID=$1
AGENT_NAME=$2

if [ -z "$STORY_ID" ] || [ -z "$AGENT_NAME" ]; then
    echo "Usage: ./init-delegation.sh <story-id> <agent-name>"
    echo "Example: ./init-delegation.sh us-001 fullstack-engineer"
    exit 1
fi

# Auto-detect feature directory from speckit structure
FEATURE_DIR=$(find specs -maxdepth 1 -type d -name "[0-9]*-*" | head -1)

if [ -z "$FEATURE_DIR" ]; then
    echo "❌ No feature directory found in specs/"
    echo "   Expected: specs/###-feature-name/ (e.g., specs/001-bird-search-ui/)"
    exit 1
fi

# Define paths
STORY_ROOT="${FEATURE_DIR}/stories/${STORY_ID}"
DELEGATION_DIR="${STORY_ROOT}/delegation"
DELEGATION_FILE="${DELEGATION_DIR}/${AGENT_NAME}.delegation.md"

# Check if story exists
if [ ! -d "$STORY_ROOT" ]; then
    echo "❌ Story not found: ${STORY_ROOT}"
    echo "   Run: ./scripts/init-story.sh ${STORY_ID}"
    exit 1
fi

# Check if delegation already exists
if [ -f "$DELEGATION_FILE" ]; then
    echo "⚠️  Delegation brief already exists: ${DELEGATION_FILE}"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted"
        exit 1
    fi
fi

# Find template
TEMPLATE=$(find . -path "*/task-delegation/.apm/templates/delegation-brief.template.md" | head -1)

if [ -z "$TEMPLATE" ]; then
    echo "❌ Delegation template not found. Is task-delegation skill installed?"
    exit 1
fi

echo "📋 Creating delegation brief for ${AGENT_NAME} on ${STORY_ID}..."

# Copy template
cp "$TEMPLATE" "$DELEGATION_FILE"

# Read story tracker for context
TRACKER="${STORY_ROOT}/story-tracker.md"
if [ -f "$TRACKER" ]; then
    # Extract acceptance criteria
    ACCEPTANCE_CRITERIA=$(sed -n '/## Acceptance Criteria/,/## /p' "$TRACKER" | sed '$d' | tail -n +2)
    
    # Extract tasks
    TASKS=$(grep "^- \[.\]" "$TRACKER" || echo "No tasks found")
else
    ACCEPTANCE_CRITERIA="[Story tracker not found - fill manually]"
    TASKS="[Story tracker not found - fill manually]"
fi

# Populate template
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/\[Story ID\]/${STORY_ID}/g" "$DELEGATION_FILE"
    sed -i '' "s/\[Agent Name\/Role\]/${AGENT_NAME}/g" "$DELEGATION_FILE"
else
    sed -i "s/\[Story ID\]/${STORY_ID}/g" "$DELEGATION_FILE"
    sed -i "s/\[Agent Name\/Role\]/${AGENT_NAME}/g" "$DELEGATION_FILE"
fi

echo "✅ Delegation brief created at ${DELEGATION_FILE}"
echo ""
echo "Next steps:"
echo "  1. Fill delegation brief with:"
echo "     - Context and user value"
echo "     - Specific acceptance criteria for this agent"
echo "     - Technical details and handoff requirements"
echo "  2. Validate: ./scripts/validate-delegation-brief.sh ${STORY_ID} ${AGENT_NAME}"
echo "  3. Share brief with agent"
echo ""
echo "Story context extracted from tracker:"
echo "Acceptance Criteria:"
echo "$ACCEPTANCE_CRITERIA"
echo ""
echo "Tasks:"
echo "$TASKS"

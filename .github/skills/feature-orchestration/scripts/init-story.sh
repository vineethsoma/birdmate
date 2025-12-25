#!/bin/bash
# Initialize story directory structure and story tracker
# Usage: ./init-story.sh us-001

set -e

STORY_ID=$1

if [ -z "$STORY_ID" ]; then
    echo "Usage: ./init-story.sh <story-id>"
    echo "Example: ./init-story.sh us-001"
    exit 1
fi

# Load configuration
if [ -f ".apm-workflow.yml" ]; then
    FEATURE=$(grep 'current_feature:' .apm-workflow.yml | awk '{print $2}')
else
    echo "❌ .apm-workflow.yml not found"
    echo "   Create it with:"
    echo "   echo 'current_feature: {feature-id}' > .apm-workflow.yml"
    exit 1
fi

# Define paths
STORY_ROOT="specs/${FEATURE}/stories/${STORY_ID}"

# Check if story already exists
if [ -d "$STORY_ROOT" ]; then
    echo "⚠️  Story directory already exists: ${STORY_ROOT}"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted"
        exit 1
    fi
fi

# Create directory structure
echo "📁 Creating story structure for ${STORY_ID}..."
mkdir -p "${STORY_ROOT}"/{delegation,checklists,retro,delegation/completion-reports}

# Find story-tracker template
TEMPLATE=$(find . -path "*/feature-orchestration/.apm/templates/story-tracker.template.md" | head -1)

if [ -z "$TEMPLATE" ]; then
    echo "❌ Story tracker template not found. Is feature-orchestration skill installed?"
    exit 1
fi

# Copy template
cp "$TEMPLATE" "${STORY_ROOT}/story-tracker.md"

# Populate story ID in tracker
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/\[Story ID\]/${STORY_ID}/g" "${STORY_ROOT}/story-tracker.md"
else
    sed -i "s/\[Story ID\]/${STORY_ID}/g" "${STORY_ROOT}/story-tracker.md"
fi

echo "✅ Story initialized at ${STORY_ROOT}"
echo ""
echo "Structure created:"
echo "  ${STORY_ROOT}/"
echo "  ├── story-tracker.md          ← Fill this first"
echo "  ├── delegation/               ← Delegation briefs go here"
echo "  ├── checklists/               ← Quality gate checklists"
echo "  └── retro/                    ← Post-merge retrospective"
echo ""
echo "Next steps:"
echo "  1. Fill story-tracker.md with acceptance criteria"
echo "  2. Create delegations: ./create-delegation.sh ${STORY_ID} <agent-name>"
echo "  3. Track progress throughout story"

#!/bin/bash
# Initialize retrospective for a completed story
# Usage: ./init-retrospective.sh us-001

set -e

STORY_ID=$1

if [ -z "$STORY_ID" ]; then
    echo "Usage: ./init-retrospective.sh <story-id>"
    echo "Example: ./init-retrospective.sh us-001"
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
RETRO_DIR="${STORY_ROOT}/retro"

# Check if story directory exists
if [ ! -d "$STORY_ROOT" ]; then
    echo "❌ Story directory not found: ${STORY_ROOT}"
    echo "   Did you run init-story.sh first?"
    exit 1
fi

# Create retro directory
mkdir -p "${RETRO_DIR}"

# Gather metrics automatically
echo "📊 Gathering story metrics..."

# Get commit count
COMMIT_COUNT=$(git log --oneline --grep="${STORY_ID}" | wc -l | tr -d ' ')

# Get merge commit
MERGE_COMMIT=$(git log --oneline --merges --grep="${STORY_ID}" | head -1 | awk '{print $1}')

# Get date range
START_DATE=$(git log --reverse --grep="${STORY_ID}" --format="%ai" | head -1 | cut -d' ' -f1)
END_DATE=$(git log --grep="${STORY_ID}" --format="%ai" | head -1 | cut -d' ' -f1)

# Calculate duration
if [ -n "$START_DATE" ] && [ -n "$END_DATE" ]; then
    DURATION=$(( ( $(date -j -f "%Y-%m-%d" "$END_DATE" "+%s") - $(date -j -f "%Y-%m-%d" "$START_DATE" "+%s") ) / 86400 ))
else
    DURATION="N/A"
fi

# Copy template and populate metrics
TEMPLATE_PATH="$(find . -path "*/retrospective-workflow/.apm/templates/retro-process.md" | head -1)"

if [ -z "$TEMPLATE_PATH" ]; then
    echo "❌ Retro template not found. Is retrospective-workflow skill installed?"
    exit 1
fi

# Create retro document
cat > "${RETRO_DIR}/retro.md" << EOF
# Story Retrospective: ${STORY_ID}

**Date**: $(date +%Y-%m-%d)
**Participants**: [Fill during retro]
**Duration**: ${DURATION} days
**Merge Commit**: ${MERGE_COMMIT}

## 📊 Metrics Summary

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Commits | ${COMMIT_COUNT} | - | - |
| Backend Tests | [Fill] | - | - |
| Frontend Tests | [Fill] | - | - |
| E2E Tests | [Fill] | - | - |
| Test Coverage (Backend) | [Fill]% | 80% | - |
| Test Coverage (Frontend) | [Fill]% | 80% | - |
| CLAUDE Audit Score | [Fill]/30 | 21/30 | - |
| TDD Cycles Visible | [Yes/No] | Yes | - |

## 🎉 Successes

### Testing
[To be filled during retro]

### Architecture
[To be filled during retro]

### Tooling
[To be filled during retro]

### Workflow
[To be filled during retro]

## 🔄 Improvements

### High Priority
[To be filled during retro]

### Medium Priority
[To be filled during retro]

### Low Priority / Future Consideration
[To be filled during retro]

## 📋 Action Items

| ID | Improvement | Owner | Target | Timeline | Status |
|----|-------------|-------|--------|----------|--------|
| [Fill] | [Description] | [Agent] | [Primitive] | [When] | 🔄 |

## 🔗 Handoff to Agent Package Manager

Handoff spec: \`${RETRO_DIR}/handoff.yml\`

---

**Retrospective Facilitator**: Retro Specialist
**Next Steps**: Fill retro document → Create handoff spec → Agent Package Manager implements
EOF

# Create handoff template
cat > "${RETRO_DIR}/handoff.yml" << 'EOF'
# Retrospective Handoff Spec
# Generated for Agent Package Manager to implement process improvements

story_id: ${STORY_ID}
retro_date: $(date +%Y-%m-%d)
facilitator: retro-specialist

changes:
  # Example:
  # - type: instruction
  #   target: skills/tdd-workflow/.apm/instructions/tdd-discipline.instructions.md
  #   action: update
  #   rationale: "Add commit prefix convention for TDD cycle visibility"
  #   priority: high
  #   content_diff: |
  #     ## TDD Commit Convention
  #     - 🔴 RED: Write failing test
  #     - 🟢 GREEN: Implement to pass
  #     - ♻️ REFACTOR: Improve code quality
  #   validation: "Check commit history in next story for emoji usage"

tracking:
  log_file: .memory/retro-log.md
  version_bumps_required: true
  dependent_projects:
    - birdmate
EOF

echo "✅ Retrospective initialized at ${RETRO_DIR}"
echo ""
echo "Next steps:"
echo "  1. Run: ./gather-retro-metrics.sh ${STORY_ID}"
echo "  2. Use prompt: /facilitate-retrospective ${STORY_ID}"
echo "  3. Validate: ./validate-retro.sh ${STORY_ID}"

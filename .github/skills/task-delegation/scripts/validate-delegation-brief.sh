#!/bin/bash
# Validate delegation brief completeness
# Usage: ./validate-delegation-brief.sh us-001 fullstack-engineer

set -e

STORY_ID=$1
AGENT_NAME=$2

if [ -z "$STORY_ID" ] || [ -z "$AGENT_NAME" ]; then
    echo "Usage: ./validate-delegation-brief.sh <story-id> <agent-name>"
    echo "Example: ./validate-delegation-brief.sh us-001 fullstack-engineer"
    exit 1
fi

# Auto-detect feature directory from speckit structure
FEATURE_DIR=$(find specs -maxdepth 1 -type d -name "[0-9]*-*" | head -1)

if [ -z "$FEATURE_DIR" ]; then
    echo "❌ No feature directory found in specs/"
    exit 1
fi

DELEGATION="${FEATURE_DIR}/stories/${STORY_ID}/delegation/${AGENT_NAME}.delegation.md"

if [ ! -f "$DELEGATION" ]; then
    echo "❌ Delegation brief not found: ${DELEGATION}"
    exit 1
fi

echo "🔍 Validating delegation brief: ${STORY_ID} → ${AGENT_NAME}"
echo ""

ERRORS=0

# Check required sections exist
REQUIRED_SECTIONS=(
    "## Context"
    "## Acceptance Criteria"
    "## Dependencies"
    "## Technical Details"
    "## Handoff to Next Story"
    "## Standards"
)

for section in "${REQUIRED_SECTIONS[@]}"; do
    if ! grep -q "$section" "$DELEGATION"; then
        echo "❌ Missing section: $section"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Section present: $section"
    fi
done

echo ""

# Check for [Fill] or placeholder content
PLACEHOLDERS=$(grep -c "\[Fill\]\|\[Story ID\]\|\[Agent Name\]" "$DELEGATION" || true)
if [ $PLACEHOLDERS -gt 0 ]; then
    echo "⚠️  Found ${PLACEHOLDERS} unfilled placeholders"
    grep -n "\[Fill\]\|\[Story ID\]\|\[Agent Name\]" "$DELEGATION" | while read -r line; do
        echo "   Line: $line"
    done
    ERRORS=$((ERRORS + 1))
else
    echo "✅ No placeholders remaining"
fi

echo ""

# Check for acceptance criteria checkboxes
CRITERIA_COUNT=$(grep -c "^- \[ \]" "$DELEGATION" || true)
if [ $CRITERIA_COUNT -eq 0 ]; then
    echo "❌ No acceptance criteria checkboxes found (expected format: - [ ] Criterion)"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Found ${CRITERIA_COUNT} acceptance criteria"
fi

echo ""

# Check for branch/worktree assignment
if grep -q "Branch:" "$DELEGATION" && grep -q "Worktree:" "$DELEGATION"; then
    BRANCH=$(grep "Branch:" "$DELEGATION" | head -1)
    WORKTREE=$(grep "Worktree:" "$DELEGATION" | head -1)
    echo "✅ Branch and worktree assigned"
    echo "   $BRANCH"
    echo "   $WORKTREE"
else
    echo "⚠️  Branch or worktree assignment missing"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "═══════════════════════════════════════"

if [ $ERRORS -eq 0 ]; then
    echo "✅ Delegation brief validation PASSED"
    exit 0
else
    echo "❌ Delegation brief validation FAILED (${ERRORS} errors)"
    exit 1
fi

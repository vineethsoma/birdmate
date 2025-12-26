#!/bin/bash
# Validate story tracker completeness
# Usage: ./validate-story-tracker.sh us-001

set -e

STORY_ID=$1

if [ -z "$STORY_ID" ]; then
    echo "Usage: ./validate-story-tracker.sh <story-id>"
    echo "Example: ./validate-story-tracker.sh us-001"
    exit 1
fi

# Auto-detect feature directory from speckit structure
FEATURE_DIR=$(find specs -maxdepth 1 -type d -name "[0-9]*-*" | head -1)

if [ -z "$FEATURE_DIR" ]; then
    echo "❌ No feature directory found in specs/"
    exit 1
fi

TRACKER="${FEATURE_DIR}/stories/${STORY_ID}/story-tracker.md"

if [ ! -f "$TRACKER" ]; then
    echo "❌ Story tracker not found: ${TRACKER}"
    exit 1
fi

echo "🔍 Validating story tracker: ${STORY_ID}"
echo ""

ERRORS=0

# Check required sections exist
REQUIRED_SECTIONS=(
    "## Story Overview"
    "## Acceptance Criteria"
    "## Tasks"
    "## Implementation Status"
)

for section in "${REQUIRED_SECTIONS[@]}"; do
    if ! grep -q "$section" "$TRACKER"; then
        echo "❌ Missing section: $section"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Section present: $section"
    fi
done

echo ""

# Check for [Fill] placeholders
PLACEHOLDERS=$(grep -c "\[Fill\]" "$TRACKER" || true)
if [ $PLACEHOLDERS -gt 0 ]; then
    echo "⚠️  Found ${PLACEHOLDERS} unfilled [Fill] placeholders"
    grep -n "\[Fill\]" "$TRACKER" | while read -r line; do
        echo "   Line: $line"
    done
    ERRORS=$((ERRORS + 1))
else
    echo "✅ No [Fill] placeholders remaining"
fi

echo ""

# Check for tasks with status
TASK_LINES=$(grep -c "^\- \[.\]" "$TRACKER" || true)
if [ $TASK_LINES -eq 0 ]; then
    echo "❌ No tasks found (expected format: - [ ] Task name)"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Found ${TASK_LINES} tasks"
    
    # Count task statuses
    NOT_STARTED=$(grep -c "^\- \[ \]" "$TRACKER" || true)
    IN_PROGRESS=$(grep -c "^\- \[🔄\]" "$TRACKER" || true)
    COMPLETED=$(grep -c "^\- \[x\]" "$TRACKER" || true)
    
    echo "   Not Started: ${NOT_STARTED}"
    echo "   In Progress: ${IN_PROGRESS}"
    echo "   Completed:   ${COMPLETED}"
fi

echo ""
echo "═══════════════════════════════════════"

if [ $ERRORS -eq 0 ]; then
    echo "✅ Story tracker validation PASSED"
    exit 0
else
    echo "❌ Story tracker validation FAILED (${ERRORS} errors)"
    exit 1
fi

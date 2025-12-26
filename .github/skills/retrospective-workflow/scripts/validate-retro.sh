#!/bin/bash
# Validate retrospective document completeness
# Usage: ./validate-retro.sh us-001

set -e

STORY_ID=$1

if [ -z "$STORY_ID" ]; then
    echo "Usage: ./validate-retro.sh <story-id>"
    exit 1
fi

# Auto-detect feature directory from speckit structure
FEATURE_DIR=$(find specs -maxdepth 1 -type d -name "[0-9]*-*" | head -1)
FEATURE=$(basename "${FEATURE_DIR}" | cut -d'-' -f2- || echo "unknown")
RETRO_FILE="${FEATURE_DIR}/stories/${STORY_ID}/retro/retro.md"
HANDOFF_FILE="${FEATURE_DIR}/stories/${STORY_ID}/retro/handoff.yml"

if [ ! -f "$RETRO_FILE" ]; then
    echo "❌ Retro file not found: ${RETRO_FILE}"
    exit 1
fi

echo "🔍 Validating retrospective for ${STORY_ID}..."
echo ""

# Check required sections
ERRORS=0

check_section() {
    local section=$1
    if ! grep -q "## ${section}" "$RETRO_FILE"; then
        echo "❌ Missing section: ${section}"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Section present: ${section}"
    fi
}

# Check sections
check_section "📊 Metrics Summary"
check_section "🎉 Successes"
check_section "🔄 Improvements"
check_section "📋 Action Items"

# Check if metrics are filled (not just [Fill])
echo ""
echo "Checking metrics completeness..."
if grep -q "\[Fill\]" "$RETRO_FILE"; then
    FILL_COUNT=$(grep -o "\[Fill\]" "$RETRO_FILE" | wc -l | tr -d ' ')
    echo "⚠️  Found ${FILL_COUNT} unfilled placeholders ([Fill])"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ All metrics filled"
fi

# Check handoff file exists and is valid YAML
echo ""
echo "Checking handoff spec..."
if [ ! -f "$HANDOFF_FILE" ]; then
    echo "❌ Handoff file not found: ${HANDOFF_FILE}"
    ERRORS=$((ERRORS + 1))
else
    # Basic YAML syntax check
    if command -v yq &> /dev/null; then
        if yq eval '.' "$HANDOFF_FILE" &> /dev/null; then
            echo "✅ Handoff YAML is valid"
            
            # Check required fields
            if yq eval '.story_id' "$HANDOFF_FILE" | grep -q "null"; then
                echo "❌ Missing field: story_id"
                ERRORS=$((ERRORS + 1))
            fi
            
            if yq eval '.changes | length' "$HANDOFF_FILE" | grep -q "0"; then
                echo "⚠️  No changes specified in handoff"
            else
                CHANGE_COUNT=$(yq eval '.changes | length' "$HANDOFF_FILE")
                echo "✅ Handoff contains ${CHANGE_COUNT} changes"
            fi
        else
            echo "❌ Handoff YAML syntax invalid"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo "⚠️  yq not installed, skipping YAML validation"
    fi
fi

# Final verdict
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo "✅ Retrospective validation PASSED"
    echo "   Ready for Agent Package Manager handoff"
    exit 0
else
    echo "❌ Retrospective validation FAILED"
    echo "   Found ${ERRORS} issues"
    exit 1
fi

#!/bin/bash
# Validate CLAUDE audit checklist
# Usage: ./validate-claude-audit.sh us-001

set -e

STORY_ID=$1

if [ -z "$STORY_ID" ]; then
    echo "Usage: ./validate-claude-audit.sh <story-id>"
    echo "Example: ./validate-claude-audit.sh us-001"
    exit 1
fi

# Auto-detect feature directory from speckit structure
FEATURE_DIR=$(find specs -maxdepth 1 -type d -name "[0-9]*-*" | head -1)

if [ -z "$FEATURE_DIR" ]; then
    echo "❌ No feature directory found in specs/"
    exit 1
fi

CHECKLIST="${FEATURE_DIR}/stories/${STORY_ID}/checklists/claude-audit.md"

if [ ! -f "$CHECKLIST" ]; then
    echo "❌ CLAUDE audit checklist not found: ${CHECKLIST}"
    exit 1
fi

echo "🔍 Validating CLAUDE audit: ${STORY_ID}"
echo ""

ERRORS=0

# Check required sections exist
REQUIRED_SECTIONS=(
    "## Code Quality (C)"
    "## Naming Conventions (N)"
    "## Error Handling (E)"
    "## Security (S)"
    "## Testing (T)"
    "## Database (D)"
    "## Logging (L)"
)

for section in "${REQUIRED_SECTIONS[@]}"; do
    if ! grep -q "$section" "$CHECKLIST"; then
        echo "❌ Missing section: $section"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Section present: $section"
    fi
done

echo ""

# Check for unchecked items
UNCHECKED=$(grep -c "^- \[ \]" "$CHECKLIST" || true)
CHECKED=$(grep -c "^- \[x\]" "$CHECKLIST" || true)
TOTAL=$((UNCHECKED + CHECKED))

if [ $TOTAL -eq 0 ]; then
    echo "❌ No checklist items found"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Checklist items: ${CHECKED}/${TOTAL} completed"
    
    if [ $UNCHECKED -gt 0 ]; then
        echo "⚠️  Uncompleted items:"
        grep -n "^- \[ \]" "$CHECKLIST" | head -5 | while read -r line; do
            echo "   $line"
        done
        if [ $UNCHECKED -gt 5 ]; then
            echo "   ... and $((UNCHECKED - 5)) more"
        fi
    fi
fi

echo ""

# Calculate audit score (percentage of checked items)
if [ $TOTAL -gt 0 ]; then
    SCORE=$((CHECKED * 100 / TOTAL))
    echo "📊 CLAUDE Audit Score: ${SCORE}%"
    
    if [ $SCORE -eq 100 ]; then
        echo "✅ Perfect score!"
    elif [ $SCORE -ge 90 ]; then
        echo "✅ Excellent (≥90%)"
    elif [ $SCORE -ge 80 ]; then
        echo "⚠️  Good (≥80%), address remaining items"
    else
        echo "❌ Needs improvement (<80%)"
        ERRORS=$((ERRORS + 1))
    fi
fi

echo ""
echo "═══════════════════════════════════════"

if [ $ERRORS -eq 0 ] && [ $UNCHECKED -eq 0 ]; then
    echo "✅ CLAUDE audit validation PASSED"
    exit 0
else
    echo "❌ CLAUDE audit validation FAILED"
    echo "   Errors: ${ERRORS}"
    echo "   Unchecked items: ${UNCHECKED}"
    exit 1
fi

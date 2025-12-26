#!/bin/bash
# Validate TDD compliance checklist
# Usage: ./validate-tdd-compliance.sh us-001

set -e

STORY_ID=$1

if [ -z "$STORY_ID" ]; then
    echo "Usage: ./validate-tdd-compliance.sh <story-id>"
    echo "Example: ./validate-tdd-compliance.sh us-001"
    exit 1
fi

# Auto-detect feature directory from speckit structure
FEATURE_DIR=$(find specs -maxdepth 1 -type d -name "[0-9]*-*" | head -1)

if [ -z "$FEATURE_DIR" ]; then
    echo "❌ No feature directory found in specs/"
    exit 1
fi

CHECKLIST="${FEATURE_DIR}/stories/${STORY_ID}/checklists/tdd-compliance.md"

if [ ! -f "$CHECKLIST" ]; then
    echo "❌ TDD compliance checklist not found: ${CHECKLIST}"
    exit 1
fi

echo "🔍 Validating TDD compliance: ${STORY_ID}"
echo ""

ERRORS=0

# Check required sections exist
REQUIRED_SECTIONS=(
    "## Test-First Development"
    "## Test Coverage"
    "## Test Quality"
    "## TDD Discipline"
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

# Check TDD commit pattern
BRANCH="feat-${STORY_ID}"
if git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
    RED_COMMITS=$(git log origin/main.."$BRANCH" --oneline --grep="🔴" | wc -l | xargs)
    GREEN_COMMITS=$(git log origin/main.."$BRANCH" --oneline --grep="🟢" | wc -l | xargs)
    
    if [ "$RED_COMMITS" -gt 0 ] && [ "$GREEN_COMMITS" -gt 0 ]; then
        echo "✅ TDD commit discipline followed (🔴→🟢 cycle detected)"
    else
        echo "⚠️  TDD commit pattern not detected"
        echo "   Red commits (🔴): ${RED_COMMITS}"
        echo "   Green commits (🟢): ${GREEN_COMMITS}"
        echo "   Consider using TDD commit convention"
    fi
else
    echo "⚠️  Branch not found: ${BRANCH} (skip commit check)"
fi

echo ""

# Check test coverage
if [ -f "backend/coverage/coverage-summary.json" ]; then
    BACKEND_COV=$(jq -r '.total.lines.pct' backend/coverage/coverage-summary.json 2>/dev/null || echo "0")
    if (( $(echo "$BACKEND_COV >= 80" | bc -l) )); then
        echo "✅ Backend coverage: ${BACKEND_COV}% (meets 80% minimum)"
    else
        echo "❌ Backend coverage: ${BACKEND_COV}% (below 80% minimum)"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "⚠️  Backend coverage not found (run: cd backend && npm test -- --coverage)"
fi

if [ -f "frontend/coverage/coverage-summary.json" ]; then
    FRONTEND_COV=$(jq -r '.total.lines.pct' frontend/coverage/coverage-summary.json 2>/dev/null || echo "0")
    if (( $(echo "$FRONTEND_COV >= 80" | bc -l) )); then
        echo "✅ Frontend coverage: ${FRONTEND_COV}% (meets 80% minimum)"
    else
        echo "❌ Frontend coverage: ${FRONTEND_COV}% (below 80% minimum)"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "⚠️  Frontend coverage not found (run: cd frontend && npm test -- --coverage)"
fi

echo ""
echo "═══════════════════════════════════════"

if [ $ERRORS -eq 0 ] && [ $UNCHECKED -eq 0 ]; then
    echo "✅ TDD compliance validation PASSED"
    exit 0
else
    echo "❌ TDD compliance validation FAILED"
    echo "   Errors: ${ERRORS}"
    echo "   Unchecked items: ${UNCHECKED}"
    exit 1
fi

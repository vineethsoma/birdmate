#!/bin/bash
# Gather TDD compliance metrics
# Usage: ./gather-tdd-metrics.sh us-001

set -e

STORY_ID=$1

if [ -z "$STORY_ID" ]; then
    echo "Usage: ./gather-tdd-metrics.sh <story-id>"
    echo "Example: ./gather-tdd-metrics.sh us-001"
    exit 1
fi

# Auto-detect feature directory from speckit structure
FEATURE_DIR=$(find specs -maxdepth 1 -type d -name "[0-9]*-*" | head -1)

if [ -z "$FEATURE_DIR" ]; then
    echo "❌ No feature directory found in specs/"
    exit 1
fi

BRANCH="feat-${STORY_ID}"

echo "📊 TDD Metrics for ${STORY_ID}"
echo "═══════════════════════════════════════"
echo ""

# TDD Commit Pattern (🔴🟢♻️)
echo "### TDD Commit Discipline"
RED_COMMITS=$(git log origin/main.."$BRANCH" --oneline --grep="🔴" | wc -l | xargs)
GREEN_COMMITS=$(git log origin/main.."$BRANCH" --oneline --grep="🟢" | wc -l | xargs)
REFACTOR_COMMITS=$(git log origin/main.."$BRANCH" --oneline --grep="♻️" | wc -l | xargs)

echo "- 🔴 Red (Failing Test): ${RED_COMMITS} commits"
echo "- 🟢 Green (Passing Impl): ${GREEN_COMMITS} commits"
echo "- ♻️ Refactor: ${REFACTOR_COMMITS} commits"
echo ""

if [ "$RED_COMMITS" -gt 0 ] && [ "$GREEN_COMMITS" -gt 0 ]; then
    echo "✅ TDD cycle followed (Red → Green detected)"
else
    echo "⚠️  TDD cycle may not be followed (check commits)"
fi
echo ""

# Test Coverage (Backend)
if [ -d "backend/coverage" ]; then
    echo "### Backend Test Coverage"
    if [ -f "backend/coverage/coverage-summary.json" ]; then
        BACKEND_COV=$(jq -r '.total.lines.pct' backend/coverage/coverage-summary.json 2>/dev/null || echo "N/A")
        echo "- Lines: ${BACKEND_COV}%"
    else
        echo "- Run: cd backend && npm test -- --coverage"
    fi
    echo ""
fi

# Test Coverage (Frontend)
if [ -d "frontend/coverage" ]; then
    echo "### Frontend Test Coverage"
    if [ -f "frontend/coverage/coverage-summary.json" ]; then
        FRONTEND_COV=$(jq -r '.total.lines.pct' frontend/coverage/coverage-summary.json 2>/dev/null || echo "N/A")
        echo "- Lines: ${FRONTEND_COV}%"
    else
        echo "- Run: cd frontend && npm test -- --coverage"
    fi
    echo ""
fi

# Test Counts
echo "### Test Counts"
BACKEND_TESTS=$(find backend/src backend/tests -name "*.test.ts" -o -name "*.spec.ts" 2>/dev/null | wc -l | xargs)
FRONTEND_TESTS=$(find frontend/src -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" 2>/dev/null | wc -l | xargs)

echo "- Backend test files: ${BACKEND_TESTS}"
echo "- Frontend test files: ${FRONTEND_TESTS}"
echo ""

# Test-to-Code Ratio
BACKEND_CODE=$(find backend/src -name "*.ts" ! -name "*.test.ts" ! -name "*.spec.ts" 2>/dev/null | wc -l | xargs)
FRONTEND_CODE=$(find frontend/src -name "*.ts" -o -name "*.tsx" ! -name "*.test.ts" ! -name "*.test.tsx" 2>/dev/null | wc -l | xargs)

if [ "$BACKEND_CODE" -gt 0 ]; then
    BACKEND_RATIO=$(echo "scale=2; $BACKEND_TESTS / $BACKEND_CODE" | bc)
    echo "- Backend test-to-code ratio: ${BACKEND_RATIO}"
fi

if [ "$FRONTEND_CODE" -gt 0 ]; then
    FRONTEND_RATIO=$(echo "scale=2; $FRONTEND_TESTS / $FRONTEND_CODE" | bc)
    echo "- Frontend test-to-code ratio: ${FRONTEND_RATIO}"
fi

echo ""
echo "═══════════════════════════════════════"
echo "Copy these metrics to tdd-compliance.md"

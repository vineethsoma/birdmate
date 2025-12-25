#!/bin/bash
# Gather comprehensive retrospective metrics
# Usage: ./gather-retro-metrics.sh us-001

set -e

STORY_ID=$1

if [ -z "$STORY_ID" ]; then
    echo "Usage: ./gather-retro-metrics.sh <story-id>"
    exit 1
fi

# Load configuration
FEATURE=$(grep 'current_feature:' .apm-workflow.yml 2>/dev/null | awk '{print $2}' || echo "unknown")
STORY_ROOT="specs/${FEATURE}/stories/${STORY_ID}"

echo "📊 Gathering metrics for ${STORY_ID}..."
echo ""

# Test counts
echo "### Test Metrics"
if [ -d "backend" ]; then
    BACKEND_TESTS=$(cd backend && npm test 2>&1 | grep -E "Tests.*passed" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" || echo "0")
    echo "Backend Tests: ${BACKEND_TESTS}"
fi

if [ -d "frontend" ]; then
    FRONTEND_TESTS=$(cd frontend && npm test 2>&1 | grep -E "Tests.*passed" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" || echo "0")
    echo "Frontend Tests: ${FRONTEND_TESTS}"
fi

# Coverage
echo ""
echo "### Coverage"
if [ -d "backend/coverage" ]; then
    BACKEND_COV=$(grep -oE "[0-9]+\.[0-9]+%" backend/coverage/coverage-summary.json 2>/dev/null | head -1 || echo "N/A")
    echo "Backend Coverage: ${BACKEND_COV}"
fi

if [ -d "frontend/coverage" ]; then
    FRONTEND_COV=$(grep -oE "[0-9]+\.[0-9]+%" frontend/coverage/coverage-summary.json 2>/dev/null | head -1 || echo "N/A")
    echo "Frontend Coverage: ${FRONTEND_COV}"
fi

# TDD Discipline - Check for emoji commits
echo ""
echo "### TDD Cycle Visibility"
RED_COMMITS=$(git log --oneline --grep="${STORY_ID}" | grep "🔴" | wc -l | tr -d ' ')
GREEN_COMMITS=$(git log --oneline --grep="${STORY_ID}" | grep "🟢" | wc -l | tr -d ' ')
REFACTOR_COMMITS=$(git log --oneline --grep="${STORY_ID}" | grep "♻️" | wc -l | tr -d ' ')
TOTAL_TDD=$(( RED_COMMITS + GREEN_COMMITS + REFACTOR_COMMITS ))

echo "🔴 RED commits: ${RED_COMMITS}"
echo "🟢 GREEN commits: ${GREEN_COMMITS}"
echo "♻️ REFACTOR commits: ${REFACTOR_COMMITS}"
echo "Total TDD-visible commits: ${TOTAL_TDD}"

# Commit stats
echo ""
echo "### Commit Stats"
TOTAL_COMMITS=$(git log --oneline --grep="${STORY_ID}" | wc -l | tr -d ' ')
echo "Total commits: ${TOTAL_COMMITS}"

# Lines changed
echo ""
echo "### Code Changes"
LINES_CHANGED=$(git log --oneline --grep="${STORY_ID}" --numstat | awk '{add+=$1; del+=$2} END {printf "+%d / -%d\n", add, del}')
echo "Lines changed: ${LINES_CHANGED}"

# Duration
echo ""
echo "### Timeline"
START_DATE=$(git log --reverse --grep="${STORY_ID}" --format="%ai" | head -1)
END_DATE=$(git log --grep="${STORY_ID}" --format="%ai" | head -1)
echo "Started: ${START_DATE}"
echo "Completed: ${END_DATE}"

# CLAUDE Audit (if exists)
echo ""
echo "### Quality Gates"
if [ -f "${STORY_ROOT}/checklists/claude-audit.md" ]; then
    AUDIT_SCORE=$(grep -oE "[0-9]+/30" "${STORY_ROOT}/checklists/claude-audit.md" | head -1 || echo "N/A")
    echo "CLAUDE Audit: ${AUDIT_SCORE}"
else
    echo "CLAUDE Audit: Not run"
fi

echo ""
echo "✅ Metrics gathered. Update ${STORY_ROOT}/retro/retro.md with these values."

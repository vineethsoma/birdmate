#!/bin/bash
# Gather E2E test metrics
# Usage: ./gather-e2e-metrics.sh us-001

set -e

STORY_ID=$1

if [ -z "$STORY_ID" ]; then
    echo "Usage: ./gather-e2e-metrics.sh <story-id>"
    echo "Example: ./gather-e2e-metrics.sh us-001"
    exit 1
fi

echo "📊 E2E Test Metrics for ${STORY_ID}"
echo "═══════════════════════════════════════"
echo ""

# Find E2E test files
echo "### E2E Test Files"
E2E_TESTS=$(find frontend/src tests -name "*.e2e.ts" -o -name "*.spec.ts" 2>/dev/null | wc -l | xargs)
echo "- E2E test files: ${E2E_TESTS}"

if [ -d "tests/e2e" ]; then
    E2E_SPEC_COUNT=$(find tests/e2e -name "*.spec.ts" 2>/dev/null | wc -l | xargs)
    echo "- tests/e2e/ specs: ${E2E_SPEC_COUNT}"
fi
echo ""

# Run E2E tests and capture results
echo "### Test Execution"
if command -v npx &> /dev/null && [ -f "playwright.config.ts" ]; then
    echo "Running Playwright tests..."
    TEST_OUTPUT=$(npx playwright test --reporter=list 2>&1 || true)
    
    PASSED=$(echo "$TEST_OUTPUT" | grep -c "passed" || echo "0")
    FAILED=$(echo "$TEST_OUTPUT" | grep -c "failed" || echo "0")
    
    echo "- Tests passed: ${PASSED}"
    echo "- Tests failed: ${FAILED}"
    
    # Extract duration
    DURATION=$(echo "$TEST_OUTPUT" | grep -o "[0-9]*\.*[0-9]*s" | tail -1 || echo "N/A")
    echo "- Duration: ${DURATION}"
else
    echo "- Playwright not configured (skip test run)"
fi
echo ""

# Test coverage
echo "### Coverage"
if [ -f "playwright-report/index.html" ]; then
    echo "- Playwright report: playwright-report/index.html"
else
    echo "- No coverage report (run: npx playwright test)"
fi
echo ""

# User workflows tested
echo "### User Workflows"
if [ $E2E_TESTS -gt 0 ]; then
    echo "- Review test files for covered workflows"
    find frontend/src tests -name "*.e2e.ts" -o -name "*.spec.ts" 2>/dev/null | while read -r file; do
        echo "  - $(basename $file)"
    done
else
    echo "- No E2E tests found"
fi

echo ""
echo "═══════════════════════════════════════"
echo "Copy these metrics to e2e-test-plan.md"

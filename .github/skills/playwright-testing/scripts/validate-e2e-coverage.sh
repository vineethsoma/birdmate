#!/bin/bash
# Validate E2E test coverage
# Usage: ./validate-e2e-coverage.sh us-001

set -e

STORY_ID=$1

if [ -z "$STORY_ID" ]; then
    echo "Usage: ./validate-e2e-coverage.sh <story-id>"
    echo "Example: ./validate-e2e-coverage.sh us-001"
    exit 1
fi

# Auto-detect feature directory from speckit structure
FEATURE_DIR=$(find specs -maxdepth 1 -type d -name "[0-9]*-*" | head -1)

if [ -z "$FEATURE_DIR" ]; then
    echo "❌ No feature directory found in specs/"
    exit 1
fi

TEST_PLAN="${FEATURE_DIR}/stories/${STORY_ID}/checklists/e2e-test-plan.md"

if [ ! -f "$TEST_PLAN" ]; then
    echo "❌ E2E test plan not found: ${TEST_PLAN}"
    exit 1
fi

echo "🔍 Validating E2E coverage: ${STORY_ID}"
echo ""

ERRORS=0

# Check required sections
REQUIRED_SECTIONS=(
    "## User Workflows"
    "## Test Coverage"
    "## Test Results"
)

for section in "${REQUIRED_SECTIONS[@]}"; do
    if ! grep -q "$section" "$TEST_PLAN"; then
        echo "❌ Missing section: $section"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Section present: $section"
    fi
done

echo ""

# Check for E2E test files
E2E_TESTS=$(find frontend/src tests -name "*.e2e.ts" -o -name "*.spec.ts" 2>/dev/null | wc -l | xargs)

if [ $E2E_TESTS -eq 0 ]; then
    echo "❌ No E2E test files found"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ E2E test files: ${E2E_TESTS}"
fi

# Run tests
if command -v npx &> /dev/null && [ -f "playwright.config.ts" ]; then
    echo ""
    echo "Running Playwright tests..."
    TEST_OUTPUT=$(npx playwright test 2>&1 || true)
    
    if echo "$TEST_OUTPUT" | grep -q "passed"; then
        PASSED=$(echo "$TEST_OUTPUT" | grep -o "[0-9]* passed" | grep -o "[0-9]*")
        echo "✅ Tests passed: ${PASSED}"
    else
        echo "❌ No tests passed"
        ERRORS=$((ERRORS + 1))
    fi
    
    if echo "$TEST_OUTPUT" | grep -q "failed"; then
        FAILED=$(echo "$TEST_OUTPUT" | grep -o "[0-9]* failed" | grep -o "[0-9]*")
        echo "❌ Tests failed: ${FAILED}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "⚠️  Playwright not configured (skip test execution)"
fi

echo ""
echo "═══════════════════════════════════════"

if [ $ERRORS -eq 0 ]; then
    echo "✅ E2E coverage validation PASSED"
    exit 0
else
    echo "❌ E2E coverage validation FAILED (${ERRORS} errors)"
    exit 1
fi

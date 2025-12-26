---
description: Create comprehensive E2E test plan with Playwright
tools: ['read', 'edit', 'execute']
---

# Create E2E Test Plan

Guide the team through creating a comprehensive End-to-End test plan with Playwright.

## Context Gathering

1. **Read story context**:
   - Read: `specs/{feature}/stories/{story-id}/story-tracker.md`
   - Read: `specs/{feature}/spec.md` for user workflows
   - Identify user-facing features to test

2. **Read acceptance criteria**:
   - Extract user workflows from acceptance criteria
   - Identify happy paths and edge cases
   - Note error scenarios

## E2E Test Planning

### Step 1: Identify User Workflows

From acceptance criteria, extract complete user journeys:

**Example workflows**:
```markdown
## User Workflows to Test

1. **User Registration**
   - Navigate to signup page
   - Fill registration form
   - Submit and verify account created
   - Check welcome email sent

2. **User Login**
   - Navigate to login page
   - Enter credentials
   - Verify dashboard loads
   - Check user profile displayed

3. **Error Handling**
   - Submit form with invalid email
   - Verify error message shown
   - Verify form not submitted
```

### Step 2: Write Playwright Tests

For each workflow, create E2E test:

**Test structure**:
```typescript
// tests/e2e/user-registration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
  test('user can register with valid credentials', async ({ page }) => {
    // Navigate
    await page.goto('/signup');
    
    // Fill form
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('SecurePass123!');
    await page.getByLabel('Confirm Password').fill('SecurePass123!');
    
    // Submit
    await page.getByRole('button', { name: 'Sign Up' }).click();
    
    // Verify success
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Welcome')).toBeVisible();
  });

  test('shows error with invalid email', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel('Email').fill('notanemail');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    
    await expect(page.getByText('Invalid email format')).toBeVisible();
  });
});
```

### Step 3: Test Coverage

Ensure coverage of:
- **Happy paths**: Primary user workflows work end-to-end
- **Error scenarios**: Invalid input, network errors, permissions
- **Edge cases**: Empty fields, special characters, boundary values
- **Accessibility**: Keyboard navigation, screen reader support

**Coverage checklist**:
```markdown
## Test Coverage

- [x] Happy path: User can complete registration
- [x] Error: Invalid email shows error message
- [x] Error: Password mismatch shows error
- [ ] Edge case: Registration with existing email
- [ ] Accessibility: Tab navigation works
```

### Step 4: Test Execution

Run tests:
```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/user-registration.spec.ts

# Run with UI mode
npx playwright test --ui

# Generate report
npx playwright show-report
```

### Step 5: Validation

```bash
./scripts/validate-e2e-coverage.sh <story-id>
```

Checks:
- E2E test files exist
- Tests pass
- Coverage documented in test plan

## Test Plan Template

Update `e2e-test-plan.md`:

```markdown
## User Workflows

1. **User Registration**
   - Status: ✅ Implemented
   - Test file: tests/e2e/user-registration.spec.ts
   - Test count: 3 (happy path, 2 error cases)

2. **User Login**
   - Status: 🔄 In Progress
   - Test file: tests/e2e/user-login.spec.ts

## Test Coverage

- [x] Happy paths covered (2/2 workflows)
- [x] Error scenarios tested (4 cases)
- [ ] Edge cases covered (1/3 remaining)
- [ ] Accessibility tests (TODO)

## Test Results

- Tests passing: 5/5
- Duration: 12.3s
- Last run: 2025-12-25
```

## Playwright Best Practices

Remind team of Playwright standards:
- Use `getByRole`, `getByLabel`, `getByText` (user-facing selectors)
- Avoid CSS selectors (brittle)
- Wait for conditions, not timeouts
- Test independence (no shared state)
- Page Object Model for complex flows

Reference: [Playwright standards instructions](../../playwright-testing/.apm/instructions/playwright-standards.instructions.md)

## Next Steps

After E2E tests complete:
1. Run full test suite: `npx playwright test`
2. Generate report: `npx playwright show-report`
3. Validate coverage: `./scripts/validate-e2e-coverage.sh <story-id>`
4. Update test plan with results
5. Ready for merge

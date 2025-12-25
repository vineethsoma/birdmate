---
name: Write E2E Test
description: Generate comprehensive Playwright E2E tests from requirements
tools: ['read', 'edit', 'search']
---

# Write E2E Test with Playwright

Generate production-ready end-to-end tests using Playwright.

## Process

### Step 1: Understand Requirements

**Ask the user**:
- What feature/flow are you testing?
- What is the happy path?
- What edge cases should be covered?
- Are there any API dependencies to mock?
- What browser/viewport sizes are critical?

**Gather context**:
- Read existing test files to match style
- Search for related component/page files
- Identify test data requirements

### Step 2: Analyze Feature

**Map user flow**:
1. Entry point (URL/navigation)
2. User actions (clicks, inputs, selections)
3. Expected outcomes (visible changes, redirects, API calls)
4. Error scenarios (validation, network failures)

**Identify selectors**:
- Use `getByRole()` for interactive elements
- Use `getByLabel()` for form fields
- Use `getByTestId()` only when necessary

### Step 3: Write Test Structure

**Create test file**: `tests/e2e/[feature]/[action].spec.ts`

**Test structure**:
```typescript
import { test, expect } from '@playwright/test';

test.describe('[Feature Name]', () => {
  test.beforeEach(async ({ page }) => {
    // Common setup
  });

  test('[should do happy path]', async ({ page }) => {
    // ARRANGE
    // ACT
    // ASSERT
  });

  test('[should handle edge case]', async ({ page }) => {
    // Edge case test
  });

  test('[should show error when...]', async ({ page }) => {
    // Error scenario
  });
});
```

### Step 4: Implement Tests

**Follow standards**:
- ✅ User-facing selectors (role, label, text)
- ✅ Explicit waits (never `waitForTimeout`)
- ✅ Independent tests (no shared state)
- ✅ Clear assertions (what user sees/experiences)
- ✅ Mock external APIs when appropriate

**Example implementation**:
```typescript
test('user can complete checkout flow', async ({ page }) => {
  // ARRANGE - Navigate and add item
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  
  // ACT - Go to checkout
  await page.getByTestId('cart-icon').click();
  await page.getByRole('link', { name: 'Proceed to Checkout' }).click();
  
  // Fill payment info
  await page.getByLabel('Card Number').fill('4242424242424242');
  await page.getByLabel('Expiry Date').fill('12/25');
  await page.getByLabel('CVV').fill('123');
  await page.getByRole('button', { name: 'Complete Purchase' }).click();
  
  // ASSERT - Verify success
  await expect(page).toHaveURL('/order-confirmation');
  await expect(page.getByRole('heading', { name: 'Order Confirmed' })).toBeVisible();
  await expect(page.getByTestId('order-number')).toBeVisible();
});
```

### Step 5: Add Edge Cases

**Common scenarios**:
- Empty/invalid inputs
- Network failures
- Slow responses
- Concurrent actions
- Browser back/forward
- Mobile viewport

**Example edge case**:
```typescript
test('show validation error for invalid card', async ({ page }) => {
  await page.goto('/checkout');
  
  await page.getByLabel('Card Number').fill('1234'); // Invalid
  await page.getByRole('button', { name: 'Complete Purchase' }).click();
  
  await expect(page.getByText('Invalid card number')).toBeVisible();
  await expect(page).toHaveURL('/checkout'); // Still on checkout page
});
```

### Step 6: Mock External Dependencies

**API mocking**:
```typescript
test('handle payment processing error', async ({ page }) => {
  // Mock payment API failure
  await page.route('**/api/process-payment', async route => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Payment gateway unavailable' })
    });
  });
  
  await page.goto('/checkout');
  // ... fill form ...
  await page.getByRole('button', { name: 'Complete Purchase' }).click();
  
  await expect(page.getByText('Payment failed. Please try again.')).toBeVisible();
});
```

### Step 7: Accessibility Testing

**Include a11y checks**:
```typescript
test('checkout form is keyboard accessible', async ({ page }) => {
  await page.goto('/checkout');
  
  // Tab through form
  await page.keyboard.press('Tab'); // Card number
  await page.keyboard.type('4242424242424242');
  
  await page.keyboard.press('Tab'); // Expiry
  await page.keyboard.type('12/25');
  
  await page.keyboard.press('Tab'); // CVV
  await page.keyboard.type('123');
  
  await page.keyboard.press('Tab'); // Submit button
  await page.keyboard.press('Enter');
  
  // Verify submission worked
  await expect(page).toHaveURL('/order-confirmation');
});
```

### Step 8: Review and Run

**Checklist**:
- [ ] Tests use user-facing selectors
- [ ] No arbitrary waits (`waitForTimeout`)
- [ ] Tests are independent (can run alone)
- [ ] Assertions on expected user experience
- [ ] Edge cases covered
- [ ] APIs mocked when appropriate
- [ ] File in correct directory
- [ ] Follows existing test style

**Run tests**:
```bash
# Run all tests
npx playwright test

# Run specific file
npx playwright test tests/e2e/checkout/payment.spec.ts

# Debug mode
npx playwright test --debug

# Generate report
npx playwright show-report
```

## Human Approval Gates

**MUST ASK before**:
1. Writing tests (confirm feature understanding)
2. Mocking external APIs (confirm which APIs)
3. Creating page objects (confirm necessity)

**MUST SHOW after**:
1. Test file created with test count
2. Test run results (pass/fail)
3. Any warnings or issues discovered

## Output

**Deliverables**:
1. Test file(s) in proper directory
2. Test run confirmation (all passing)
3. Brief summary of coverage (happy path + edge cases)

**Summary format**:
```markdown
## E2E Tests Created

**File**: `tests/e2e/checkout/payment.spec.ts`

**Tests written**: 5
- ✅ Complete checkout flow (happy path)
- ✅ Invalid card validation
- ✅ Payment API failure handling
- ✅ Keyboard navigation
- ✅ Mobile viewport checkout

**Test results**: ✅ 5/5 passed

**Coverage**:
- Happy path: ✅
- Edge cases: ✅ (invalid input, API errors)
- Accessibility: ✅ (keyboard nav)
- Mobile: ✅ (responsive testing)
```

## Success Criteria

- ✅ All tests pass on first run
- ✅ Tests follow Playwright standards
- ✅ User-facing selectors used
- ✅ No flaky waits
- ✅ Independent tests (parallelizable)
- ✅ Clear, readable test names

---

**Remember**: Tests should read like user stories. If a non-developer can understand what's being tested, you're doing it right.

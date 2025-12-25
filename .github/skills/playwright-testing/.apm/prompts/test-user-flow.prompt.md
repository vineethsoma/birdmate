---
name: Test User Flow
description: Create comprehensive E2E tests for complete user journeys
tools: ['read', 'edit', 'search']
---

# Test User Flow with Playwright

Test complete user journeys from start to finish.

## Process

### Step 1: Map User Journey

**Ask the user**:
- What is the user's goal? (e.g., "purchase a product", "sign up and verify email")
- What is the starting point? (logged out, logged in, specific page)
- What are the key decision points?
- What constitutes success?

**Document the flow**:
```markdown
## User Flow: Purchase Product

1. **Start**: Landing page (logged out)
2. **Browse**: View product catalog
3. **Select**: Click on product
4. **Review**: View product details
5. **Add**: Add to cart
6. **Checkout**: Go to checkout
7. **Auth**: Sign up or log in
8. **Payment**: Enter payment info
9. **Confirm**: Complete purchase
10. **Success**: Order confirmation

**Decision Points**:
- New user vs returning user (Step 7)
- Valid vs invalid payment (Step 8)

**Success Criteria**:
- User sees order confirmation
- Order number displayed
- Confirmation email sent (mocked)
```

### Step 2: Create Test File

**File structure**: `tests/e2e/flows/[user-goal]-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Complete Purchase Flow', () => {
  test('new user can browse, signup, and purchase', async ({ page }) => {
    // Test implementation
  });

  test('returning user can login and purchase', async ({ page }) => {
    // Test implementation
  });

  test('user abandons cart and returns', async ({ page }) => {
    // Test implementation
  });
});
```

### Step 3: Write Happy Path Test

**Main success flow**:
```typescript
test('new user completes full purchase journey', async ({ page }) => {
  // 1. LANDING - Start on homepage
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  
  // 2. BROWSE - Navigate to products
  await page.getByRole('link', { name: 'Shop Now' }).click();
  await expect(page).toHaveURL('/products');
  
  // 3. SELECT - Click first product
  const firstProduct = page.getByTestId('product-card').first();
  await firstProduct.getByRole('link', { name: 'View Details' }).click();
  await expect(page).toHaveURL(/\/products\/.+/);
  
  // 4. REVIEW - Check product details
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByTestId('price')).toBeVisible();
  
  // 5. ADD - Add to cart
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  await expect(page.getByText('Added to cart')).toBeVisible();
  await expect(page.getByTestId('cart-count')).toHaveText('1');
  
  // 6. CHECKOUT - Navigate to checkout
  await page.getByTestId('cart-icon').click();
  await page.getByRole('link', { name: 'Checkout' }).click();
  await expect(page).toHaveURL('/checkout');
  
  // 7. AUTH - Sign up as new user
  await page.getByRole('link', { name: 'Create Account' }).click();
  await page.getByLabel('Email').fill('newuser@example.com');
  await page.getByLabel('Password').fill('SecurePass123!');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await expect(page).toHaveURL('/checkout');
  
  // 8. PAYMENT - Enter payment details
  await page.getByLabel('Card Number').fill('4242424242424242');
  await page.getByLabel('Expiry Date').fill('12/25');
  await page.getByLabel('CVV').fill('123');
  await page.getByLabel('Billing Address').fill('123 Main St');
  await page.getByLabel('City').fill('San Francisco');
  await page.getByLabel('ZIP Code').fill('94102');
  
  // 9. CONFIRM - Complete purchase
  await page.getByRole('button', { name: 'Complete Purchase' }).click();
  
  // 10. SUCCESS - Verify order confirmation
  await expect(page).toHaveURL('/order-confirmation');
  await expect(page.getByRole('heading', { name: 'Order Confirmed!' })).toBeVisible();
  await expect(page.getByTestId('order-number')).toBeVisible();
  await expect(page.getByText(/Your order will arrive/)).toBeVisible();
});
```

### Step 4: Add Alternative Paths

**Returning user flow**:
```typescript
test('returning user logs in and purchases', async ({ page }) => {
  // Setup: Create user in beforeEach or use fixture
  
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  await page.getByTestId('cart-icon').click();
  await page.getByRole('link', { name: 'Checkout' }).click();
  
  // Login instead of signup
  await page.getByLabel('Email').fill('existing@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  // Continue with checkout...
  await page.getByLabel('Card Number').fill('4242424242424242');
  // ... rest of payment flow
  
  await page.getByRole('button', { name: 'Complete Purchase' }).click();
  await expect(page).toHaveURL('/order-confirmation');
});
```

### Step 5: Test Failure Scenarios

**Payment failure**:
```typescript
test('user sees error when payment fails', async ({ page }) => {
  // Mock payment failure
  await page.route('**/api/process-payment', route => {
    route.fulfill({
      status: 400,
      body: JSON.stringify({ error: 'Card declined' })
    });
  });
  
  // Go through flow until payment
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  await page.getByTestId('cart-icon').click();
  await page.getByRole('link', { name: 'Checkout' }).click();
  
  // ... authentication ...
  
  await page.getByLabel('Card Number').fill('4000000000000002'); // Test card
  await page.getByRole('button', { name: 'Complete Purchase' }).click();
  
  // Assert error shown, user still on checkout
  await expect(page.getByText('Card declined')).toBeVisible();
  await expect(page).toHaveURL('/checkout');
});
```

### Step 6: Test Interruption & Recovery

**Cart abandonment**:
```typescript
test('user can abandon cart and return later', async ({ page, context }) => {
  // Add item to cart
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  
  // Navigate away (abandon)
  await page.goto('/');
  
  // Close and reopen browser (simulate return visit)
  await page.close();
  const newPage = await context.newPage();
  await newPage.goto('/');
  
  // Cart should persist
  await expect(newPage.getByTestId('cart-count')).toHaveText('1');
  
  // Can continue checkout
  await newPage.getByTestId('cart-icon').click();
  await expect(newPage.getByTestId('cart-item')).toBeVisible();
});
```

### Step 7: Add Cross-Device Tests

**Mobile flow**:
```typescript
test('mobile user completes purchase', async ({ page }) => {
  // Use mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('/');
  
  // Mobile navigation (hamburger menu)
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('link', { name: 'Shop' }).click();
  
  // Rest of flow adapted for mobile
  // (scrolling, touch interactions, etc.)
});
```

### Step 8: Performance & Timing

**Measure critical user journey**:
```typescript
test('purchase flow completes in reasonable time', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  await page.getByTestId('cart-icon').click();
  await page.getByRole('link', { name: 'Checkout' }).click();
  
  // ... complete checkout ...
  
  await page.getByRole('button', { name: 'Complete Purchase' }).click();
  await expect(page).toHaveURL('/order-confirmation');
  
  const duration = Date.now() - startTime;
  expect(duration).toBeLessThan(15000); // 15 seconds max
});
```

### Step 9: Document & Review

**Checklist**:
- [ ] Happy path tested (main success flow)
- [ ] Alternative paths tested (returning user, etc.)
- [ ] Failure scenarios covered (payment fails, network errors)
- [ ] Interruption recovery tested (cart abandonment)
- [ ] Cross-device tested (mobile, desktop)
- [ ] Performance reasonable
- [ ] All steps in user journey covered
- [ ] Clear assertions at each decision point

## Human Approval Gates

**MUST ASK before**:
1. Starting test (confirm user journey map)
2. Adding alternative paths (confirm which paths matter)
3. Performance thresholds (confirm acceptable timing)

**MUST SHOW after**:
1. Test file with test count
2. Test results (all passing)
3. Summary of journey coverage

## Output

**Summary format**:
```markdown
## User Flow Test: Complete Purchase Journey

**File**: `tests/e2e/flows/purchase-flow.spec.ts`

**Journey Steps Tested**: 10
1. ✅ Landing page
2. ✅ Browse products
3. ✅ Select product
4. ✅ Review details
5. ✅ Add to cart
6. ✅ Checkout
7. ✅ Authentication
8. ✅ Payment
9. ✅ Confirmation
10. ✅ Success

**Test Cases**: 6
- ✅ New user purchase (happy path)
- ✅ Returning user purchase
- ✅ Payment failure handling
- ✅ Cart abandonment recovery
- ✅ Mobile device flow
- ✅ Performance threshold

**Test Results**: ✅ 6/6 passed (avg 8.2s per test)

**Coverage**:
- Happy path: ✅
- Alternative paths: ✅ (2 variants)
- Failure scenarios: ✅
- Cross-device: ✅ (mobile)
- Performance: ✅ (< 15s)
```

## Success Criteria

- ✅ Complete user journey tested end-to-end
- ✅ All decision points covered
- ✅ Failure scenarios handled gracefully
- ✅ Tests read like user story
- ✅ All tests passing
- ✅ Performance acceptable

---

**Remember**: User flows test the entire experience. Think like a user trying to accomplish a goal, not a developer testing individual features.

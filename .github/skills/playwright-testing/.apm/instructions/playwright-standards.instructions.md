---
applyTo: "**/*.spec.ts,**/*.test.ts,**/e2e/**,**/tests/**"
description: Playwright testing standards and best practices
---

# Playwright Testing Standards

Apply professional E2E testing practices with Playwright.

## Core Principles

### I. Test Independence
Every test MUST run independently without relying on other tests' state.

**Why**: Parallel execution, debugging isolation, reliable CI/CD.

```typescript
// ✅ CORRECT - Each test sets up its own state
test('user can add item to cart', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  await expect(page.getByTestId('cart-count')).toHaveText('1');
});

test('user can remove item from cart', async ({ page }) => {
  // Setup own state, don't rely on previous test
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  
  await page.getByTestId('cart-icon').click();
  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByTestId('cart-count')).toHaveText('0');
});

// ❌ WRONG - Test depends on previous test's state
test('user can add item to cart', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
});

test('user can remove item from cart', async ({ page }) => {
  // Assumes cart already has item - will fail if run alone!
  await page.getByTestId('cart-icon').click();
  await page.getByRole('button', { name: 'Remove' }).click();
});
```

### II. Selector Hierarchy
Use selectors in this priority order:

1. **User-facing attributes** (best)
   - `getByRole()` - Accessibility-first
   - `getByLabel()` - Form fields
   - `getByPlaceholder()` - Input hints
   - `getByText()` - Visible content

2. **Test IDs** (good)
   - `getByTestId()` - Stable, explicit

3. **CSS/XPath** (last resort)
   - Brittle, breaks on styling changes

```typescript
// ✅ PRIORITY 1 - User-facing (best)
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Email').fill('user@example.com');
await page.getByPlaceholder('Search products...').fill('laptop');
await page.getByText('Welcome back!').isVisible();

// ✅ PRIORITY 2 - Test IDs (good)
await page.getByTestId('checkout-button').click();
await page.getByTestId('price-display').textContent();

// ❌ PRIORITY 3 - CSS/XPath (avoid)
await page.locator('.btn-primary').click(); // Breaks if class changes
await page.locator('//button[@id="submit"]').click(); // Fragile
```

### III. Wait for Conditions, Not Time
Never use arbitrary `page.waitForTimeout()`. Wait for explicit conditions.

```typescript
// ✅ CORRECT - Wait for condition
await page.getByRole('button', { name: 'Submit' }).click();
await expect(page.getByText('Success!')).toBeVisible();
await page.waitForURL('**/success');

// ✅ CORRECT - Wait for network
await page.route('**/api/submit', async route => {
  await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
});
await Promise.all([
  page.waitForResponse(resp => resp.url().includes('/api/submit')),
  page.getByRole('button', { name: 'Submit' }).click()
]);

// ❌ WRONG - Arbitrary timeout
await page.getByRole('button', { name: 'Submit' }).click();
await page.waitForTimeout(3000); // Flaky! May be too short or too long
```

### IV. Page Object Model (When Appropriate)
Use Page Object Model for complex, reused flows.

```typescript
// ✅ Page Object for complex login flow
class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
    await expect(this.page).toHaveURL('/dashboard');
  }

  async loginWithGoogle() {
    await this.page.getByRole('button', { name: 'Continue with Google' }).click();
    // Handle OAuth flow
  }
}

// Use in tests
test('login with credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  
  await expect(page.getByText('Welcome back!')).toBeVisible();
});

// ❌ WRONG - Over-engineering simple interactions
class ButtonPage {
  constructor(private page: Page) {}
  
  async clickButton() { // Too granular!
    await this.page.getByRole('button').click();
  }
}
```

### V. Assertions on Expected Behavior
Assert what users expect to see/experience.

```typescript
// ✅ CORRECT - User-centric assertions
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
await expect(page.getByTestId('user-balance')).toHaveText('$1,234.56');
await expect(page.getByRole('button', { name: 'Checkout' })).toBeEnabled();
await expect(page).toHaveURL('/checkout');

// ✅ CORRECT - Multiple related assertions
await expect(page.getByTestId('product-card')).toContainText('Laptop');
await expect(page.getByTestId('product-card')).toContainText('$999');
await expect(page.getByTestId('product-card')).toContainText('In Stock');

// ❌ WRONG - Implementation details
const button = page.getByRole('button', { name: 'Submit' });
expect(await button.getAttribute('class')).toContain('btn-primary'); // Who cares?
```

## Test Structure

### Arrange-Act-Assert Pattern

```typescript
test('user can update profile name', async ({ page }) => {
  // ARRANGE - Setup
  await page.goto('/profile');
  
  // ACT - Execute action
  await page.getByLabel('Name').fill('Jane Doe');
  await page.getByRole('button', { name: 'Save' }).click();
  
  // ASSERT - Verify outcome
  await expect(page.getByText('Profile updated successfully')).toBeVisible();
  await expect(page.getByLabel('Name')).toHaveValue('Jane Doe');
});
```

### File Organization

```
tests/
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── signup.spec.ts
│   │   └── password-reset.spec.ts
│   ├── checkout/
│   │   ├── cart.spec.ts
│   │   └── payment.spec.ts
│   └── fixtures/
│       └── test-users.ts
├── pages/           # Page Objects (if needed)
│   ├── login-page.ts
│   └── checkout-page.ts
└── playwright.config.ts
```

## Common Patterns

### Testing Forms

```typescript
test('submit contact form', async ({ page }) => {
  await page.goto('/contact');
  
  // Fill form
  await page.getByLabel('Name').fill('John Smith');
  await page.getByLabel('Email').fill('john@example.com');
  await page.getByLabel('Message').fill('Hello, I need help with...');
  
  // Submit
  await page.getByRole('button', { name: 'Send Message' }).click();
  
  // Verify success
  await expect(page.getByText('Message sent successfully!')).toBeVisible();
  
  // Verify form cleared
  await expect(page.getByLabel('Name')).toHaveValue('');
  await expect(page.getByLabel('Email')).toHaveValue('');
});
```

### Testing Authentication

```typescript
test.describe('protected routes', () => {
  test('redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('access dashboard when authenticated', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Navigate to protected route
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
```

### Testing API Responses

```typescript
test('display error on failed submission', async ({ page }) => {
  // Mock API failure
  await page.route('**/api/submit', async route => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Email already exists' })
    });
  });
  
  await page.goto('/signup');
  await page.getByLabel('Email').fill('existing@example.com');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  
  await expect(page.getByText('Email already exists')).toBeVisible();
});
```

### Testing Accessibility

```typescript
test('keyboard navigation works', async ({ page }) => {
  await page.goto('/products');
  
  // Tab to first product
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  
  // Enter to select
  await page.keyboard.press('Enter');
  
  await expect(page).toHaveURL(/\/products\/.+/);
});

test('screen reader accessible', async ({ page }) => {
  await page.goto('/checkout');
  
  // All interactive elements have labels
  await expect(page.getByLabel('Card Number')).toBeVisible();
  await expect(page.getByLabel('Expiry Date')).toBeVisible();
  await expect(page.getByLabel('CVV')).toBeVisible();
  
  // Buttons have accessible names
  await expect(page.getByRole('button', { name: 'Complete Purchase' })).toBeVisible();
});
```

## Configuration Best Practices

**playwright.config.ts**:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Anti-Patterns to Avoid

**🚫 Flaky Tests**:
```typescript
// ❌ Race conditions
await page.getByRole('button').click();
const text = await page.getByTestId('result').textContent(); // May not be ready!

// ✅ Wait for condition
await page.getByRole('button').click();
await expect(page.getByTestId('result')).toHaveText('Expected text');
```

**🚫 Hard-coded Waits**:
```typescript
// ❌ Arbitrary timeout
await page.waitForTimeout(5000);

// ✅ Explicit condition
await page.waitForLoadState('networkidle');
```

**🚫 Testing Implementation Details**:
```typescript
// ❌ Internal state
expect(await page.evaluate(() => window.myApp.state)).toBe('loaded');

// ✅ User-visible outcome
await expect(page.getByText('Content loaded')).toBeVisible();
```

---

**Remember**: Write tests from the user's perspective. If a user can't see or interact with it, don't test it.

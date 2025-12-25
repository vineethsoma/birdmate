# Testing Principles

Apply these fundamental testing principles to ensure reliable, maintainable test suites.

## Core Principles

### I. Test Isolation

**Every test MUST run independently without relying on other tests' state.**

**Why**: Parallel execution, debugging isolation, reliable CI/CD.

**Problem Pattern**:
```typescript
// ❌ Test depends on previous test's state
test('add item to cart', () => {
  cart.add(item);
});

test('remove item from cart', () => {
  cart.remove(item); // Assumes previous test ran!
});
```

**Correct Pattern**:
```typescript
describe('Cart', () => {
  beforeEach(() => {
    // Reset to known state BEFORE each test
    cart = new Cart();
  });

  test('add item to cart', () => {
    cart.add(item);
    expect(cart.items).toHaveLength(1);
  });

  test('remove item from cart', () => {
    // Setup own state
    cart.add(item);
    cart.remove(item);
    expect(cart.items).toHaveLength(0);
  });
});
```

**Shared Resource Management**:
- **Databases**: Use `beforeEach()` to reset/reseed data
- **File System**: Clean up temp files in `afterEach()`
- **Global State**: Reset singletons, clear caches
- **Network**: Mock external APIs, don't rely on real services

---

### II. Debug by Narrowing: Log at Each Pipeline Stage

**When debugging failing tests, add logs progressively to find exactly WHERE the problem occurs.**

**Strategy**:
```
Input → Stage 1 → Stage 2 → Stage 3 → Output
  ✓        ✓         ✓         ✗       (found it!)
```

**Example**:
```typescript
function processData(input) {
  console.log('1. Input:', input); // ✓
  const cleaned = cleanData(input);
  console.log('2. After clean:', cleaned); // ✓
  const validated = validate(cleaned);
  console.log('3. After validate:', validated); // ✗ Empty!
  return transform(validated);
}
```

**Anti-Pattern**: Only looking at final output and guessing where the problem is.

**Best Practice**: Remove debug logs after fixing, or use debug library with levels.

---

### III. Refactoring Safety

**Refactoring can introduce subtle behavioral changes. Follow these steps:**

**Safe Refactoring Process**:
1. **Run tests** - Establish green baseline
2. **Make ONE small change** - Extract method, rename variable, etc.
3. **Run tests** - Verify still green
4. **Commit** - Small, reversible change
5. **Repeat**

**Risk Areas**:
- Adding parameters with default values (may not match original behavior)
- Splitting functions (logic may get distributed incorrectly)
- Changing validation ranges or error conditions

**Example of Subtle Bug**:
```typescript
// Original
function search(query, limit) {
  return db.query(query).limit(limit);
}

// Refactored with new parameter
function search(query, limit, minScore = 0) {
  // Default minScore=0 might filter out valid results!
  return db.query(query).filter(r => r.score >= minScore).limit(limit);
}
```

**Mitigation**:
- Run full test suite after EACH refactoring step
- Add tests for edge cases BEFORE refactoring
- Commit after each successful refactor

---

### IV. Test Assertions Must Evolve With Code

**When you change production behavior, update test expectations to match.**

**Pattern**:
```typescript
// Production code changed from logging raw query to hash
logger.log({ 
  queryHash: hash(query),  // Changed for PII protection
  queryLength: query.length 
});

// Test must update
expect(logSpy).toHaveBeenCalledWith(
  expect.stringContaining('"queryHash"')  // Not "query"
);

// Add comment explaining WHY
// Changed to queryHash for PII protection (GDPR compliance)
```

**Common Changes Requiring Test Updates**:
- Log format changes (JSON structure, field names)
- Error message text
- Validation rules (stricter or looser)
- Default parameter values

**Best Practice**: Add comments in tests explaining WHY behavior changed, reference ticket/issue.

---

### V. Test Failures Reveal Deeper Issues

**Don't immediately change test assertions to make them pass. Ask "WHY did this test fail?"**

**Investigation Process**:
1. **Read the failure message carefully** - What was expected vs actual?
2. **Understand the test intent** - What behavior is it verifying?
3. **Trace the root cause** - Is it a test issue or production bug?
4. **Fix the right thing** - Change production code OR test, not both blindly

**Example from Real Session**:
```
Test failure: "expected 3 but got 2"

Investigation:
- Why 2 instead of 3?
- Debug logs show 3 items fetched from database
- But only 2 in final results
- One item has negative score, filtered by minScore=0
- Root cause: Wrong assumption about score range

Fix: Change minScore default from 0 to -1 (match cosine similarity range [-1,1])
```

**Anti-Pattern**:
```typescript
// ❌ Just make test pass without understanding
expect(results).toHaveLength(2); // Changed from 3
```

**Correct Approach**:
```typescript
// ✅ Fix root cause: minScore default was wrong
function search(query, minScore = -1) { // Was 0, now -1
  // Cosine similarity range is [-1, 1], not [0, 1]
}
```

---

## Test Organization Best Practices

### Arrange-Act-Assert (AAA) Pattern

```typescript
test('user can update profile', () => {
  // ARRANGE - Setup test data
  const user = createUser({ name: 'Old Name' });
  
  // ACT - Execute the operation
  user.updateProfile({ name: 'New Name' });
  
  // ASSERT - Verify the outcome
  expect(user.name).toBe('New Name');
});
```

### Test Naming Convention

**Pattern**: `test_<function>_<scenario>_<expected>`

```typescript
test('validateEmail_validFormat_returnsTrue');
test('validateEmail_missingAtSign_throwsError');
test('validateEmail_emptyString_throwsError');
```

### Group Related Tests

```typescript
describe('User Authentication', () => {
  describe('login', () => {
    test('valid credentials returns token');
    test('invalid password throws error');
    test('non-existent user throws error');
  });
  
  describe('logout', () => {
    test('clears session token');
    test('invalidates refresh token');
  });
});
```

---

## When to Apply These Principles

| Principle | Apply When |
|-----------|------------|
| Test Isolation | Writing any test with shared state (DB, files, globals) |
| Debug by Narrowing | Test failing and root cause unclear |
| Refactoring Safety | Extracting functions, changing signatures, cleaning code |
| Update Assertions | Production behavior changes (logs, errors, validation) |
| Investigate Failures | Any test failure - treat as learning opportunity |

---

**Remember**: Tests are documentation of how code should behave. When tests fail, they're teaching you something about your code or your assumptions.

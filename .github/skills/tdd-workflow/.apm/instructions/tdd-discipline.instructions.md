---
applyTo: "**"
description: Test-Driven Development workflow with TDD commit convention
---

# TDD Workflow Standards

Apply Test-Driven Development discipline to all code changes.

## TDD Commit Convention

**MANDATORY**: Use emoji pattern to mark TDD cycle phases in commit messages.

### Commit Message Format

- **🔴 Red Phase** - Failing test written
  - Emoji: 🔴 (`:red_circle:`)
  - Example: `git commit -m "🔴 Test: POST /api/users validates email format"`
  
- **🟢 Green Phase** - Implementation makes test pass
  - Emoji: 🟢 (`:green_circle:`)
  - Example: `git commit -m "🟢 Implement email validation in createUser"`
  
- **♻️ Refactor Phase** - Improve code quality without changing behavior
  - Emoji: ♻️ (`:recycle:`)
  - Example: `git commit -m "♻️ Extract email validation to utility function"`

### Why Use This Convention?

1. **Visibility**: Commit history shows TDD discipline at a glance
2. **Accountability**: Easy to verify test-first approach in code review
3. **Metrics**: Scripts can automatically count TDD compliance
4. **Culture**: Reinforces TDD mindset across team

### Example TDD Cycle

```bash
# Red: Write failing test
git add backend/tests/users.test.ts
git commit -m "🔴 Test: user cannot register with invalid email"

# Green: Make test pass
git add backend/src/api/users.ts
git commit -m "🟢 Add email format validation to createUser"

# Refactor: Improve implementation
git add backend/src/api/users.ts backend/src/utils/validation.ts
git commit -m "♻️ Extract validation logic to shared utility"
```

### Enforcement

Scripts validate TDD discipline by counting emoji commits:
```bash
RED_COMMITS=$(git log --grep="🔴" origin/main..feat-branch | wc -l)
GREEN_COMMITS=$(git log --grep="🟢" origin/main..feat-branch | wc -l)

# Valid TDD: RED > 0 AND GREEN > 0
```

### Anti-Pattern Detection

**🚫 Test-Last Development** (detectable):
```bash
git log --oneline
# abc123 ✅ Implement user registration  ← No 🔴 first!
# def456 ✅ Add tests for registration   ← Test after impl
```

**✅ Proper TDD** (verifiable):
```bash
git log --oneline
# abc123 🔴 Test: user registration validates email
# def456 🟢 Implement email validation
# ghi789 ♻️ Refactor validation to utility
```

## Core TDD Cycle: Red → Green → Refactor

**RED**: Write a failing test
- Test describes desired behavior
- Test fails because feature doesn't exist yet
- Verify test actually fails (confirms test is valid)

**GREEN**: Write minimal code to pass
- Implement simplest solution that makes test pass
- No extra features
- Focus on making the test green

**REFACTOR**: Improve code quality
- Clean up implementation
- Remove duplication
- Improve naming and structure
- **All tests must still pass**

## TDD Mandate

**NEVER write production code without a failing test first**

This applies to:
- ✅ New features
- ✅ Bug fixes
- ✅ Refactoring that changes behavior
- ⚠️ Exception: Pure refactoring (behavior unchanged) with existing test coverage

## File Safety Protocol

**Before modifying existing files**:
1. **Check test coverage**: Does the file have tests?
2. **Run existing tests**: Establish baseline (all green)
3. **Create backup**: Copy file to `filename.backup` if making risky changes
4. **Make changes incrementally**: Small steps with test verification
5. **Remove backup**: Only after all tests pass

**Never**:
- ❌ Modify files without understanding test coverage
- ❌ Delete or comment out tests to make code pass
- ❌ Leave commented-out code in production
- ❌ Skip running tests "to save time"

## Test Quality Standards

**Test Naming**: `test_<function>_<scenario>_<expected>`
```python
test_validateEmail_invalidFormat_throwsError
test_calculateTotal_withDiscount_returnsReducedPrice
test_fetchUser_userNotFound_returns404
```

**Test Structure**: Arrange-Act-Assert
```python
def test_addToCart_validItem_increasesCartCount():
    # Arrange: Set up test data
    cart = ShoppingCart()
    item = Product(id=1, name="Widget", price=9.99)
    
    # Act: Execute the operation
    cart.add(item)
    
    # Assert: Verify the outcome
    assert cart.item_count == 1
    assert cart.total == 9.99
```

**Test Independence**:
- Each test runs in isolation
- No shared mutable state
- Use fixtures or setup/teardown for test data
- Tests can run in any order

**Test Coverage**:
- Minimum 80% code coverage
- 100% coverage for critical paths (payment, auth, data loss prevention)
- Test both happy path and edge cases

## Development Workflow

1. **Understand the requirement**
   - Ask clarifying questions
   - Confirm expected behavior
   - Identify edge cases

2. **Write the test (RED)**
   ```python
   def test_processPayment_insufficientFunds_throwsPaymentError():
       account = Account(balance=10.00)
       payment = Payment(amount=50.00)
       
       with pytest.raises(PaymentError, match="Insufficient funds"):
           process_payment(account, payment)
   ```
   - Run test: ❌ Fails (function doesn't exist)

3. **Implement minimal code (GREEN)**
   ```python
   def process_payment(account, payment):
       if account.balance < payment.amount:
           raise PaymentError("Insufficient funds")
       account.balance -= payment.amount
   ```
   - Run test: ✅ Passes

4. **Refactor (maintain GREEN)**
   - Improve code quality
   - Extract functions
   - Improve naming
   - Run tests after each refactor: ✅ All pass

5. **Commit**
   - Commit test + implementation together
   - Clear commit message explaining what was added

## Error Handling in Tests

**Test error conditions explicitly**:
```python
def test_connectToDatabase_invalidHost_throwsConnectionError():
    with pytest.raises(ConnectionError, match="Cannot reach host"):
        connect_to_database(host="invalid")

def test_parseJSON_malformedInput_throwsJSONError():
    with pytest.raises(json.JSONDecodeError):
        parse_json("{invalid json")
```

## Integration vs Unit Tests

**Unit Tests** (majority):
- Test one function/method in isolation
- Mock external dependencies (databases, APIs, file system)
- Fast execution (< 100ms each)

**Integration Tests** (fewer):
- Test multiple components together
- Use real dependencies (test database, test API)
- Slower execution (< 5 seconds each)

**Test Pyramid**:
```
     /\
    /  \  E2E (few, slow, expensive)
   /____\
  /      \ Integration (some, moderate)
 /________\
/__________\ Unit (many, fast, cheap)
```

## Code Review Checklist

Before marking code complete:
- ✅ All tests pass
- ✅ No commented-out code
- ✅ Test coverage meets minimum (80%)
- ✅ Tests follow naming convention
- ✅ Tests use Arrange-Act-Assert pattern
- ✅ Edge cases covered
- ✅ Error handling tested
- ✅ No skipped or disabled tests without justification

## When Test-First Doesn't Apply

**Exploratory/Spike Code**:
- Prototyping new library
- Proof of concept
- Research spike

**Process**: Mark as spike, delete after learning, rewrite with TDD

**Legacy Code Without Tests**:
- Add characterization tests first
- Test current behavior (even if buggy)
- Then refactor with safety net

---

**Remember**: "Red → Green → Refactor" is not optional. It's how we guarantee code quality and prevent regressions.

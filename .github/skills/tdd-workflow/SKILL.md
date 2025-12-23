---
description: Test-Driven Development workflow with file safety protocols and development
  best practices
metadata:
  apm_commit: unknown
  apm_installed_at: '2025-12-23T18:13:08.893686'
  apm_package: vineethsoma/agent-packages/skills/tdd-workflow
  apm_version: 1.0.0
name: tdd-workflow
---

# TDD Workflow

Complete Test-Driven Development workflow with safety protocols for production-ready code.

---

## Core Mandate

- **NEVER write code without tests** (TDD approach: Red → Green → Refactor)
- **NEVER leave commented-out code** in production
- **ALWAYS handle errors gracefully** with recovery strategies
- **MUST create backups** before modifying existing files
- **MUST write self-documenting code** with clear intent

---

## Development Workflow

1. **Ask clarifying questions** about requirements
2. **Create step-by-step** implementation plan
3. **Write failing tests first** (TDD)
4. **Implement minimal code** to pass tests
5. **Refactor** for code quality
6. **Verify all tests pass**
7. **Security validation**: Check for vulnerabilities
8. **Final assessment**: Verify production-ready quality
9. **Document** any breaking changes with verification steps

---

## File Safety Protocol

Before modifying ANY existing file:

1. **Create timestamped backup**
2. **Verify backup integrity**
3. **Apply modifications atomically**
4. **Verify write success**
5. **Provide rollback capability** on failure

---

## The TDD Cycle

### Red Phase
- Write a test that describes expected behavior
- Run the test - it MUST fail
- Failure proves the test is valid

### Green Phase
- Write minimal code to pass the test
- Don't optimize or refactor yet
- Code can be ugly - just make it work

### Refactor Phase
- Improve code quality while keeping tests green
- Apply one refactoring at a time
- Run tests after each change
- Commit after each successful refactoring

---

## Test Writing Guidelines

### Naming Tests
Use descriptive names that explain what is tested:
```
test_calculate_discount_returns_zero_for_new_customers
test_validate_email_rejects_missing_at_symbol
test_process_order_throws_when_inventory_insufficient
```

### Arrange-Act-Assert Pattern
```
# Arrange - Set up test data and conditions
user = create_test_user(discount_tier="gold")
cart = create_cart_with_items([item1, item2])

# Act - Execute the code being tested
discount = calculate_discount(user, cart)

# Assert - Verify the expected outcome
assert discount == expected_discount
```

### Test Coverage Requirements
- **Minimum 80%** code coverage for new code
- **100%** coverage for critical paths (auth, payments, data mutations)
- Test all three scenarios:
  - ✅ Happy path (normal operation)
  - ❌ Error scenarios (expected failures)
  - 🔄 Edge cases (boundary conditions)

---

## When NOT to Write Tests First

There are limited exceptions:
- **Exploratory spikes** - throwaway code to learn
- **Prototype UI** - visual experiments (delete before production)

Even in these cases, write tests before shipping to production.

---

## Decision-Making Framework

When facing architectural choices:

1. **Understand the Trade-offs**: Explain pros and cons of different approaches
2. **Consider Scalability**: Will this approach scale with growth?
3. **Plan for Maintainability**: Can future developers understand and maintain this?
4. **Prioritize Production-Ready**: Deliver solutions that are battle-tested and reliable
5. **Follow Best Practices**: Apply industry-standard patterns and conventions

---

## Success Indicators

You've successfully contributed when:

- ✅ Features work end-to-end without issues
- ✅ Code is maintainable and well-documented
- ✅ Performance meets or exceeds requirements
- ✅ Security standards are enforced
- ✅ All tests pass with adequate coverage
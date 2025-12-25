---
description: Run CLAUDE framework code quality audit
tools: ['read', 'search', 'usages']
---

# Run CLAUDE Audit

Systematically audit code quality against CLAUDE framework standards.

## Context Gathering

1. **Read audit checklist**:
   - Read: `specs/{feature}/stories/{story-id}/checklists/claude-audit.md`
   - Identify sections to audit

2. **Identify files changed in story**:
   ```bash
   git diff --name-only origin/main..feat-us{number}
   ```

3. **Read changed files**:
   - Focus on production code (not tests, configs)
   - Read full file context, not just diffs

## Audit Steps

### C: Code Quality

**Check for**:
- [ ] Single Responsibility Principle (one function, one purpose)
- [ ] DRY (no duplicated code)
- [ ] KISS (simple solutions, not clever)
- [ ] Function length (≤ 20 lines)
- [ ] Composition over inheritance

**Review each function**:
1. Does it do ONE thing?
2. Is there duplicated logic?
3. Is it unnecessarily complex?
4. Is it longer than 20 lines? (split if yes)

**Example violations**:
```typescript
// ❌ Violation: Multiple responsibilities
function processUserAndSendEmail(user: User) {
  validateUser(user); // Responsibility 1
  saveToDatabase(user); // Responsibility 2
  sendWelcomeEmail(user); // Responsibility 3
}

// ✅ Correct: Single responsibility
function processUser(user: User) {
  validateUser(user);
  return saveToDatabase(user);
}
```

### N: Naming Conventions

**Check for**:
- [ ] Descriptive names (explain intent without comments)
- [ ] Functions as verbs (`fetchUser`, `validateInput`)
- [ ] Variables as nouns (`userAccount`, `totalPrice`)
- [ ] Boolean prefixes (`is`, `has`, `can`, `should`)
- [ ] Constants in UPPER_SNAKE_CASE
- [ ] No abbreviations

**Review naming**:
```typescript
// ❌ Vague: calc(x, y)
// ✅ Clear: calculateSalesTax(subtotal, taxRate)

// ❌ Abbreviation: usr, cfg
// ✅ Full words: user, configuration

// ❌ Boolean: active, valid
// ✅ Boolean: isActive, isValid
```

### E: Error Handling

**Check for**:
- [ ] Fail fast (validate inputs immediately)
- [ ] Descriptive error messages (what, why, what to do)
- [ ] Error recovery strategies
- [ ] No swallowed errors (empty catch blocks)
- [ ] Custom error types for domain errors

**Review error handling**:
```typescript
// ❌ Vague error
throw new Error("Invalid");

// ✅ Descriptive error
throw new ValidationError(
  "Email format invalid: must contain '@' symbol. Received: " + email
);
```

### S: Security

**Check for**:
- [ ] Input validation (sanitize external input)
- [ ] No hardcoded credentials
- [ ] Principle of least privilege
- [ ] Secure dependencies (no known vulnerabilities)
- [ ] Encryption for sensitive data

**Security review**:
```typescript
// ❌ SQL injection risk
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Parameterized query
const query = "SELECT * FROM users WHERE email = $1";
await db.query(query, [email]);
```

### T: Testing

**Check for**:
- [ ] Minimum 80% coverage
- [ ] Test pyramid (many unit, some integration, few E2E)
- [ ] Test naming (`test_function_scenario_expected`)
- [ ] Arrange-Act-Assert structure
- [ ] Test isolation (independent tests)

**Review tests**:
- Are critical paths 100% covered?
- Do tests test behavior, not implementation?
- Are edge cases covered?

### D: Database

**Check for**:
- [ ] Parameterized queries (no SQL injection)
- [ ] Transactions for multi-step operations
- [ ] Indexes on frequently queried columns
- [ ] Connection pooling
- [ ] Migration strategy (version control)

### L: Logging

**Check for**:
- [ ] Structured logging (JSON format)
- [ ] Appropriate log levels (DEBUG, INFO, WARN, ERROR, FATAL)
- [ ] Log context (request ID, user ID, operation)
- [ ] No sensitive data logged (passwords, tokens, PII)

## Audit Report

After reviewing all sections, update checklist:

```markdown
## Code Quality (C)

- [x] Single Responsibility: All functions focused
- [x] DRY: No duplication found
- [ ] Function length: 2 functions exceed 20 lines
  - `processOrder` (35 lines) - NEEDS REFACTORING
  - `validateInput` (25 lines) - SPLIT INTO SMALLER FUNCTIONS

## Naming Conventions (N)

- [x] Descriptive names throughout
- [x] Functions as verbs
- [ ] Boolean prefixes: `active` should be `isActive`

## Audit Score: 85% (23/27 items checked)
```

## Validation

After audit complete:
```bash
./scripts/validate-claude-audit.sh <story-id>
```

If score < 80%:
- Address violations
- Update code
- Re-run audit
- Update checklist

If score ≥ 80%:
- Document any accepted exceptions in checklist
- Ready for merge

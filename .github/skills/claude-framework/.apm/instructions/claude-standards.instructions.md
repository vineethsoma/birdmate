---
applyTo: "**"
description: CLAUDE Framework production coding standards
---

# CLAUDE Framework Coding Standards

Apply these production-ready standards to all code.

## Code Quality (C)

**C-1: Single Responsibility Principle**
- Each function/class does ONE thing
- If a function has "and" in its description, split it

**C-2: DRY (Don't Repeat Yourself)**
- Extract duplicated code into reusable functions
- Create shared utilities for common operations

**C-3: KISS (Keep It Simple)**
- Prefer simple solutions over clever ones
- Avoid premature optimization

**C-4: Function Length**
- Maximum 20 lines per function
- If longer, split into smaller, named functions

**C-5: Composition Over Inheritance**
- Prefer composition and interfaces
- Use inheritance sparingly

## Naming Conventions (N)

**N-1: Descriptive Names**
- Names must explain intent without comments
- `calculateUserTotalPurchases()` not `calc()`

**N-2: Functions as Verbs**
- `fetchUser()`, `validateInput()`, `processPayment()`

**N-3: Variables as Nouns**
- `userAccount`, `totalPrice`, `activeConnection`

**N-4: Boolean Prefixes**
- Use `is`, `has`, `can`, `should`
- `isValid`, `hasPermission`, `canEdit`, `shouldRetry`

**N-5: Constants**
- UPPER_SNAKE_CASE for constants
- `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`

**N-6: No Abbreviations**
- `user` not `usr`, `configuration` not `cfg`

## Error Handling (E)

**E-1: Fail Fast**
- Validate inputs immediately
- Throw errors for invalid states

**E-2: Descriptive Error Messages**
- Include context: what failed, why, what to do
- `"Failed to connect to database 'users_db' at localhost:5432. Check network connectivity."`

**E-3: Error Recovery**
- Provide fallback strategies
- Implement retry logic where appropriate

**E-4: Never Swallow Errors**
- Always log or propagate errors
- No empty catch blocks

**E-5: Use Custom Error Types**
- Create domain-specific error classes
- `ValidationError`, `DatabaseConnectionError`

## Security (S)

**S-1: Input Validation**
- Validate and sanitize all external input
- Use allow-lists, not deny-lists

**S-2: Secrets Management**
- Never hardcode credentials
- Use environment variables or secret managers

**S-3: Principle of Least Privilege**
- Grant minimum necessary permissions
- Apply to users, services, and API keys

**S-4: Secure Dependencies**
- Regularly update dependencies
- Scan for known vulnerabilities

**S-5: Encryption**
- Encrypt sensitive data at rest and in transit
- Use TLS/HTTPS for all network communication

## Testing (T)

**T-1: Test Coverage**
- Minimum 80% code coverage
- 100% coverage for critical paths

**T-2: Test Pyramid**
- Many unit tests
- Some integration tests
- Few end-to-end tests

**T-3: Test Naming**
- `test_<function>_<scenario>_<expected>`
- `test_validateEmail_invalidFormat_throwsError`

**T-4: Arrange-Act-Assert**
- Setup (arrange)
- Execute (act)
- Verify (assert)

**T-5: Isolation**
- Tests must be independent
- No shared mutable state

## Database (D)

**D-1: Parameterized Queries**
- Always use parameterized queries (prevent SQL injection)
- Never concatenate user input into SQL

**D-2: Transactions**
- Use transactions for multi-step operations
- Ensure ACID properties

**D-3: Indexing**
- Index frequently queried columns
- Monitor query performance

**D-4: Connection Pooling**
- Reuse database connections
- Configure appropriate pool size

**D-5: Migration Strategy**
- Version all schema changes
- Test migrations on staging first

## Logging (L)

**L-1: Structured Logging**
- Use JSON format for log parsing
- Include timestamp, level, message, context

**L-2: Log Levels**
- DEBUG: Detailed diagnostic information
- INFO: General informational messages
- WARN: Potentially harmful situations
- ERROR: Error events that might still allow the application to continue
- FATAL: Severe errors that cause termination

**L-3: Log Context**
- Include request ID, user ID, operation
- Enable distributed tracing

**L-4: Performance**
- Log async when possible
- Avoid logging in tight loops

**L-5: Sensitive Data**
- Never log passwords, tokens, or PII
- Redact sensitive information

## Enforcement

When reviewing code, cite specific CLAUDE rules:
- ❌ "This function is too complex"
- ✅ "Violates C-4: function exceeds 20 lines. Extract lines 15-25 into `validateUserPermissions()`"

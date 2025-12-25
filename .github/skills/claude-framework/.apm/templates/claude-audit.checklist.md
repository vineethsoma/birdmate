# CLAUDE Framework Audit Checklist

> Code quality review based on CLAUDE Framework standards

## Pre-Audit Setup

- **Story/Feature**: [US-XXX / Feature Name]
- **Files to Review**: [List of files or directories]
- **Auditor**: [code-quality-auditor agent]
- **Date**: YYYY-MM-DD

## Audit Categories

### C - Code Quality

| Check | Status | Issues | Files Affected |
|-------|--------|--------|----------------|
| Single Responsibility Principle | ⏳ | 0 | |
| DRY (No duplicated code) | ⏳ | 0 | |
| KISS (Simple solutions) | ⏳ | 0 | |
| Function length (≤20 lines) | ⏳ | 0 | |
| Composition over inheritance | ⏳ | 0 | |

### L - Logging

| Check | Status | Issues | Files Affected |
|-------|--------|--------|----------------|
| Structured logging (JSON format) | ⏳ | 0 | |
| Appropriate log levels | ⏳ | 0 | |
| Request context included | ⏳ | 0 | |
| No PII in logs | ⏳ | 0 | |
| Async logging where possible | ⏳ | 0 | |

### A - API/Architecture

| Check | Status | Issues | Files Affected |
|-------|--------|--------|----------------|
| RESTful conventions | ⏳ | 0 | |
| Proper HTTP status codes | ⏳ | 0 | |
| Consistent error format | ⏳ | 0 | |
| API versioning | ⏳ | 0 | |
| Clear separation of concerns | ⏳ | 0 | |

### U - User Input

| Check | Status | Issues | Files Affected |
|-------|--------|--------|----------------|
| Input validation (all endpoints) | ⏳ | 0 | |
| Input sanitization | ⏳ | 0 | |
| Query parameterization (SQL) | ⏳ | 0 | |
| Max length enforcement | ⏳ | 0 | |
| Type coercion handled | ⏳ | 0 | |

### D - Dependencies & Data

| Check | Status | Issues | Files Affected |
|-------|--------|--------|----------------|
| No hardcoded secrets | ⏳ | 0 | |
| Environment variables for config | ⏳ | 0 | |
| Dependencies up to date | ⏳ | 0 | |
| No known vulnerabilities | ⏳ | 0 | |
| Database transactions used | ⏳ | 0 | |

### E - Error Handling

| Check | Status | Issues | Files Affected |
|-------|--------|--------|----------------|
| Fail fast (early validation) | ⏳ | 0 | |
| Descriptive error messages | ⏳ | 0 | |
| No swallowed errors | ⏳ | 0 | |
| Custom error types | ⏳ | 0 | |
| Error recovery strategies | ⏳ | 0 | |

## Issue Severity Definitions

| Severity | Description | Action Required |
|----------|-------------|-----------------|
| 🔴 **Critical** | Security vulnerability, data loss risk | Must fix before merge |
| 🟠 **High** | Significant quality issue, potential bugs | Should fix before merge |
| 🟡 **Medium** | Code quality concern, maintainability | Fix in this sprint |
| 🟢 **Low** | Minor improvement, style suggestion | Nice to have |

## Findings

### Critical Issues (Must Fix)

| # | Category | File:Line | Description | Fix |
|---|----------|-----------|-------------|-----|
| 1 | | | | |

### High Priority (Should Fix)

| # | Category | File:Line | Description | Fix |
|---|----------|-----------|-------------|-----|
| 1 | | | | |

### Medium Priority (Fix This Sprint)

| # | Category | File:Line | Description | Fix |
|---|----------|-----------|-------------|-----|
| 1 | | | | |

### Low Priority (Suggestions)

| # | Category | File:Line | Description | Suggestion |
|---|----------|-----------|-------------|------------|
| 1 | | | | |

## Audit Summary

| Category | Checks | Passed | Failed | Score |
|----------|--------|--------|--------|-------|
| C - Code Quality | 5 | | | /5 |
| L - Logging | 5 | | | /5 |
| A - API/Architecture | 5 | | | /5 |
| U - User Input | 5 | | | /5 |
| D - Dependencies | 5 | | | /5 |
| E - Error Handling | 5 | | | /5 |
| **Total** | 30 | | | /30 |

### Overall Grade

| Score | Grade | Merge Decision |
|-------|-------|----------------|
| 27-30 | A | ✅ Approved |
| 24-26 | B | ✅ Approved with notes |
| 21-23 | C | ⚠️ Conditional - fix high priority |
| 18-20 | D | ❌ Requires fixes |
| <18 | F | ❌ Major rework needed |

**Final Grade**: [X] ([Score]/30)
**Merge Decision**: ✅ Approved / ⚠️ Conditional / ❌ Blocked

## Post-Audit Actions

- [ ] All critical issues fixed
- [ ] All high priority issues fixed
- [ ] Tests added for fixes
- [ ] Re-audit passed

---

**Audit Completed**: YYYY-MM-DD
**Reviewed By**: [auditor]

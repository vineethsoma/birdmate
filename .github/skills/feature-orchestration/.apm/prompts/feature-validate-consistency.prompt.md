---
description: Validate cross-story consistency for API contracts, types, schemas, and naming
tags: [feature, validation, consistency, integration]
---

# Validate Cross-Story Consistency

Check that parallel stories maintain consistency in shared contracts, types, schemas, and conventions.

## Instructions

You are validating that multiple stories in parallel development stay aligned and compatible.

### Step 1: Identify Active Stories

List all stories currently in progress (🔄 status in context):

```markdown
## Active Stories for Consistency Check

- **US-001**: [Title] - Branch: feat-us1 - Agent: [Name]
- **US-002**: [Title] - Branch: feat-us2 - Agent: [Name]
- **US-003**: [Title] - Branch: feat-us3 - Agent: [Name]

**Worktrees**:
- worktrees/feat-us1/
- worktrees/feat-us2/
- worktrees/feat-us3/
```

### Step 2: Check API Contract Consistency

**If feature has API contracts:**

Compare API definitions across stories:

```bash
# Check OpenAPI specs
diff worktrees/feat-us1/contracts/api.openapi.yml \
     worktrees/feat-us2/contracts/api.openapi.yml

# Look for endpoint conflicts
grep -r "path:" worktrees/feat-us*/contracts/*.yml
```

**Validation Checklist**:
- ✅ No duplicate endpoint paths
- ✅ Compatible request/response schemas
- ✅ Consistent naming conventions (camelCase, snake_case)
- ✅ Aligned error codes and formats
- ✅ Compatible versioning

**Report Format**:
```markdown
### API Contract Consistency

**Status**: ✅ Aligned | ⚠️ Minor Issues | ❌ Conflicts

**Findings**:
1. **Endpoint Alignment**:
   - US-001: POST /api/users
   - US-002: GET /api/users/:id
   - ✅ No conflicts

2. **Schema Compatibility**:
   - User type in US-001: { id, email, name }
   - User type referenced in US-002: { id, email, name, avatar }
   - ⚠️ US-002 adds `avatar` field - ensure backward compatibility

3. **Error Format**:
   - ✅ Both use { error: { code, message, field } }
```

### Step 3: Check Type Consistency

**If using TypeScript/typed languages:**

Compare shared types across stories:

```bash
# Find type definitions
grep -r "interface User" worktrees/feat-us*/src/types/
grep -r "type User" worktrees/feat-us*/src/types/

# Check for conflicts
diff worktrees/feat-us1/src/types/shared.ts \
     worktrees/feat-us2/src/types/shared.ts
```

**Validation Checklist**:
- ✅ Shared types have consistent definitions
- ✅ No conflicting field types
- ✅ Consistent use of optional vs required fields
- ✅ Aligned enum values
- ✅ Compatible with API schemas

**Report Format**:
```markdown
### Type System Consistency

**Status**: ✅ Aligned | ⚠️ Minor Issues | ❌ Conflicts

**Findings**:
1. **User Type**:
   - US-001: interface User { id: string; email: string; }
   - US-002: type User = { id: string; email: string; name: string; }
   - ❌ CONFLICT: US-002 adds required `name` field - breaks US-001

2. **Recommendations**:
   - Make `name` optional in US-002: `name?: string`
   - OR update US-001 to include `name` field
   - Coordinate with both agents
```

### Step 4: Check Database Schema Consistency

**If stories touch database:**

Compare migrations and schema changes:

```bash
# List migrations in each story
ls -la worktrees/feat-us*/database/migrations/

# Check for conflicting migrations
grep -r "CREATE TABLE" worktrees/feat-us*/database/migrations/
grep -r "ALTER TABLE" worktrees/feat-us*/database/migrations/
```

**Validation Checklist**:
- ✅ No conflicting table names
- ✅ No conflicting column additions to same table
- ✅ Compatible foreign key constraints
- ✅ Migration timestamps don't overlap
- ✅ Schema changes backward compatible

**Report Format**:
```markdown
### Database Schema Consistency

**Status**: ✅ Aligned | ⚠️ Minor Issues | ❌ Conflicts

**Findings**:
1. **Table Definitions**:
   - US-001: CREATE TABLE users (id, email, created_at)
   - US-002: CREATE TABLE user_profiles (user_id, name, avatar)
   - ✅ No conflicts - separate tables

2. **Migration Order**:
   - US-001: 001_create_users.sql
   - US-002: 002_create_user_profiles.sql (references users.id)
   - ✅ US-002 correctly depends on US-001
   - ⚠️ Must merge US-001 before US-002
```

### Step 5: Check Naming Consistency

**Compare naming conventions across stories:**

```bash
# Function naming
grep -r "function.*User" worktrees/feat-us*/src/

# Variable naming
grep -r "const.*user" worktrees/feat-us*/src/

# File naming
find worktrees/feat-us*/src -name "*user*"
```

**Validation Checklist**:
- ✅ Consistent casing (camelCase, PascalCase, snake_case)
- ✅ Consistent terminology (User vs UserAccount vs Account)
- ✅ Consistent file organization
- ✅ Consistent function naming patterns

**Report Format**:
```markdown
### Naming Convention Consistency

**Status**: ✅ Aligned | ⚠️ Minor Issues | ❌ Conflicts

**Findings**:
1. **Entity Naming**:
   - US-001: Uses "User" consistently
   - US-002: Uses "UserAccount" in some places
   - ⚠️ Standardize on "User"

2. **Function Naming**:
   - US-001: createUser, updateUser, deleteUser
   - US-002: getUserProfile, setUserProfile
   - ✅ Consistent verb-noun pattern
```

### Step 6: Generate Consistency Report

```markdown
# Cross-Story Consistency Report

**Feature**: [Feature Name]
**Date**: [Timestamp]
**Stories Validated**: [List]

## Overall Status

[Choose one:]
- ✅ **PASS**: All stories aligned, no conflicts
- ⚠️ **CAUTION**: Minor inconsistencies, coordinate before merge
- ❌ **BLOCKED**: Critical conflicts, must resolve before merge

## Detailed Findings

### API Contracts
[From Step 2]

### Type System
[From Step 3]

### Database Schema
[From Step 4]

### Naming Conventions
[From Step 5]

## Actions Required

### Critical (Block Merge)
1. [Issue with specific stories and fix]

### Important (Coordinate)
1. [Issue requiring agent collaboration]

### Minor (Nice to Have)
1. [Suggestion for improvement]

## Merge Order Recommendation

Based on dependencies:
1. Merge US-001 first (no dependencies)
2. Merge US-002 after US-001 (depends on user API)
3. Merge US-003 last (depends on both)

## Next Steps

1. [Immediate action]
2. [Coordination needed]
3. [Schedule next validation]
```

## Validation Frequency

**Regular Validation**: Daily when WIP > 1
**Triggered Validation**:
- Before any story merge
- After major contract changes
- When new story starts (check compatibility)

## Automated Checks

Run these commands as part of validation:

```bash
# TypeScript type checking
cd worktrees/feat-us1 && npm run type-check
cd worktrees/feat-us2 && npm run type-check

# Linting consistency
cd worktrees/feat-us1 && npm run lint
cd worktrees/feat-us2 && npm run lint

# OpenAPI validation
npm run validate-openapi

# Database migration dry-run
psql -f database/migrations/*.sql --dry-run
```

---

**Remember**: Early detection of inconsistency prevents merge conflicts and rework.

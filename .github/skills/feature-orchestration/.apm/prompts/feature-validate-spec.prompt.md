---
description: Verify implementation completeness against feature specification
tags: [feature, validation, spec, acceptance-criteria]
---

# Validate Against Feature Specification

Verify that the implemented feature matches the requirements defined in the feature specification.

## Instructions

You are validating implementation completeness against the original feature spec before marking the feature as complete.

### Step 1: Load Feature Specification

Read: `specs/{feature-id}/spec.md`

Extract key sections:
- **Goals**: What the feature aims to achieve
- **Requirements**: Functional and non-functional requirements
- **Acceptance Criteria**: Specific, testable conditions
- **Constraints**: Technical or business limitations
- **Out of Scope**: What the feature explicitly does NOT do

### Step 2: Load Implementation Artifacts

Identify what was implemented:

```bash
# List all merged commits for this feature
git log --grep="US-" --oneline

# List files changed
git diff main...origin/main --name-only | grep -E "spec-{feature-id}"

# Check story completions
cat specs/{feature-id}/tasks.md
```

### Step 3: Validate Against Requirements

For each requirement in spec.md, verify implementation:

```markdown
## Requirements Validation

### Functional Requirements

**FR-1: Natural language bird search**
- Spec Requirement: "Users can search for birds using plain English descriptions"
- Implementation: `src/search/nlp-search.ts`
- Status: ✅ IMPLEMENTED
- Evidence: 
  - File exists: src/search/nlp-search.ts
  - Tests exist: tests/search/nlp-search.test.ts
  - Tests pass: 15/15 passing
  - Acceptance criteria met: Can search "red chest grey back" → returns results

**FR-2: Taxonomy accuracy**
- Spec Requirement: "All bird records reference eBird taxonomy"
- Implementation: `src/data/taxonomy.ts`
- Status: ⚠️ PARTIAL
- Evidence:
  - Taxonomy loader implemented
  - ⚠️ Missing: Synonym cross-referencing (mentioned in spec)
  - Action: Create follow-up story for synonym support

**FR-3: Search results ranking**
- Spec Requirement: "Results ranked by relevance score"
- Implementation: `src/search/ranking.ts`
- Status: ✅ IMPLEMENTED
- Evidence:
  - Ranking algorithm implemented
  - Tests show correct ordering
  - Confidence scores displayed
```

### Step 4: Validate Acceptance Criteria

Check each acceptance criterion from spec.md:

```markdown
## Acceptance Criteria Validation

From spec.md:

**AC-1**: User can enter natural language query in search box
- ✅ PASS: Search component accepts free-text input
- Evidence: frontend/src/components/SearchBox.tsx

**AC-2**: Search returns top 10 matching birds
- ✅ PASS: API returns array of 10 results
- Evidence: backend/src/api/search.ts + tests

**AC-3**: Results include bird name, image, and confidence score
- ✅ PASS: Response schema includes all fields
- Evidence: contracts/api.openapi.yml + integration tests

**AC-4**: Search completes within 2 seconds
- ⚠️ NEEDS TESTING: Performance tests not run yet
- Action: Run load tests before marking feature complete

**AC-5**: Handles ambiguous queries with suggestions
- ❌ NOT IMPLEMENTED: Suggestion feature missing
- Spec says: "When query is ambiguous, show clarification options"
- Reality: Returns best match only
- Action: BLOCKING - must implement or remove from spec
```

### Step 5: Check Constitution Compliance

Read: `specs/.specify/memory/constitution.md`

Verify implementation follows project principles:

```markdown
## Constitution Compliance

**Principle I: Natural Language First**
- ✅ COMPLIANT: Search accepts plain English, no syntax required
- Evidence: All test cases use natural descriptions

**Principle II: Accurate Bird Taxonomy**
- ✅ COMPLIANT: Using eBird taxonomy as authoritative source
- Evidence: taxonomy.ts imports from eBird JSON

**Principle III: Test-First & Field-Validated**
- ⚠️ PARTIAL: TDD followed, but field validation missing
- Evidence: 
  - Tests exist (85% coverage)
  - ⚠️ No real-world query testing yet
  - Action: Get feedback from 3 birdwatchers before launch

**Principle IV: Observability & Audit Trail**
- ✅ COMPLIANT: All searches logged with structured data
- Evidence: logging.ts captures query, results, timestamp

**Principle V: API First**
- ✅ COMPLIANT: RESTful API implemented, UI consumes it
- Evidence: OpenAPI spec complete, API tested independently
```

### Step 6: Identify Gaps

List discrepancies between spec and implementation:

```markdown
## Specification Gaps

### Critical Gaps (Block Launch)
1. **AC-5: Ambiguous query suggestions**
   - Spec: Required acceptance criterion
   - Reality: Not implemented
   - Impact: Users may get wrong results without clarification
   - Action: Implement or update spec (remove requirement)

### Important Gaps (Launch with Plan)
1. **FR-2: Synonym cross-referencing**
   - Spec: Mentioned in requirements
   - Reality: Partially implemented
   - Impact: Users may miss birds when using regional names
   - Action: Add to backlog for v1.1

### Minor Gaps (Nice to Have)
1. **Performance testing**
   - Spec: Search within 2 seconds
   - Reality: Assumed but not validated
   - Impact: May have performance issues at scale
   - Action: Run load tests before production
```

### Step 7: Generate Validation Report

```markdown
# Feature Specification Validation Report

**Feature**: [Feature Name]
**Feature ID**: [ID]
**Validation Date**: [Timestamp]
**Validator**: Feature Lead

## Executive Summary

[Choose one:]
- ✅ **READY FOR LAUNCH**: All requirements met, spec complete
- ⚠️ **READY WITH NOTES**: Core requirements met, minor gaps documented
- ❌ **NOT READY**: Critical gaps exist, must address before launch

**Completion**: [X/Y] requirements implemented ([Z%])

## Detailed Validation

### Functional Requirements
[From Step 3]

### Acceptance Criteria
[From Step 4]

### Constitution Compliance
[From Step 5]

## Gaps Analysis

### Critical (Must Fix)
[Blocking issues]

### Important (Plan to Address)
[Significant but not blocking]

### Minor (Backlog)
[Nice to have features]

## Recommendations

### Before Launch
1. [Action item 1]
2. [Action item 2]

### Post-Launch (v1.1)
1. [Backlog item 1]
2. [Backlog item 2]

### Specification Updates Needed
1. [Update spec to match reality OR implement missing piece]

## Sign-Off

- [ ] All critical gaps addressed
- [ ] Constitution compliance verified
- [ ] Acceptance criteria met or exceptions documented
- [ ] Feature Lead approval
- [ ] Ready for production deployment

**Approved By**: [Name]
**Date**: [Date]
```

## Validation Checklist

Before approving feature:

- ✅ All functional requirements implemented or exceptions documented
- ✅ All acceptance criteria met or justified as not needed
- ✅ Constitution principles followed
- ✅ Tests passing (unit + integration)
- ✅ Performance validated
- ✅ Security reviewed
- ✅ Documentation complete
- ✅ No critical bugs
- ✅ Stakeholder approval

## When to Run This Validation

- **Before feature launch**: Full validation required
- **After all stories merged**: Comprehensive check
- **Before stakeholder demo**: Ensure completeness
- **When spec unclear**: Verify interpretation correct

---

**Remember**: The spec is the contract. Implementation must match or spec must be updated.

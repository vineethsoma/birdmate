---
name: Clarify Specification
description: Add clarifications to existing feature spec to resolve ambiguities
temperature: 0.5
---

# Clarify Specification

You are a specification clarifier helping to resolve ambiguities in an existing feature specification.

## Process

### Step 1: Load Specification
Read the target specification file from `specs/{feature-id}/spec.md`.

### Step 2: Identify Ambiguities
Look for:
- Vague requirements ("should be fast", "user-friendly")
- Missing technical details (specific versions, thresholds)
- Undefined terms or acronyms
- Unclear success metrics
- Ambiguous user stories

### Step 3: Ask Clarifying Questions
For each ambiguity found, ask the user:
- What specific threshold/metric defines this requirement?
- What edge cases should be handled?
- What is the priority: must-have vs nice-to-have?

### Step 4: Document Clarifications
Add a `## Clarifications` section to the spec:

```markdown
## Clarifications

### Clarification 1: {Topic}
**Original**: {Vague statement}
**Clarified**: {Specific statement}
**Rationale**: {Why this matters}
**Date**: {date}

### Clarification 2: {Topic}
...
```

## Examples of Good Clarifications

### Before (Vague)
> "The search should be fast."

### After (Clarified)
> **Original**: "The search should be fast."
> **Clarified**: Search response time < 3 seconds (95th percentile) for 10-100 concurrent users.
> **Rationale**: Sub-3s response aligns with user patience threshold research; 95th percentile ensures consistency.
> **Date**: 2025-12-23

### Before (Ambiguous)
> "Support many bird species."

### After (Clarified)
> **Original**: "Support many bird species."
> **Clarified**: 500-1000 North American bird species for MVP, with manual quarterly taxonomy updates.
> **Rationale**: North America scope limits data complexity; quarterly updates align with eBird taxonomy release cycle.
> **Date**: 2025-12-23

## Clarification Categories

### 1. Performance Clarifications
- Response times (p50, p95, p99)
- Throughput (requests per second)
- Concurrency limits

### 2. Data Clarifications
- Exact data sources (with versions)
- Data volume expectations
- Update frequency

### 3. Behavior Clarifications
- Edge case handling
- Error conditions
- Fallback strategies

### 4. Scope Clarifications
- MVP vs future features
- Platform support (browsers, devices)
- Geographic/language support

## Output

Update `specs/{feature-id}/spec.md` by adding the `## Clarifications` section with all resolved ambiguities.

Then notify user:
> Added {N} clarifications to spec. Ready to generate implementation plan? Run `/speckit.plan`.

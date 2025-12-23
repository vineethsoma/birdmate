---
applyTo: "**"
description: Spec-first development standards - always specify before implementing
---

# Spec-First Development Instructions

## Core Rule: No Implementation Without Specification

**MANDATORY**: Before writing any code, create or update the specification.

### When to Create Specs

- ✅ **New features**: Always start with `/speckit.specify`
- ✅ **Bug fixes affecting behavior**: Document expected vs actual in spec
- ✅ **Architecture changes**: Update constitution first
- ✅ **API changes**: Update contracts in `specs/{feature}/contracts/`
- ❌ **Trivial refactors**: No spec needed for code style/formatting only

### Spec Lifecycle

```
1. Constitution     → Define principles (once per project)
2. Feature Spec     → What to build and why
3. Plan             → Technical approach and structure
4. Tasks            → Breakdown into user stories
5. Implementation   → Build according to spec
6. Validation       → Verify against acceptance criteria
```

### Validation Checklist

Before marking any task complete:
- [ ] Spec exists in `specs/{feature-id}/spec.md`
- [ ] Acceptance criteria clearly defined
- [ ] Implementation matches spec requirements
- [ ] All spec clarifications addressed
- [ ] Constitution principles upheld

### Spec File Structure

```
specs/
└── {feature-id}/
    ├── spec.md              # Main specification
    ├── plan.md              # Implementation plan
    ├── tasks.md             # Task breakdown
    ├── contracts/           # API contracts
    │   └── api.openapi.yml
    └── checklists/          # Quality gates
        └── requirements.md
```

## Spec Commands Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/speckit.constitution` | Define project principles | Start of project |
| `/speckit.specify` | Create feature spec | New feature request |
| `/speckit.clarify` | Add clarifications to spec | Ambiguous requirements |
| `/speckit.plan` | Generate implementation plan | After spec approval |
| `/speckit.tasks` | Break down into stories | Ready to implement |

## Common Anti-Patterns

❌ **Writing code first, spec later**: Leads to post-hoc documentation
❌ **Skipping clarifications**: Results in implementation drift
❌ **Generic acceptance criteria**: Makes validation impossible
❌ **No constitution review**: Violates project principles

## Integration with TDD

Spec-driven and test-driven development work together:

1. **Spec defines WHAT** (functional requirements, acceptance criteria)
2. **Tests define HOW WELL** (quality, edge cases, performance)
3. **Implementation satisfies BOTH**

Write tests based on spec acceptance criteria, then implement to pass tests.

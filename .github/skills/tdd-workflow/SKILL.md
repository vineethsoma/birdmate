---
description: Test-Driven Development workflow with TDD commit convention, compliance
  tracking, and validation
metadata:
  apm_commit: unknown
  apm_installed_at: '2025-12-25T23:03:47.258080'
  apm_package: vineethsoma/agent-packages/skills/tdd-workflow
  apm_version: 1.3.0
name: tdd-workflow
type: skill
version: 1.1.0
---

# TDD Workflow

Apply Test-Driven Development discipline with Red → Green → Refactor cycle, TDD commit convention, and compliance tracking.

## What This Skill Provides

- **TDD compliance checklist**: Track TDD discipline throughout story
- **TDD commit convention**: 🔴🟢♻️ emoji pattern for Red → Green → Refactor
- **Metrics gathering**: Collect coverage, test counts, commit patterns
- **Validation**: Verify TDD compliance before merge
- **AI-guided verification**: Review TDD discipline and test quality

## When to Use

- Starting story implementation (initialize checklist)
- Throughout development (track TDD discipline)
- Before merge (validate compliance)
- In code review (verify test-first approach)

## Quick Start

### 1. Initialize TDD Checklist

\`\`\`bash
# From project root
./scripts/init-tdd-checklist.sh us-001
\`\`\`

Creates:
\`\`\`
specs/{feature}/stories/us-001/checklists/
└── tdd-compliance.md  ← Track TDD discipline
\`\`\`

### 2. Follow TDD Commit Convention

**Red → Green → Refactor Cycle**:

\`\`\`bash
# 🔴 RED: Write failing test
git add backend/tests/users.test.ts
git commit -m "🔴 Test: POST /api/users validates email format"

# �� GREEN: Implement to pass
git add backend/src/api/users.ts
git commit -m "🟢 Implement email validation in createUser"

# ♻️ REFACTOR: Improve code quality
git add backend/src/api/users.ts backend/src/utils/validation.ts
git commit -m "♻️ Extract email validation to reusable utility"
\`\`\`

**Emoji Guide**:
- 🔴 \`:red_circle:\` - Failing test (Red phase)
- 🟢 \`:green_circle:\` - Passing implementation (Green phase)
- ♻️ \`:recycle:\` - Refactoring (Refactor phase)

### 3. Gather TDD Metrics

\`\`\`bash
./scripts/gather-tdd-metrics.sh us-001
\`\`\`

Collects:
- TDD commit counts (🔴🟢♻️)
- Test coverage (backend, frontend)
- Test-to-code ratio
- Test file counts

### 4. Validate Before Merge

\`\`\`bash
./scripts/validate-tdd-compliance.sh us-001
\`\`\`

Checks:
- [ ] All checklist items completed
- [ ] Coverage ≥ 80%
- [ ] TDD commit pattern detected (🔴→🟢)
- [ ] No skipped or commented tests

Exit code 0 = passed, 1 = failed.

## TDD Commit Convention Details

See [TDD discipline instructions](../.apm/instructions/tdd-discipline.instructions.md) for full details on commit convention enforcement.

## Integration with Other Skills

- **Task-delegation**: TDD compliance tracked per delegation
- **Feature-orchestration**: TDD checklist in story checklists/ directory
- **Retrospective-workflow**: TDD metrics included in retro
- **CLAUDE-framework**: TDD is part of coding standards

## Scripts

- \`init-tdd-checklist.sh <story-id>\` - Initialize TDD compliance checklist
- \`gather-tdd-metrics.sh <story-id>\` - Collect TDD metrics
- \`validate-tdd-compliance.sh <story-id>\` - Verify compliance (exit 0/1)

## Prompts

- \`verify-tdd-compliance\` - AI-guided TDD verification workflow

## Templates

- \`tdd-compliance.checklist.md\` - TDD discipline tracking
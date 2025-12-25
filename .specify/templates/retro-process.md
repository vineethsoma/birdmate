# Story Retrospective Process

> Standard process for capturing learnings after each story

## 📅 When to Run Retro

**Trigger**: After story merges to main
**Duration**: 30-60 minutes
**Facilitator**: Retro Specialist
**Participants**: All contributing agents (via structured input)

## 🎭 Roles in Retro Process

| Role | Responsibility |
|------|----------------|
| **Retro Specialist** | Facilitates retro, gathers input, synthesizes improvements |
| **Contributing Agents** | Provide structured input (TDD, Fullstack, Playwright, Auditor) |
| **Agent Package Manager** | Implements approved improvements into agents/skills |
| **Feature Lead** | Provides story context, validates improvements |

## 🔄 Retro Workflow

### Step 1: Gather Metrics (Feature Lead)

Collect from story tracker and git history:

```bash
# Test counts
cd backend && npm test 2>&1 | grep "Tests:"
cd frontend && npm test 2>&1 | grep "Tests:"

# Coverage
cd backend && npm test -- --coverage 2>&1 | grep "All files"

# TDD discipline (commit prefixes)
git log --oneline --grep="🔴\|🟢\|♻️" | wc -l

# Story duration
git log --format="%ci" feat-{story}..main | head -1
git log --format="%ci" --reverse feat-{story} | head -1
```

### Step 2: Gather Input from Each Role

**Each agent provides structured YAML input**:

```yaml
# .retro/us-xxx-{agent}.yml
story: US-XXX
agent: [tdd-specialist | fullstack-engineer | playwright-specialist | code-quality-auditor]
successes:
  - "Description of what went well"
improvements:
  - category: process | domain | technical | tools
    issue: "What was the problem"
    suggestion: "Specific actionable fix"
    priority: high | medium | low
violations:
  - "Any process violations with commit reference"
friction_points:
  - "What slowed you down"
```

| Role | Key Questions |
|------|---------------|
| TDD Specialist | Violations? Coverage gaps? Hard-to-test code? |
| Fullstack Engineer | Delegation clarity? Domain gaps? Handoff quality? |
| Playwright Specialist | E2E coverage? Flaky tests? Integration issues? |
| Code Quality Auditor | CLAUDE issues? Patterns to watch? |

### Step 3: Consolidate Learnings (Feature Lead)

Categorize into:

| Category | Examples | Action |
|----------|----------|--------|
| **Process** | Late audits, unclear delegations | Update templates |
| **Domain** | Cosine similarity range | Create/update skills |
| **Technical** | Test isolation patterns | Update instructions |
| **Tools** | Missing test factories | Create boilerplate |

### Step 4: Create Action Items

For each learning, determine:

1. **Scope**: This story only, or all future stories?
2. **Owner**: Who implements the improvement?
3. **Target**: Which artifact/skill/template to update?
4. **Timeline**: Before next story, this sprint, backlog?

### Step 5: Handoff to Agent Package Manager

**Create structured handoff for implementation**:

```yaml
# .delegation/retro-handoff-us-xxx.yml
story_id: US-XXX
retro_date: YYYY-MM-DD
facilitator: retro-specialist

changes:
  - type: skill | instruction | agent | prompt | template
    target: path/to/primitive.md
    action: create | update | deprecate
    rationale: "Why this change based on retro learning"
    priority: high | medium | low
    content_diff: |
      # Specific text to add/modify
      ## New Section
      - New guideline 1
      - New guideline 2
    validation: "How to verify this works"

  - type: skill
    target: skills/vector-search/SKILL.md
    action: update
    rationale: "Cosine similarity range learning from US-001"
    priority: high
    content_diff: |
      ## Critical: Cosine Similarity Range
      - Range is [-1, 1], NOT [0, 1]
      - Use >= 0.75 for relevance threshold
    validation: "Review in next search feature implementation"

tracking:
  log_file: .memory/retro-log.md
  version_bumps_required: true
```

**Agent Package Manager receives handoff and**:
1. Reviews each change request
2. Implements changes to primitives
3. Bumps versions in affected skills/agents
4. Updates `.memory/retro-log.md`
5. Commits with message: `chore(retro): Implement US-XXX learnings`

### Step 6: Close Retro

- Archive retro document in `specs/{feature}/retro-{story}.md`
- Create GitHub issues for tracked action items
- Update story tracker with "Retro Complete" status

---

## 📝 Retro Document Template

```markdown
# Story Retrospective: [US-XXX] [Title]

**Date**: YYYY-MM-DD
**Participants**: Feature Lead, Fullstack Engineer, TDD Specialist, [others]
**Duration**: X days
**Merge Commit**: [hash]

## 📊 Metrics Summary

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Backend Tests | X | - | ✅ |
| Frontend Tests | X | - | ✅ |
| E2E Tests | X | - | ✅ |
| Backend Coverage | X% | 80% | ✅/⚠️ |
| Frontend Coverage | X% | 70% | ✅/⚠️ |
| TDD Violations | X | 0 | ✅/⚠️ |
| CLAUDE Audit Score | X/30 | 21+ | ✅/⚠️ |
| Story Duration | X days | - | - |

## 👥 Role-Specific Feedback

### TDD Specialist Report
- **TDD Cycles**: X red-green-refactor sequences
- **Violations**: [None / List with justifications]
- **Test Debt**: [Skipped tests, missing coverage]
- **Key Learning**: [Domain or process insight]

### Fullstack Engineer Report
- **Delegation Clarity**: [1-5 rating] - [Comments]
- **Domain Context**: [1-5 rating] - [Gaps encountered]
- **Handoff Quality**: [1-5 rating] - [Issues]
- **Key Learning**: [Domain or process insight]

### Playwright Specialist Report
- **E2E Coverage**: X scenarios / X acceptance criteria
- **Flaky Tests**: [None / List with fixes]
- **Integration Issues**: [None / List]
- **Key Learning**: [Domain or process insight]

### Code Quality Auditor Report
- **Audit Score**: X/30 (Grade: [A-F])
- **Critical Issues**: X (all fixed before merge)
- **Patterns Observed**: [Common issues]
- **Key Learning**: [Quality pattern to watch]

## ✅ What Went Well

1. [Specific success with evidence]
2. [Specific success with evidence]
3. [Specific success with evidence]

## ⚠️ What Could Be Improved

1. [Issue] → [Root cause] → [Proposed fix]
2. [Issue] → [Root cause] → [Proposed fix]
3. [Issue] → [Root cause] → [Proposed fix]

## 🎓 Key Learnings

### Process Learnings
| Learning | Impact | Action |
|----------|--------|--------|
| [Learning] | [How it affected story] | [Improvement] |

### Domain Learnings
| Learning | Skill to Update | Priority |
|----------|-----------------|----------|
| [Learning] | [Skill name] | High/Med/Low |

### Technical Learnings
| Learning | Pattern/Anti-pattern | Documentation |
|----------|---------------------|----------------|
| [Learning] | [What to do/avoid] | [Where to document] |

## 📋 Action Items

### Immediate (Before Next Story)
- [ ] [Action] → Owner: [Role] → Target: [Artifact]

### This Sprint
- [ ] [Action] → Owner: [Role] → Target: [Artifact]

### Backlog
- [ ] [Action] → Owner: [Role] → Target: [Artifact]

## 🔄 Process Improvements Implemented

| Improvement | Template/Artifact Updated | Commit |
|-------------|---------------------------|--------|
| [Improvement] | [File path] | [hash] |

---

**Retro Completed**: YYYY-MM-DD
**Next Story**: [US-XXX]
**Action Items Tracked**: [GitHub Issue #X]
```

---

## 🎯 Retro Quality Checklist

Before closing a retro, verify:

- [ ] All contributing agents provided input
- [ ] Metrics collected and documented
- [ ] At least 3 "went well" items identified
- [ ] At least 3 "improve" items with root causes
- [ ] All learnings categorized (process/domain/technical)
- [ ] Action items have owners and targets
- [ ] Immediate action items scheduled before next story
- [ ] Templates/skills updated per learnings
- [ ] Retro document archived in `specs/{feature}/`

---

## 📊 Retro Metrics Over Time

Track across stories to see improvement:

| Story | Duration | Tests | Coverage | TDD Violations | CLAUDE Score | Action Items |
|-------|----------|-------|----------|----------------|--------------|--------------|
| US-001 | 2 days | 272 | 80% | 2 minor | 26/30 | 8 |
| US-002 | - | - | - | - | - | - |
| US-003 | - | - | - | - | - | - |

**Trend Indicators**:
- ⬆️ Improving
- ➡️ Stable  
- ⬇️ Declining (investigate)

---

**Version**: 1.0.0
**Created**: 2025-12-25
**Based on**: US-001 retrospective + specialist feedback

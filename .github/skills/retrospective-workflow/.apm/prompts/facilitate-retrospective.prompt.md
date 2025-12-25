---
description: Facilitate post-story retrospective with structured feedback gathering and handoff generation
globs: ["**/*.md", "**/*.yml"]
---

# Facilitate Retrospective

You are facilitating a post-story retrospective as the **Retro Specialist**.

## Context

Story ID: [Provide story ID, e.g., us-001]

The retrospective document has been initialized at:
`specs/{feature}/stories/{story-id}/retro/retro.md`

Metrics have been gathered by running `./gather-retro-metrics.sh`

## Your Tasks

### 1. Review Story Artifacts

Read these files to understand what happened:
- Story tracker: `specs/{feature}/stories/{story-id}/story-tracker.md`
- Delegation briefs: `specs/{feature}/stories/{story-id}/delegation/*.md`
- Completion reports: `specs/{feature}/stories/{story-id}/delegation/completion-reports/*.md`
- Checklists: `specs/{feature}/stories/{story-id}/checklists/*.md`

### 2. Gather YAML Input from Contributors

Request structured feedback from each agent using this format:

```yaml
agent: [agent-name]
story: [story-id]

successes:
  - category: [Testing | Architecture | Tooling | Workflow]
    what: "[Specific success]"
    impact: "[Why this mattered]"
    
improvements:
  - category: [Testing | Architecture | Tooling | Workflow | Templates]
    what: "[What could be better]"
    why: "[Root cause or pain point]"
    suggestion: "[Proposed improvement]"
    scope: [this-story | all-stories]
    priority: [high | medium | low]
```

### 3. Consolidate Learnings

Synthesize feedback into the retro document:

**🎉 Successes**: What worked well (celebrate and reinforce)
- Group by category (Testing, Architecture, Tooling, Workflow)
- Be specific with examples

**🔄 Improvements**: What needs improvement (actionable items)
- Prioritize: High / Medium / Low
- Include root cause analysis
- Specify scope (this story vs all stories)

### 4. Create Action Items

For each improvement, determine:
- **Owner**: Which agent implements? (Agent Package Manager for primitives, Feature Lead for process)
- **Target**: Which primitive/template to update?
- **Timeline**: Before next story, this sprint, backlog?

### 5. Generate Handoff Spec

Update `specs/{feature}/stories/{story-id}/retro/handoff.yml` with changes for Agent Package Manager:

```yaml
story_id: [story-id]
retro_date: [date]
facilitator: retro-specialist

changes:
  - type: [instruction | skill | agent | prompt | template]
    target: [path/to/primitive.md]
    action: [create | update | deprecate]
    rationale: "[Why this change based on retro learning]"
    priority: [high | medium | low]
    content_diff: |
      [Specific text to add/modify]
    validation: "[How to verify this works]"

tracking:
  log_file: .memory/retro-log.md
  version_bumps_required: true
  dependent_projects:
    - birdmate
```

## Validation

Before completing, run:
```bash
./scripts/validate-retro.sh {story-id}
```

Ensure:
- ✅ All sections filled (no [Fill] placeholders)
- ✅ Action items have specific owners
- ✅ Handoff YAML is valid
- ✅ Changes include version bump guidance

## Handoff

Once validated, hand off to Agent Package Manager:
/handoff agent-package-manager "Implement process improvements from {story-id} retrospective"

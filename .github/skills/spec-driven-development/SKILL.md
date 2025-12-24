---
description: Spec-Driven Development workflow using GitHub spec-kit for building high-quality
  software with structured specifications and intent-driven development
metadata:
  apm_commit: unknown
  apm_installed_at: '2025-12-24T17:03:56.296347'
  apm_package: vineethsoma/agent-packages/skills/spec-driven-development
  apm_version: 1.1.0
name: spec-driven-development
---

# Spec-Driven Development (SDD)

A structured methodology for building production-ready software by defining specifications before implementation. Based on [GitHub spec-kit](https://github.com/github/spec-kit).

> **📦 Prerequisites**: This skill requires [specify CLI](https://github.com/github/spec-kit) installed in your project. Run `specify init` to set up spec-kit prompts and agents in your repository.

> **⚡ Dynamic Prompts**: The `/speckit.*` commands are provided by the specify CLI at runtime, not by this APM skill package. They become available automatically when spec-kit is initialized in your project.

---

## Core Philosophy

**Specifications drive implementation, not the other way around.**

- **Intent-driven development**: Define the "what" and "why" before the "how"
- **Multi-step refinement**: Break down complex features through progressive elaboration
- **Executable specifications**: Specs directly generate working implementations
- **Technology independence**: Process works across any tech stack, language, or framework

---

## The Spec-Driven Workflow

### Phase 1: Constitution (Project Principles)

Establish non-negotiable principles that govern all development decisions.

**Command**: `/speckit.constitution`

**What to define**:
- Core principles (e.g., "Natural language first", "Test-first & field-validated")
- Architecture & tech stack choices
- Development workflow standards
- Code review checklists
- Governance & amendment process

**Example Constitution Elements**:
```markdown
### Core Principle: API First
Ship as web application with RESTful API backend. API endpoints 
designed for composability. Dependencies kept minimal.

**Rationale**: Simplicity enables rapid iteration; API-first design 
ensures accessibility for future integrations.
```

**Best Practices**:
- Limit to 3-7 core principles (more = dilution of focus)
- Include rationale for each principle
- Define clear violation consequences
- Version the constitution (semantic versioning)
- Require formal approval for amendments

---

### Phase 2: Specification (Requirements)

Define WHAT you want to build without prescribing HOW to build it.

**Command**: `/speckit.specify`

**Focus on**:
- User scenarios and workflows
- Functional requirements
- Acceptance criteria
- Constraints and non-functional requirements
- Edge cases and failure modes

**Example Spec**:
```markdown
Build an application that helps users organize photos in albums.
- Albums are grouped by date and can be reorganized via drag-and-drop
- Albums are never nested inside other albums
- Within each album, photos display in a tile-like interface
- Users can add photos from local storage
- Photos remain on device (no cloud upload)
```

**Avoid**:
- Technical implementation details
- Framework/library choices
- Architecture decisions
- Database schema

**Optional: Clarification Phase**

**Command**: `/speckit.clarify`

Run this after specification to identify underspecified areas:
- Ambiguous requirements
- Missing edge cases
- Unstated assumptions
- Conflicting constraints

---

### Phase 3: Planning (Technical Design)

Translate the specification into a technical implementation plan with concrete technology choices.

**Command**: `/speckit.plan`

**What to include**:
- Technology stack (frameworks, libraries, databases)
- Architecture patterns (MVC, microservices, serverless)
- Data models and schemas
- API contracts (endpoints, request/response formats)
- Security considerations
- Performance targets
- Testing strategy

**Example Plan**:
```markdown
## Tech Stack
- Frontend: Vite + React + TypeScript
- State: React Context API (no external library)
- Storage: IndexedDB for metadata, File API for images
- Build: Vite with TypeScript strict mode
- Testing: Vitest for unit/integration tests

## Architecture
- Single-page application (SPA)
- Component hierarchy: App → AlbumList → Album → PhotoGrid → Photo
- Local-first: All data persists in browser storage
- No backend required for MVP

## Data Model
Album {
  id: string (UUID)
  name: string
  createdAt: Date
  photos: Photo[]
}

Photo {
  id: string (UUID)
  file: File
  albumId: string
  addedAt: Date
}
```

**Best Practices**:
- Reference constitution principles in design decisions
- Document trade-offs explicitly
- Include migration strategies for data/API changes
- Specify testing approach aligned with TDD workflow

---

### Phase 4: Task Breakdown

**Command**: `/speckit.tasks`

Generate an actionable, ordered list of implementation tasks.

**Task Structure**:
```markdown
1. Setup project scaffolding
   - Initialize Vite + React + TypeScript
   - Configure Vitest for testing
   - Setup ESLint/Prettier

2. Implement Album data model
   - Create Album and Photo TypeScript interfaces
   - Implement IndexedDB storage layer
   - Write unit tests for CRUD operations

3. Build AlbumList component
   - Render list of albums with creation dates
   - Implement drag-and-drop reordering (react-beautiful-dnd)
   - Write component tests with Vitest + Testing Library
```

**Task Characteristics**:
- Each task is independently testable
- Tasks ordered by dependency
- Include verification criteria
- Reference constitution compliance

**Optional: Analysis Phase**

**Command**: `/speckit.analyze`

Run before implementation to validate:
- Cross-artifact consistency (spec ↔ plan ↔ tasks)
- Coverage completeness (all spec requirements have tasks)
- Constitution alignment (no violations introduced)
- Missing test tasks

**Optional: Quality Checklists**

**Command**: `/speckit.checklist`

Generate custom validation checklists:
```markdown
## Requirements Completeness Checklist
- [ ] All user scenarios from spec have corresponding tasks
- [ ] Error handling defined for each user action
- [ ] Accessibility requirements specified (WCAG 2.1 Level AA)
- [ ] Performance targets quantified (page load < 2s)
- [ ] Security review completed (no XSS/CSRF vulnerabilities)
```

---

### Phase 5: Implementation

**Command**: `/speckit.implement`

Execute all tasks to build the feature according to the plan.

**Implementation Protocol**:
1. **Work task-by-task** (no skipping or reordering without approval)
2. **TDD for each task**: Write tests → Run (fail) → Implement → Pass → Refactor
3. **Constitution compliance**: Verify against principles after each task
4. **Progressive commits**: Commit after each completed task
5. **Audit trail**: Log decisions, trade-offs, and deviations

**During Implementation**:
- Reference constitution when making design choices
- Update spec/plan if requirements change (version changes)
- Run `/speckit.analyze` if you deviate from plan
- Document technical debt explicitly

**Implementation Patterns**:

**Feature Flags for Experimentation**:
```typescript
// Enable parallel implementation exploration
const USE_OPTIMISTIC_UI = featureFlags.optimisticUI;

if (USE_OPTIMISTIC_UI) {
  // Immediate UI update, background sync
} else {
  // Wait for server confirmation
}
```

**Constitution-Driven Error Handling**:
```typescript
// Constitution Principle: "Graceful degradation"
try {
  await syncToCloud();
} catch (error) {
  logger.warn('Cloud sync failed, using local-only mode', error);
  localStorage.setItem('offline-mode', 'true');
  // Continue operation, don't block user
}
```

---

## Spec-Driven Development vs. Traditional Approaches

| Aspect | Traditional Development | Spec-Driven Development |
|--------|------------------------|-------------------------|
| **Starting Point** | Write code immediately | Write specification first |
| **Refinement** | Refactor code | Refine spec → regenerate |
| **Documentation** | Written after (if at all) | Specification IS documentation |
| **Changes** | Modify code directly | Update spec, re-implement |
| **Testing** | Tests written after code | Tests derived from spec |
| **AI Role** | Code completion | Spec interpretation + code generation |

---

## Advanced Workflows

### Greenfield Development (0-to-1)

Starting from scratch with no existing codebase.

**Workflow**:
1. `/speckit.constitution` → Define project principles
2. `/speckit.specify` → Describe user scenarios
3. `/speckit.clarify` → Resolve ambiguities
4. `/speckit.plan` → Choose tech stack
5. `/speckit.analyze` → Validate consistency
6. `/speckit.tasks` → Break down work
7. `/speckit.implement` → Build feature

**Best Practices**:
- Start with minimal viable constitution (3-5 principles)
- Keep initial spec focused on core user journey
- Plan for iteration (avoid over-engineering)

---

### Brownfield Enhancement (Iterative)

Adding features to existing projects.

**Workflow**:
1. **Review existing constitution** (or create if missing)
2. `/speckit.specify` → Define new feature requirements
3. `/speckit.plan` → Integrate with existing architecture
4. `/speckit.tasks` → Account for migration/compatibility
5. `/speckit.implement` → Execute incrementally

**Considerations**:
- Constitution amendments may be needed
- Plan must address backward compatibility
- Tasks include data migration steps
- Integration tests verify no regressions

---

### Parallel Exploration

Exploring multiple implementation approaches simultaneously.

**Use Cases**:
- Evaluating different tech stacks (React vs. Vue)
- Testing UX patterns (card layout vs. list)
- Performance optimization experiments

**Workflow**:
1. Create **single specification** (same requirements)
2. Create **multiple plans** with different approaches:
   - `plan-react.md` (React + Vite)
   - `plan-vue.md` (Vue + Vite)
   - `plan-vanilla.md` (No framework)
3. Generate **separate task lists** for each plan
4. Implement in **parallel branches** (`impl-react`, `impl-vue`, `impl-vanilla`)
5. **Compare** implementations against constitution metrics
6. **Select winner** based on objective criteria

---

## Integration with TDD Workflow

Spec-Driven Development complements TDD perfectly:

| SDD Phase | TDD Integration |
|-----------|-----------------|
| **Constitution** | Defines test coverage requirements |
| **Specification** | Provides acceptance criteria for tests |
| **Planning** | Specifies testing strategy (unit/integration/e2e) |
| **Tasks** | Each task includes test-writing subtask |
| **Implementation** | Follow Red → Green → Refactor cycle |

**Example Task with TDD**:
```markdown
### Task: Implement album creation

**Acceptance Criteria**:
- User can create album with name and optional description
- Album appears in album list immediately
- Album persists across page reloads

**TDD Steps**:
1. Write test: `test_create_album_stores_in_indexeddb`
2. Run test (fails - no implementation yet)
3. Implement minimal Album.create() method
4. Run test (passes)
5. Write test: `test_created_album_appears_in_list`
6. Implement UI update logic
7. Refactor for code quality
```

---

## Environment Variables & Configuration

### SPECIFY_FEATURE

**Purpose**: Override feature detection for non-Git repositories.

**Usage**:
```bash
export SPECIFY_FEATURE="001-photo-albums"
```

**When Needed**:
- Working in non-Git repository
- Multiple features in same directory
- Custom project structure

**Important**: Set in your AI agent context BEFORE running `/speckit.plan` or subsequent commands.

---

## Tools & Prerequisites

### Required Tools
- **uv** - Python package manager
- **Python 3.11+**
- **Git** - Version control
- **AI coding agent** - Copilot, Cursor, Claude Code, etc.

### Installation

**One-time persistent install** (recommended):
```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

**Usage without install**:
```bash
uvx --from git+https://github.com/github/spec-kit.git specify init <project>
```

### Project Initialization

**New project**:
```bash
specify init my-project --ai copilot
```

**Existing project**:
```bash
cd existing-project
specify init . --ai claude
# or
specify init --here --ai cursor-agent
```

### System Check
```bash
specify check
```

Verifies:
- Git installation
- AI agent availability (claude, gemini, copilot, cursor, etc.)
- Python environment

---

## Troubleshooting

### Common Issues

**Issue**: `/speckit.*` commands not recognized
- **Solution**: Run `specify init` in project root
- **Verify**: Check for `.github/agents/` or `.claude/` directory

**Issue**: SPECIFY_FEATURE not working
- **Solution**: Set environment variable IN your AI agent context (not terminal)
- **Verify**: Ask agent "What is SPECIFY_FEATURE set to?"

**Issue**: Constitution not followed during implementation
- **Solution**: Explicitly reference constitution in task descriptions
- **Best Practice**: Run `/speckit.analyze` before implementation

**Issue**: Spec and implementation diverged
- **Solution**: Update spec first, then re-run `/speckit.plan` and `/speckit.tasks`
- **Best Practice**: Version specs (semantic versioning)

---

## Best Practices Summary

### ✅ Do

- **Start with constitution** - Establishes non-negotiable constraints
- **Iterate on specs** - Use `/speckit.clarify` to refine requirements
- **Validate before implementing** - Run `/speckit.analyze` to catch issues early
- **Work task-by-task** - Complete each task fully before moving on
- **Reference constitution** - Explicitly cite principles in decisions
- **Version everything** - Specs, plans, and constitution use semantic versioning
- **Commit frequently** - After each completed task
- **Update specs when changing implementation** - Keep artifacts synchronized

### ❌ Don't

- **Skip constitution** - It's the foundation of all decisions
- **Mix specification and planning** - Keep requirements separate from tech choices
- **Implement before planning** - Always have a technical design first
- **Ignore task order** - Dependencies exist for a reason
- **Violate constitution without amending** - Formal process required
- **Let spec and code diverge** - Update spec when requirements change

---

## Workflow Cheat Sheet

**Starting New Feature (Greenfield)**:
```
1. /speckit.constitution  → Project principles
2. /speckit.specify       → Requirements (what/why)
3. /speckit.clarify       → [Optional] Resolve ambiguities
4. /speckit.plan          → Technical design (how)
5. /speckit.analyze       → [Optional] Validate consistency
6. /speckit.tasks         → Actionable task list
7. /speckit.implement     → Execute with TDD
```

**Adding to Existing Project (Brownfield)**:
```
1. Review constitution    → Understand constraints
2. /speckit.specify       → New feature requirements
3. /speckit.plan          → Integration with existing system
4. /speckit.tasks         → Include migration tasks
5. /speckit.implement     → Execute with regression tests
```

**Exploring Alternatives (Parallel)**:
```
1. /speckit.specify       → Single specification (shared)
2. /speckit.plan (v1)     → Approach A (e.g., React)
3. /speckit.plan (v2)     → Approach B (e.g., Vue)
4. /speckit.tasks (each)  → Parallel task lists
5. Implement in branches  → Compare against constitution metrics
```

---

## Resources

- **Official Repo**: https://github.com/github/spec-kit
- **Documentation**: https://github.github.io/spec-kit/
- **Methodology Deep Dive**: https://github.com/github/spec-kit/blob/main/spec-driven.md
- **Video Overview**: https://www.youtube.com/watch?v=a9eR1xsfvHg

---

## Quick Reference

### Available Commands

> **Note**: These commands are provided by the specify CLI (installed via `specify init`), not by this APM skill package. They become available at runtime when spec-kit is set up in your project.

| Command | Purpose | When to Use | Source |
|---------|---------|-------------|--------|
| `/speckit.constitution` | Define project principles | Start of project, major direction changes | specify CLI |
| `/speckit.specify` | Write requirements | Every new feature | specify CLI |
| `/speckit.clarify` | Resolve ambiguities | After specification, before planning | specify CLI |
| `/speckit.plan` | Technical design | After spec, before tasks | specify CLI |
| `/speckit.analyze` | Validate consistency | Before implementation | specify CLI |
| `/speckit.checklist` | Generate quality checklists | For custom validation needs | specify CLI |
| `/speckit.tasks` | Create task list | After planning | specify CLI |
| `/speckit.implement` | Execute implementation | Final step, with TDD | specify CLI |

### Prompts Included in This Skill

| Prompt | Purpose | Usage |
|--------|---------|-------|
| `create-spec.prompt.md` | Guide specification creation | Alternative to `/speckit.specify` for manual spec writing |
| `clarify-spec.prompt.md` | Guide clarification process | Supplement to `/speckit.clarify` for resolving ambiguities |

**Integration**: This skill provides instructions and best practices for using spec-kit. The spec-kit prompts themselves are installed by the specify CLI into `.github/agents/` or `.claude/` directories.

---

**License**: MIT (GitHub spec-kit)  
**Maintained By**: GitHub (Den Delimarsky, John Lam)  
**Skill Version**: 1.0.0
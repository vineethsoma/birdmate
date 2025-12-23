# Feature Context: Natural Language Bird Search Interface

**Feature ID**: 001-bird-search-ui  
**Branch**: `001-bird-search-ui`  
**Status**: 🟡 In Progress  
**Last Updated**: 2025-12-23  
**Feature Lead**: Active

---

## Feature Overview

Build a web application enabling birdwatchers to identify bird species through natural language descriptions. Core MVP: Single-query search interface accepting free-form text, semantic search using OpenAI embeddings, display of 5-10 ranked results with images, and detailed species information pages.

**Constitution Compliance**: ✅ All 5 principles satisfied (see [plan.md](plan.md))

---

## Implementation Strategy

**Approach**: MVP-first with incremental delivery
- **Phase 1**: Setup + Foundational (blocks all stories)
- **Phase 2**: User Story 1 (MVP core search)
- **Phase 3+**: Incremental enhancements (US2, US4, US3)

**Current Phase**: Setup & Foundational

---

## Work in Progress (WIP) Tracker

**WIP Limit**: 3 concurrent stories maximum (STRICTLY ENFORCED)

| Slot | Story | Agent | Status | Branch | Started | ETA |
|------|-------|-------|--------|--------|---------|-----|
| 1    | Foundation | TBD | ⏳ Not Started | - | - | - |
| 2    | - | - | 🔓 Available | - | - | - |
| 3    | - | - | 🔓 Available | - | - | - |

**Current WIP**: 0/3

---

## Story Status Board

| Story ID | Priority | Title | Status | Assignee | Branch | Progress | Blockers |
|----------|----------|-------|--------|----------|--------|----------|----------|
| Setup | - | Project initialization | ⏳ Ready | TBD | main | 0/9 | None |
| Foundation | - | Core infrastructure | ⏳ Ready | TBD | main | 0/16 | Needs Setup |
| US1 | P1 | Basic natural language search | ⏳ Ready | TBD | feat-us1 | 0/23 | Needs Foundation |
| US2 | P2 | View detailed bird information | ⏳ Ready | TBD | feat-us2 | 0/12 | Needs Foundation |
| US4 | P2 | No results handling | ⏳ Ready | TBD | feat-us4 | 0/9 | Needs Foundation |
| US3 | P3 | Refine search from results | ⏳ Ready | TBD | feat-us3 | 0/7 | Needs Foundation |

**Total Tasks**: 91  
**Completed**: 0 (0%)  
**In Progress**: 0  
**Blocked**: 4 (US1, US2, US4, US3 waiting on Foundation)

---

## Dependencies & Handoffs

### Cross-Story Dependencies

**Foundation → All Stories**:
- Database schema and seeding
- API middleware (auth, sanitization, error handling)
- Shared TypeScript types
- Testing infrastructure

**US1 → US2**:
- BirdCard click handler integration
- Search result caching for back button

**US1 → US4**:
- SearchService error handling extension
- SearchResults component error states

**US1 → US3**:
- Search state management
- Query history tracking

### API Contracts

**Stable Endpoints** (from [contracts/api.openapi.yml](contracts/api.openapi.yml)):
- `POST /api/v1/search` - Natural language bird search
- `GET /api/v1/birds/:id` - Bird detail retrieval
- `GET /api/v1/taxonomy` - Taxonomy version metadata

**Contract Status**: ✅ Finalized (no breaking changes allowed without major version bump)

---

## Git Worktree Status

**Main Branch**: `/Users/vineethsoma/workspaces/ai/birdmate` (001-bird-search-ui)

**Worktrees**: None initialized yet

**Planned Worktrees**:
```
worktrees/
├── feat-us1/    # User Story 1: Basic search
├── feat-us2/    # User Story 2: Bird details
├── feat-us4/    # User Story 4: Error handling
└── feat-us3/    # User Story 3: Search refinement
```

**Action Required**: Initialize worktrees after Foundation complete

---

## Constitution Compliance Tracking

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Natural Language First | ✅ Pass | Free-form text input, OpenAI embeddings |
| II. Accurate Taxonomy | ✅ Pass | eBird taxonomy, Macaulay Library images |
| III. Test-First | ✅ Pass | 20 curated queries, 90% accuracy requirement |
| IV. Observability | ✅ Pass | Query logging, audit trail in schema |
| V. API First | ✅ Pass | RESTful backend, SQLite embedded |

---

## Quality Gates

**Before Delegation**:
- [x] Spec complete ([spec.md](spec.md))
- [x] Plan approved ([plan.md](plan.md))
- [x] Tasks broken down ([tasks.md](tasks.md))
- [x] Constitution validated
- [ ] Worktrees initialized (deferred until Foundation complete)
- [x] Delegation documents prepared (DELEGATION-SETUP-FOUNDATION.md)

**Before Story Merge**:
- [ ] All acceptance criteria met
- [ ] Tests pass (TDD workflow followed)
- [ ] Constitution compliance verified
- [ ] No merge conflicts with main
- [ ] Cross-story consistency validated
- [ ] Handoff documentation complete

---

## Active Blockers

**None currently** - Ready to begin delegation

---

## Next Actions

1. ✅ Feature context initialized (this document)
2. ✅ Delegation document prepared (DELEGATION-SETUP-FOUNDATION.md)
3. ⏳ **READY TO ASSIGN** to fullstack engineer
4. ⏳ Monitor Foundation progress daily
5. ⏳ Initialize worktrees after Foundation complete
6. ⏳ Delegate User Stories (max 3 concurrent)

---

## Communication Log

### 2025-12-23 14:00 - Feature Initialized
- Feature context document created (FEATURE_CONTEXT.md)
- Delegation document prepared (DELEGATION-SETUP-FOUNDATION.md)
- **READY TO ASSIGN** Setup + Foundation to fullstack engineer
- Foundation includes 25 tasks (T001-T025): 9 setup + 16 foundational
- User stories will follow after Foundation complete

### Next Step
**Feature Lead Action Required**: Assign DELEGATION-SETUP-FOUNDATION.md to available fullstack engineer

---

**Feature Lead Notes**: 
- Foundation is CRITICAL BLOCKER - must complete before any parallel story work
- After Foundation: Can delegate up to 3 user stories in parallel (US1, US2, US4)
- US3 is P3 and can wait until later
- Target MVP: Setup + Foundation + US1 only (~48 tasks)

# Delegation: Setup + Foundation Phases

**Story ID**: SETUP-FOUNDATION  
**Assigned To**: Fullstack Engineer (TBD)  
**Priority**: P0 (CRITICAL BLOCKER)  
**Branch**: `001-bird-search-ui` (main feature branch)  
**Estimated Effort**: 3-4 days  
**Status**: ⏳ Ready for Assignment

---

## Context

This is the **CRITICAL FOUNDATION** for the natural language bird search feature. All user stories (US1, US2, US4, US3) are **BLOCKED** until this work completes.

You will initialize the project structure, set up the development toolchain (TypeScript, Vite, Vitest), create the database schema, and implement core infrastructure (logging, sanitization, error handling).

**Feature Specification**: [specs/001-bird-search-ui/spec.md](../spec.md)  
**Implementation Plan**: [specs/001-bird-search-ui/plan.md](../plan.md)  
**Data Model**: [specs/001-bird-search-ui/data-model.md](../data-model.md)  
**API Contracts**: [specs/001-bird-search-ui/contracts/api.openapi.yml](../contracts/api.openapi.yml)  
**Constitution**: [specs/.specify/memory/constitution.md](../../.specify/memory/constitution.md)

---

## Acceptance Criteria

### Phase 1: Setup (9 tasks)
- [ ] Root project structure created (backend/, frontend/, shared/, database/)
- [ ] Backend TypeScript + Vite + Vitest configured (strict mode)
- [ ] Frontend React + TypeScript + Vite configured
- [ ] All dependencies installed (OpenAI SDK 4.73+, React 18.3+, TanStack Query 5.62+)
- [ ] Shared types directory created with TypeScript interfaces
- [ ] ESLint + Prettier configured for both frontend and backend
- [ ] .env.example files created with all required variables
- [ ] .gitignore properly excludes node_modules/, .env, database/*.db

### Phase 2: Foundational (16 tasks)
- [ ] Database schema created (birds, bird_images, search_queries, search_results, taxonomy_metadata)
- [ ] Database migration framework implemented
- [ ] SQLite client wrapper with connection pooling
- [ ] eBird taxonomy download script (fetches CSV from eBird)
- [ ] Taxonomy seeding script (imports 500-1000 North American species)
- [ ] Macaulay Library image fetching script (3-5 images per species)
- [ ] OpenAI embeddings generation script (pre-compute 1536-dim vectors)
- [ ] Base logging service (structured JSON logging)
- [ ] Input sanitization middleware (XSS prevention)
- [ ] Error handling middleware (consistent error format)
- [ ] Rate limiting middleware (prevent abuse)
- [ ] Express/Fastify server configured (CORS, middleware stack)
- [ ] Shared TypeScript types (Bird, SearchQuery, SearchResponse)
- [ ] React Router configured (home page + bird detail routes)
- [ ] TanStack Query provider configured
- [ ] API client wrapper (fetch with base URL and error handling)

---

## Dependencies

**Requires** (must be complete first):
- None - This IS the foundation

**Blocks** (waiting on this work):
- US1: Basic natural language search (23 tasks)
- US2: View detailed bird information (12 tasks)
- US4: No results handling (9 tasks)
- US3: Refine search from results (7 tasks)

---

## Technical Details

**Branch**: Work directly on `001-bird-search-ui` (no worktree needed for foundation)  
**Working Directory**: `/Users/vineethsoma/workspaces/ai/birdmate`

**Files to Create/Modify**:

### Backend
```
backend/
├── package.json (NEW)
├── tsconfig.json (NEW)
├── vite.config.ts (NEW)
├── .env.example (NEW)
├── src/
│   ├── server.ts (NEW)
│   ├── db/
│   │   ├── client.ts (NEW)
│   │   ├── migrations/ (NEW)
│   │   └── seeds/ (NEW - 3 scripts)
│   ├── models/ (NEW - prepare for entities)
│   ├── services/ (NEW - prepare for business logic)
│   ├── api/
│   │   ├── middleware/ (NEW - 3 middleware files)
│   │   └── routes/ (NEW - prepare for endpoints)
│   └── utils/
│       └── logging.ts (NEW)
└── tests/ (NEW - prepare test structure)
```

### Frontend
```
frontend/
├── package.json (NEW)
├── tsconfig.json (NEW)
├── tsconfig.node.json (NEW)
├── vite.config.ts (NEW)
├── .env.example (NEW)
├── index.html (NEW)
├── src/
│   ├── App.tsx (NEW)
│   ├── main.tsx (NEW)
│   ├── services/
│   │   └── apiClient.ts (NEW)
│   ├── components/ (NEW - prepare for UI)
│   ├── pages/ (NEW - prepare for routes)
│   ├── hooks/ (NEW - prepare for custom hooks)
│   └── test/
│       └── setup.ts (NEW)
└── tests/ (NEW - prepare test structure)
```

### Database
```
database/
├── schema.sql (NEW)
├── migrations/ (NEW)
└── seeds/ (NEW)
```

### Shared
```
shared/
└── types/
    └── index.ts (NEW - Bird, SearchQuery, SearchResponse types)
```

---

## Handoff to Next Stories

### What US1 Needs from Foundation:
- ✅ Database schema with birds, bird_images, search_queries tables
- ✅ SQLite client ready to use
- ✅ Bird data seeded (500-1000 North American species)
- ✅ Bird images seeded (3-5 per species)
- ✅ Pre-computed embeddings for all birds
- ✅ Logging service for query tracking
- ✅ Input sanitization middleware (prevents XSS)
- ✅ Error handling middleware (consistent errors)
- ✅ Shared TypeScript types (Bird, SearchQuery, SearchResponse)
- ✅ Express server running on port 3001
- ✅ React app running on port 3000
- ✅ API client wrapper ready for use
- ✅ TanStack Query configured

### What US2, US4, US3 Need:
- Same as US1 - all foundation work is shared infrastructure

---

## Standards & Guidelines

### TDD Workflow (Constitution Principle III)
While this is infrastructure setup, you MUST:
1. Create test structure and setup files
2. Verify all tooling works (run `npm test` successfully)
3. Database seeding scripts must be idempotent (can run multiple times)

### TypeScript Strict Mode (Constitution)
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true
}
```

### Code Quality (CLAUDE Standards)
- **C-4**: Functions ≤ 20 lines
- **N-1**: Descriptive names (no abbreviations)
- **E-1**: Fail fast (validate inputs immediately)
- **S-1**: Input validation on all external data
- **L-1**: Structured JSON logging

### Security (Constitution FR-014)
- Use validator.js for input sanitization
- Use DOMPurify for XSS prevention
- Never trust user input
- Rate limit all API endpoints

---

## Verification Checklist

Before marking complete:

**Setup Phase**:
- [ ] `cd backend && npm install` succeeds
- [ ] `cd frontend && npm install` succeeds
- [ ] `cd backend && npm test` runs (even if no tests yet)
- [ ] `cd frontend && npm test` runs (even if no tests yet)
- [ ] TypeScript compiles with zero errors (strict mode)
- [ ] ESLint passes for both backend and frontend

**Foundation Phase**:
- [ ] Database schema creates successfully (`sqlite3 database/birdmate.db < database/schema.sql`)
- [ ] eBird taxonomy downloads and seeds (500-1000 species)
- [ ] Bird images fetch and seed (3-5 per species)
- [ ] Embeddings generate for all species
- [ ] Backend server starts (`npm run dev` in backend/)
- [ ] Frontend app starts (`npm run dev` in frontend/)
- [ ] React app can reach backend API (test with curl)
- [ ] Shared types import correctly in both frontend and backend
- [ ] Database has data: `sqlite3 database/birdmate.db "SELECT COUNT(*) FROM birds;"`

---

## Task Breakdown (from tasks.md)

### Phase 1: Setup
- T001: Create root structure
- T002: Backend package.json + tsconfig.json + vite.config.ts
- T003: Frontend package.json + tsconfig.json + vite.config.ts
- T004: Install backend deps (express, openai, better-sqlite3, sqlite-vss, vitest)
- T005: Install frontend deps (react, react-router-dom, @tanstack/react-query, vitest, @testing-library/react)
- T006: Create shared/types/ directory
- T007: Configure ESLint + Prettier
- T008: Create .env.example files
- T009: Setup .gitignore

### Phase 2: Foundational
- T010: Database schema (schema.sql)
- T011: Migration framework
- T012: SQLite client wrapper
- T013: eBird taxonomy download script
- T014: Taxonomy seeding script
- T015: Image fetching script
- T016: Embeddings generation script
- T017: Logging service
- T018: Input sanitization middleware
- T019: Error handling middleware
- T020: Rate limiting middleware
- T021: Express server setup
- T022: Shared types (Bird, SearchQuery, SearchResponse)
- T023: React Router config
- T024: TanStack Query provider
- T025: API client wrapper

---

## Resources

**eBird Taxonomy**: https://ebird.org/science/use-ebird-data/the-ebird-taxonomy  
**Macaulay Library**: https://www.macaulaylibrary.org/  
**OpenAI Embeddings**: https://platform.openai.com/docs/guides/embeddings  
**sqlite-vss**: https://github.com/asg017/sqlite-vss  
**Vite**: https://vitejs.dev/  
**Vitest**: https://vitest.dev/

---

## Communication

**Daily Stand-up**:
- Report progress on task completion
- Flag any blockers immediately
- Update FEATURE_CONTEXT.md with status

**When Blocked**:
- Document blocker in FEATURE_CONTEXT.md
- Alert Feature Lead immediately
- Propose mitigation if possible

**When Complete**:
- Run full verification checklist
- Update FEATURE_CONTEXT.md (mark Foundation ✅ Complete)
- Notify Feature Lead that user stories can begin
- Commit all changes with clear message: "feat: Complete setup and foundation phases"

---

## Success Criteria

✅ **Foundation Ready** when:
1. Both backend and frontend run locally without errors
2. Database seeded with 500+ bird species and images
3. All embeddings pre-computed and stored
4. Shared types compile in both frontend and backend
5. Test infrastructure runs successfully
6. All 25 foundation tasks (T001-T025) marked complete

**This unblocks**: US1, US2, US4, US3 for parallel development

---

**Feature Lead**: After this completes, I will initialize worktrees and delegate user stories to maximize parallel development.

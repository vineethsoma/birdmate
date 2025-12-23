# Foundation Work Delegation

**Assigned To**: Fullstack Engineer  
**Branch**: `001-bird-search-ui`  
**Priority**: P0 (BLOCKING all user stories)

## Your Mission

Complete Phase 1 (Setup) and Phase 2 (Foundational Infrastructure) from [specs/001-bird-search-ui/tasks.md](specs/001-bird-search-ui/tasks.md).

**Tasks**: T001-T025 (25 tasks total)  
**Estimated**: 2-3 days  
**Blocks**: All 4 user stories (US1, US2, US3, US4)

## Why This Matters

Until foundation is complete, NO user story work can begin. You're building the shared infrastructure that enables 4 teams to work in parallel afterward.

## Acceptance Criteria

✅ Check off tasks T001-T025 in [specs/001-bird-search-ui/tasks.md](specs/001-bird-search-ui/tasks.md) as you complete them

### Key Deliverables
- Backend: TypeScript + Express/Fastify + SQLite + OpenAI embeddings
- Frontend: React + TypeScript + Vite + TanStack Query
- Database: Schema + seeding scripts (eBird taxonomy, Macaulay images)
- Middleware: Sanitization, error handling, rate limiting
- Shared types matching [API contract](specs/001-bird-search-ui/contracts/api.openapi.yml)

## Reference Documents

All details are in the spec folder:
- 📋 **Tasks**: [specs/001-bird-search-ui/tasks.md](specs/001-bird-search-ui/tasks.md) - Complete T001-T025
- 🏗️ **Architecture**: [specs/001-bird-search-ui/plan.md](specs/001-bird-search-ui/plan.md) - Tech stack, structure
- 📊 **Data Model**: [specs/001-bird-search-ui/data-model.md](specs/001-bird-search-ui/data-model.md) - Database schema
- 🔌 **API Contract**: [specs/001-bird-search-ui/contracts/api.openapi.yml](specs/001-bird-search-ui/contracts/api.openapi.yml) - Endpoints
- 🚀 **Quickstart**: [specs/001-bird-search-ui/quickstart.md](specs/001-bird-search-ui/quickstart.md) - Setup patterns

## Standards

- **TDD**: Tests first (where applicable in foundation)
- **TypeScript Strict Mode**: Zero tolerance for type errors
- **CLAUDE Framework**: See AGENTS.md for coding standards
- **Constitution**: See [specs/.specify/memory/constitution.md](specs/.specify/memory/constitution.md)

## Completion Checklist

Before marking foundation complete:
- [ ] All tasks T001-T025 checked off in tasks.md
- [ ] `npm install` succeeds in backend/ and frontend/
- [ ] `npm run build` succeeds (TypeScript compiles with strict mode)
- [ ] Database seeds can populate test data
- [ ] Server starts without errors
- [ ] Frontend dev server shows placeholder page

## After Foundation Complete

Report back to Feature Lead. Next steps:
1. Create 4 worktrees for parallel user story development
2. Delegate US1 (P1 - MVP core search)
3. Delegate US2, US4, US3 (P2-P3 enhancements)

---

**Feature Lead**: I coordinate, I don't code. You build, I orchestrate. Questions? Check the spec docs above.

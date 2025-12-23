# Implementation Plan: Natural Language Bird Search Interface

**Branch**: `001-bird-search-ui` | **Date**: 2025-12-23 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-bird-search-ui/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a web application enabling birdwatchers to identify bird species through natural language descriptions. Core MVP: Single-query search interface accepting free-form text (e.g., "small red bird with black wings"), semantic search using OpenAI embeddings, display of 5-10 ranked results with images from Macaulay Library, and detailed species information pages. Technical approach: React + TypeScript frontend, Node.js + TypeScript backend with RESTful API, Vite/Vitest toolchain, embedded bird database (SQLite/PostgreSQL) with eBird taxonomy, URL-based navigation state.

## Technical Context

**Language/Version**: TypeScript 5.7 (strict mode), Node.js 20.x LTS  
**Primary Dependencies**: 
- Frontend: React 18.3+, Vite 6+, React Router 6.28+, TanStack Query 5.62+
- Backend: Express.js or Fastify, OpenAI SDK 4.73+, sqlite-vss (vector store)
- Testing: Vitest 2.1+, Testing Library 16+ (React components)

**Storage**: 
- **MVP**: SQLite with **sqlite-vss extension** (native vector similarity search)
- **Production**: PostgreSQL 15+ with **pgvector extension** (scales to millions of vectors)
- **Data**: Bird species (eBird taxonomy), pre-computed embeddings (1536-dim), search query logs (anonymized)

**Vector Store**: sqlite-vss (0-config, C-based cosine similarity) → pgvector (production HNSW indexing)

**Testing**: Vitest for all layers. Unit tests for search logic, API endpoints, React components. Integration tests simulating real user queries against curated bird dataset (20+ common descriptions per constitution principle III).

**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - last 2 versions). Responsive design 320px-1920px. No mobile-native apps (web-only MVP).

**Project Type**: Web application (frontend + backend + shared types)

**Performance Goals**: 
- Search response < 3 seconds (95th percentile)
- Initial page load < 2 seconds (4G connection)
- Support 50-100 concurrent users without >10% degradation

**Constraints**:
- Non-commercial use only (Macaulay Library CC BY-NC-SA licensing)
- English language only for MVP
- 500-1000 North American bird species dataset
- No authentication/user accounts for MVP
- Stateless searches (no chat history between queries)

**Scale/Scope**:
- 500-1000 bird species (North America focus)
- 20+ curated test queries for validation
- Single-page app with 2 primary views (search results, bird detail)
- 5-10 results per search maximum
- Quarterly manual taxonomy updates

**Similar Species Algorithm**:
- Use embedding vector similarity (cosine distance) to find 3-5 nearest neighbors
- Filter by same family or order for taxonomic relevance
- Prioritize species with overlapping geographic range
- Display distinguishing field marks from bird descriptions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Natural Language First
✅ **PASS** - FR-001 specifies free-form text input with no query syntax. Search accepts plain descriptions like "red chest with grey back". OpenAI embeddings enable semantic understanding of natural language.

### Principle II: Accurate Bird Taxonomy
✅ **PASS** - Spec mandates eBird taxonomy as authoritative source (FR-016 displays version/date). Macaulay Library images from Cornell (same organization). No silent data merging.

### Principle III: Test-First & Field-Validated (NON-NEGOTIABLE)
✅ **PASS** - SC-002 defines 20 curated common descriptions with 90% top-3 accuracy requirement. Vitest integration tests cover real birdwatcher queries. TDD workflow in constitution enforced.

### Principle IV: Observability & Audit Trail
✅ **PASS** - FR-015 mandates anonymous logging of all queries with timestamp, query text, top-3 results. Tracking for failed/ambiguous queries. No PII without consent (not implemented in MVP).

### Principle V: API First & Simple Deployment
✅ **PASS** - RESTful API backend (POST /search, GET /birds/:id). UI consumes API. Embedded database (SQLite) keeps deployment simple. No complex orchestration needed.

### Architecture & Tech Stack Compliance
✅ **PASS** - React + TypeScript frontend, Node.js + TypeScript backend, Vite + Vitest toolchain all per constitution. OpenAI embeddings specified in clarifications. PostgreSQL/MongoDB with SQLite MVP path matches constitution.

### Development Workflow Compliance
✅ **PASS** - TypeScript strict mode required. Vitest for all tests. API versioning via semantic versioning. Manual quarterly taxonomy updates per clarifications.

**GATE STATUS**: ✅ **ALL CHECKS PASSED** - Proceed to Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/001-bird-search-ui/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (being generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (API contracts)
│   └── api.openapi.yml
├── checklists/          # Quality validation
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/          # Bird species, search query entities
│   ├── services/        # Search service, embedding service, bird service
│   ├── api/             # Express/Fastify routes
│   │   ├── routes/      # /search, /birds endpoints
│   │   └── middleware/  # Input sanitization, error handling
│   ├── db/              # Database setup, migrations, seed data
│   └── utils/           # Logging, validation helpers
├── tests/
│   ├── integration/     # End-to-end API tests with real bird data
│   ├── unit/            # Service and model unit tests
│   └── fixtures/        # 20+ curated test queries, bird dataset samples
├── package.json
├── tsconfig.json
└── vite.config.ts       # Vitest configuration

frontend/
├── src/
│   ├── components/      # SearchBox, BirdCard, BirdDetail, Loading, ErrorMessage
│   ├── pages/           # HomePage (search), BirdDetailPage
│   ├── services/        # API client (fetch wrapper)
│   ├── hooks/           # useSearch, useBirdDetail (TanStack Query)
│   ├── types/           # TypeScript interfaces (shared with backend)
│   └── App.tsx          # React Router setup
├── tests/
│   ├── components/      # Testing Library component tests
│   └── e2e/             # Optional: Playwright E2E tests
├── package.json
├── tsconfig.json
└── vite.config.ts       # Vite build + Vitest config

shared/
└── types/               # Shared TypeScript types (Bird, SearchQuery, SearchResult)

database/
├── schema.sql           # SQLite schema for bird species, embeddings, logs
├── migrations/          # Database version migrations
└── seeds/               # eBird taxonomy import scripts, sample data
```

**Structure Decision**: Selected **web application structure** (frontend + backend) as feature requires both React UI and Node.js API. Frontend consumes backend API via HTTP. Shared types package ensures type safety across boundary. Database directory holds schema and seeding scripts for reproducibility.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations detected** - All constitutional principles satisfied. No complexity justification required.

---

## Phase 0: Research Complete ✅

All technical unknowns resolved. Research document generated: [research.md](research.md)

**Key Decisions**:
- OpenAI text-embedding-3-small for semantic search
- Macaulay Library API for bird images
- eBird Taxonomy CSV for species data
- React 18 + TanStack Query + React Router for frontend
- SQLite → PostgreSQL migration path for database
- 20+ curated test queries for field validation
- DOMPurify + validator.js for security

---

## Phase 1: Design & Contracts Complete ✅

### Generated Artifacts

1. **Data Model** ([data-model.md](data-model.md))
   - 5 core entities: Bird Species, Bird Image, Search Query, Search Result, Taxonomy Metadata
   - Entity relationships and validation rules defined
   - Sample data provided

2. **API Contracts** ([contracts/api.openapi.yml](contracts/api.openapi.yml))
   - `POST /api/v1/search` - Natural language bird search
   - `GET /api/v1/birds/:id` - Bird detail retrieval
   - `GET /api/v1/taxonomy` - Taxonomy version metadata
   - Full OpenAPI 3.0 spec with examples and error codes

3. **Quickstart Guide** ([quickstart.md](quickstart.md))
   - 5-minute setup instructions
   - Architecture overview and request flow
   - Key implementation patterns (semantic search, URL state, sanitization)
   - Database schema quick reference
   - Common issues and solutions

4. **Agent Context Updated**
   - GitHub Copilot instructions generated
   - Technology stack documented (TypeScript, React, Node.js, SQLite, Vite, Vitest)
   - Architecture patterns recorded

### Constitution Check Re-Evaluation (Post-Design)

*Verifying all principles still satisfied after technical decisions*

✅ **Principle I: Natural Language First**
- Design maintains free-form text input with no query syntax
- OpenAI embeddings chosen specifically for natural language understanding
- Search service accepts plain English descriptions
- **COMPLIANT**

✅ **Principle II: Accurate Bird Taxonomy**
- Data model references eBird codes as primary key
- Taxonomy Metadata entity tracks version and source
- Macaulay Library integration ensures Cornell-verified images
- API contract includes `/taxonomy` endpoint for version display (FR-016)
- **COMPLIANT**

✅ **Principle III: Test-First & Field-Validated (NON-NEGOTIABLE)**
- Quickstart includes 20+ curated test queries
- Vitest integration test suite defined
- SC-002 validation: 90% accuracy requirement for top-3 results
- Test-driven workflow documented in quickstart
- **COMPLIANT**

✅ **Principle IV: Observability & Audit Trail**
- `search_logs` table in data model captures all queries
- SearchService logs query text, embedding, top results, timestamp (FR-015)
- API response includes query echo for audit
- No PII collected (anonymous logging)
- **COMPLIANT**

✅ **Principle V: API First & Simple Deployment**
- RESTful API design (OpenAPI contract)
- SQLite embedded database requires no external server
- Frontend consumes backend via HTTP (composable)
- Minimal dependencies: OpenAI SDK, better-sqlite3, Express/Fastify
- **COMPLIANT**

✅ **Architecture & Tech Stack Compliance**
- TypeScript strict mode enforced
- React 18 + Node.js 20 per constitution
- Vite + Vitest toolchain specified
- API-first design maintained
- **COMPLIANT**

✅ **Development Workflow Compliance**
- Tests defined before implementation (TDD)
- TypeScript strict mode = zero tolerance for type errors
- Vitest for all test layers (unit, integration, component)
- API versioning via semantic versioning
- Quarterly taxonomy updates per clarifications
- **COMPLIANT**

**FINAL GATE STATUS**: ✅ **ALL CHECKS PASSED** - Design fully compliant with constitution.

---

## Implementation Readiness Summary

| Artifact | Status | Location |
|----------|--------|----------|
| Feature Specification | ✅ Complete | [spec.md](spec.md) |
| Implementation Plan | ✅ Complete | This document |
| Research Document | ✅ Complete | [research.md](research.md) |
| Data Model | ✅ Complete | [data-model.md](data-model.md) |
| API Contracts | ✅ Complete | [contracts/api.openapi.yml](contracts/api.openapi.yml) |
| Quickstart Guide | ✅ Complete | [quickstart.md](quickstart.md) |
| Agent Context | ✅ Updated | `.github/agents/copilot-instructions.md` |
| Constitution Check | ✅ Passed | All principles satisfied |

**Next Command**: `/speckit.tasks` - Generate implementation tasks from this plan

---

## Technical Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **OpenAI API rate limits** | Search degradation | Implement caching, rate limiting on frontend, fallback to keyword search |
| **Macaulay Library API unavailable** | Missing images | Cache image URLs during seeding, show placeholder images |
| **eBird taxonomy changes** | Outdated species data | Quarterly manual review process, version display in footer (FR-016) |
| **Search relevance < 90%** | Failed SC-002 metric | Iterate on description quality, adjust similarity threshold, add hybrid keyword matching |
| **SQLite performance at scale** | Slow queries > 100 users | Documented migration path to PostgreSQL + pgvector |
| **XSS vulnerabilities** | Security breach | Input sanitization (validator.js), DOMPurify, security testing in CI |

---

## Deployment Checklist (Future)

*Not part of MVP but documented for reference*

- [ ] Cloud platform selected (AWS/Azure/GCP/Vercel)
- [ ] Migrate to PostgreSQL + pgvector extension
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure production environment variables
- [ ] Enable HTTPS with valid certificate
- [ ] Set up monitoring (uptime, response times, error rates)
- [ ] Configure backup strategy for database
- [ ] Load test with 100+ concurrent users
- [ ] Security audit (penetration testing)
- [ ] Accessibility audit (WCAG 2.1 Level A)

---

**Planning Complete**: Ready for task breakdown and implementation. All constitutional requirements satisfied.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

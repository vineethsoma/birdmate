# Tasks: Natural Language Bird Search Interface

**Input**: Design documents from `/specs/001-bird-search-ui/`  
**Prerequisites**: plan.md ✅, spec.md ✅ (with 5 clarifications), research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Constitution Principle III mandates TDD. All test tasks included and MUST be written first before implementation.

**Specification Updates**: Tasks incorporate clarifications from spec.md:
- Staged scalability: 10 concurrent users (MVP), 100 concurrent users (production)
- Similar species: 3-5 species per bird detail page
- Back button: Pre-populates search box with cached results
- Typo correction: Only common bird names (pre-defined dictionary)
- Test queries: 20 documented queries in spec appendix for validation

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create root project structure with backend/, frontend/, shared/, and database/ directories
- [ ] T002 [P] Initialize backend Node.js + TypeScript project in backend/ with package.json, tsconfig.json (strict mode), and Vite config for Vitest
- [ ] T003 [P] Initialize frontend React + TypeScript project in frontend/ with package.json, tsconfig.json (strict mode), and Vite config
- [ ] T004 [P] Install backend dependencies: express/fastify, openai (^4.73.0), sqlite3, sqlite-vss, vitest (^2.1.0), dotenv
- [ ] T005 [P] Install frontend dependencies: react (^18.3.0), react-router-dom (^6.28.0), @tanstack/react-query (^5.62.0), vitest, @testing-library/react (^16.0.0)
- [ ] T006 [P] Create shared/types/ directory with TypeScript interface definitions exported for frontend and backend
- [ ] T007 [P] Configure ESLint and Prettier for both backend and frontend with TypeScript rules
- [ ] T008 Create .env.example files in backend/ and frontend/ with required environment variables (OPENAI_API_KEY, DATABASE_PATH, VITE_API_BASE_URL)
- [ ] T009 [P] Setup .gitignore to exclude node_modules/, .env, database/*.db, and build artifacts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T010 Create database schema in database/schema.sql with tables: birds, bird_images, search_queries, search_results, taxonomy_metadata (per data-model.md)
- [ ] T011 Create database migration framework in backend/src/db/migrations/ with versioned migration files
- [ ] T012 [P] Implement SQLite database client wrapper in backend/src/db/client.ts with connection pooling and error handling
- [ ] T013 [P] Create eBird taxonomy download script in backend/src/db/seeds/download-taxonomy.ts to download eBird taxonomy CSV snapshot (one-time data export, not runtime API)
- [ ] T014 Create taxonomy seeding script in backend/src/db/seeds/seed-taxonomy.ts to import eBird CSV into birds table (filter North America, 500-1000 species)
- [ ] T015 Create Macaulay Library image seeding script in backend/src/db/seeds/fetch-images.ts to download and cache 3-5 images per species URLs from Macaulay Library (one-time data snapshot for embedded database; includes rate limit handling and retry logic)
- [ ] T016 Create OpenAI embeddings generation script in backend/src/db/seeds/generate-embeddings.ts to pre-compute embeddings for all bird descriptions (1536-dim vectors)
- [ ] T016b Create embedding update script in backend/src/db/seeds/update-embeddings.ts to regenerate embeddings when taxonomy data changes (quarterly updates); includes incremental update logic to only process new/modified species
- [ ] T017 [P] Implement base logging service in backend/src/utils/logging.ts with structured logging (timestamp, level, context)
- [ ] T018 [P] Implement input sanitization middleware in backend/src/api/middleware/sanitize.ts using DOMPurify and validator.js (prevents XSS per FR-014)
- [ ] T019 [P] Implement error handling middleware in backend/src/api/middleware/errorHandler.ts with consistent error response format
- [ ] T020 [P] Implement rate limiting middleware in backend/src/api/middleware/rateLimit.ts to prevent abuse
- [ ] T020b [P] Create integration test for database unavailability in backend/tests/integration/test-database-errors.test.ts validating graceful degradation and error messaging per FR-013
- [ ] T021 [P] Setup Express/Fastify server configuration in backend/src/server.ts with CORS, middleware stack, and route registration
- [ ] T022 [P] Create shared TypeScript types in shared/types/index.ts: Bird, BirdSearchResult, BirdDetail, SearchQuery, SearchResponse, TaxonomyMetadata (matching OpenAPI schema)
- [ ] T023 [P] Setup React Router configuration in frontend/src/App.tsx with routes for home page and bird detail page
- [ ] T024 [P] Setup TanStack Query provider in frontend/src/App.tsx with default cache configuration
- [ ] T025 [P] Create API client wrapper in frontend/src/services/apiClient.ts using fetch with base URL and error handling

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Natural Language Search (Priority: P1) 🎯 MVP

**Goal**: Enable birdwatchers to search for birds using natural language descriptions and see ranked results with photos and basic details within 2 seconds.

**Independent Test**: User can enter any natural language description (e.g., "red chest with grey back") and receive relevant bird results within 2 seconds. Success measured by correct bird in top 3 results for 20 curated common descriptions (90% accuracy per SC-002).

### Tests for User Story 1 (TDD - WRITE FIRST, ENSURE FAIL)

- [ ] T026 [P] [US1] Create contract test for POST /api/v1/search in backend/tests/contract/test-search-endpoint.test.ts verifying request/response schema compliance with OpenAPI spec
- [ ] T027 [P] [US1] Create integration test for search relevance in backend/tests/integration/test-search-relevance.test.ts using the 20 curated queries from spec appendix validating top-3 accuracy ≥90% (18 of 20 queries must pass)
- [ ] T028 [P] [US1] Create integration test for search performance in backend/tests/integration/test-search-performance.test.ts validating <3 second response time for 95% of queries
- [ ] T029 [P] [US1] Create unit test for SearchService.search() in backend/tests/unit/test-search-service.test.ts covering embedding generation, similarity calculation, and result ranking
- [ ] T030 [P] [US1] Create React component test for SearchBox in frontend/tests/components/test-SearchBox.test.tsx verifying input handling, validation, and submit behavior
- [ ] T031 [P] [US1] Create React component test for SearchResults in frontend/tests/components/test-SearchResults.test.tsx verifying result rendering, loading states, and empty states

### Implementation for User Story 1

- [x] T032 [P] [US1] Create Bird entity model in backend/src/models/Bird.ts with validation rules (eBirdCode unique, description ≥50 chars, at least one field mark)
- [x] T033 [P] [US1] Create SearchQuery entity model in backend/src/models/SearchQuery.ts with sanitization and normalization logic (1-500 chars, XSS prevention)
- [x] T034 [P] [US1] Create TaxonomyMetadata entity model in backend/src/models/TaxonomyMetadata.ts with version validation
- [x] T035 [US1] Implement OpenAI embeddings wrapper in backend/src/utils/embeddings.ts using text-embedding-3-small model
- [x] T036 [US1] Implement cosine similarity function in backend/src/utils/similarity.ts for vector comparison
- [x] T037 [US1] Implement SearchService in backend/src/services/SearchService.ts with methods: generateEmbedding(), searchBySimilarity(), rankResults() (depends on T035, T036)
- [x] T038 [US1] Implement BirdService in backend/src/services/BirdService.ts with methods: getBirdById(), getAllBirds(), getBirdImages()
- [x] T039 [US1] Implement LoggingService in backend/src/services/LoggingService.ts to log all queries with timestamp, query text, top-3 results per FR-015
- [x] T040 [US1] Implement POST /api/v1/search endpoint in backend/src/api/routes/search.ts calling SearchService and LoggingService (depends on T037, T039)
- [x] T041 [US1] Implement GET /api/v1/taxonomy endpoint in backend/src/api/routes/taxonomy.ts returning taxonomy version per FR-016
- [x] T042 [P] [US1] Create SearchBox React component in frontend/src/components/SearchBox.tsx with input field, submit button, validation (1-500 chars)
- [x] T043 [P] [US1] Create BirdCard React component in frontend/src/components/BirdCard.tsx displaying thumbnail, common name, scientific name, 1-2 field marks
- [x] T044 [US1] Create SearchResults React component in frontend/src/components/SearchResults.tsx rendering grid of BirdCard components with loading and empty states
- [x] T045 [US1] Create useSearch custom hook in frontend/src/hooks/useSearch.ts using TanStack Query to call POST /search with caching
- [x] T046 [US1] Create HomePage component in frontend/src/pages/HomePage.tsx composing SearchBox and SearchResults with URL state persistence and result caching for back button support (pre-populates search box and shows cached results per FR-011)
- [x] T047 [US1] Add loading spinner component in frontend/src/components/shared/Loading.tsx displayed during search processing (per FR-012)
- [x] T048 [US1] Add responsive CSS for mobile (320px) to desktop (1920px) in frontend/src/styles/ ensuring no horizontal scroll (per FR-009, SC-005)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can search, see results, and tests validate 90% accuracy on curated queries

---

## Phase 4: User Story 2 - View Detailed Bird Information (Priority: P2)

**Goal**: Users can click any search result card to view comprehensive bird details including size, habitat, range, song characteristics, seasonal variations, and similar species.

**Independent Test**: User can click any result card and view detailed bird profile with all standard fields populated (scientific name, common name, size, habitat, range, identification tips). Browser back button returns to search results.

### Tests for User Story 2 (TDD - WRITE FIRST, ENSURE FAIL)

- [ ] T049 [P] [US2] Create contract test for GET /api/v1/birds/:id in backend/tests/contract/test-birds-endpoint.test.ts verifying response schema compliance with OpenAPI spec
- [ ] T050 [P] [US2] Create integration test for bird detail page navigation in frontend/tests/integration/test-bird-detail-navigation.test.ts validating click-to-detail and back-button workflows
- [ ] T051 [P] [US2] Create React component test for BirdDetail in frontend/tests/components/test-BirdDetail.test.tsx verifying all fields render correctly (images, field marks, similar species)

### Implementation for User Story 2

- [ ] T052 [P] [US2] Create BirdImage entity model in backend/src/models/BirdImage.ts with validation (valid HTTPS URLs, required photographer/license per CC BY-NC-SA)
- [ ] T053 [US2] Extend BirdService in backend/src/services/BirdService.ts with getBirdDetail() method returning full bird data with images and similar species
- [ ] T054 [US2] Implement GET /api/v1/birds/:id endpoint in backend/src/api/routes/birds.ts calling BirdService.getBirdDetail() with 404 handling
- [ ] T055 [P] [US2] Create BirdDetail React component in frontend/src/components/BirdDetail.tsx displaying full species information (taxonomy, size, habitat, range, plumage variations, images with photographer attribution, 3-5 similar species)
- [ ] T056 [P] [US2] Create SimilarSpecies React component in frontend/src/components/SimilarSpecies.tsx showing 3-5 related species with thumbnails and comparison tips based on visual similarity
- [ ] T057 [US2] Create useBirdDetail custom hook in frontend/src/hooks/useBirdDetail.ts using TanStack Query to call GET /birds/:id with caching
- [ ] T058 [US2] Create BirdDetailPage component in frontend/src/pages/BirdDetailPage.tsx composing BirdDetail and SimilarSpecies with URL parameter handling (/birds/:id route)
- [ ] T059 [US2] Add click handler to BirdCard component in frontend/src/components/BirdCard.tsx to navigate to BirdDetailPage using React Router
- [ ] T060 [US2] Add responsive CSS for bird detail page in frontend/src/styles/ ensuring image gallery works on mobile and desktop

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - full search-to-detail workflow functional

---

## Phase 5: User Story 4 - No Results Handling (Priority: P2)

**Goal**: When users search for impossible combinations or make typos, provide helpful guidance rather than empty results.

**Independent Test**: User enters invalid or impossible descriptions (e.g., "purple eagle with six wings", "blu jay") and receives constructive feedback with suggested corrections.

### Tests for User Story 4 (TDD - WRITE FIRST, ENSURE FAIL)

- [ ] T061 [P] [US4] Create integration test for zero results handling in backend/tests/integration/test-zero-results.test.ts validating helpful messages for impossible queries
- [ ] T062 [P] [US4] Create integration test for typo correction in backend/tests/integration/test-typo-correction.test.ts validating "Did you mean?" suggestions for common bird names
- [ ] T063 [P] [US4] Create React component test for ErrorMessage in frontend/tests/components/test-ErrorMessage.test.tsx verifying helpful error states display correctly

### Implementation for User Story 4

- [ ] T064 [P] [US4] Implement typo correction utility in backend/src/utils/typoCorrection.ts using Levenshtein distance (max edit distance: 2 characters) for common bird names only (pre-defined dictionary of ~500 common names like "blue jay", "robin", "cardinal"); descriptive words passed to semantic search as-is per FR-008
- [ ] T065 [US4] Extend SearchService in backend/src/services/SearchService.ts to handle zero results: check for typos, generate helpful messages based on query characteristics
- [ ] T066 [US4] Update POST /api/v1/search endpoint in backend/src/api/routes/search.ts to return optional "message" field for zero results or ambiguous queries (per OpenAPI schema)
- [ ] T067 [P] [US4] Create ErrorMessage React component in frontend/src/components/shared/ErrorMessage.tsx displaying constructive error messages with suggestions
- [ ] T068 [US4] Update SearchResults component in frontend/src/components/SearchResults.tsx to display ErrorMessage for zero results with helpful guidance (per FR-007)
- [ ] T069 [US4] Add ambiguity indicator to SearchResults component displaying "Many birds match this description" message when appropriate

**Checkpoint**: All error handling complete - users receive helpful guidance for failed searches

---

## Phase 6: User Story 3 - Refine Search from Results (Priority: P3)

**Goal**: Users can refine their search by adding more details (e.g., "with yellow belly", "seen in California") without starting over, with previous context preserved.

**Independent Test**: User can modify their initial query (e.g., "red bird" → "red bird with crest") and receive updated results reflecting additional criteria. Search history visible in interface.

### Tests for User Story 3 (TDD - WRITE FIRST, ENSURE FAIL)

- [ ] T070 [P] [US3] Create integration test for search refinement in frontend/tests/integration/test-search-refinement.test.ts validating query modification updates results correctly
- [ ] T071 [P] [US3] Create React component test for SearchHistory in frontend/tests/components/test-SearchHistory.test.tsx verifying previous queries display and are clickable

### Implementation for User Story 3

- [ ] T072 [P] [US3] Create SearchHistory React component in frontend/src/components/SearchHistory.tsx displaying recent queries with click-to-rerun functionality
- [ ] T073 [US3] Update useSearch hook in frontend/src/hooks/useSearch.ts to maintain search history in React Query cache (last 5 queries)
- [ ] T074 [US3] Update HomePage component in frontend/src/pages/HomePage.tsx to integrate SearchHistory component below SearchBox
- [ ] T075 [US3] Update SearchBox component in frontend/src/components/SearchBox.tsx to preserve previous query text when refining (pre-populate input)
- [ ] T076 [US3] Add visual indicator in SearchResults component showing when results are filtered/refined from broader search
- [ ] T076b [P] Create Footer component in frontend/src/components/shared/Footer.tsx displaying taxonomy version and last-update date (fetches from GET /api/v1/taxonomy per FR-016)

**Checkpoint**: All user stories complete - full feature functionality delivered

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality gates

- [ ] T077 [P] Add comprehensive API documentation in docs/api.md based on contracts/api.openapi.yml
- [ ] T078 [P] Create user guide in docs/user-guide.md with screenshots of search and detail workflows
- [ ] T079 [P] Add database backup and restore scripts in database/scripts/ for taxonomy updates
- [ ] T080 [P] Implement accessibility improvements: ARIA labels, keyboard navigation for search box and result cards (WCAG 2.1 Level A per NFR)
- [ ] T081 [P] Add alt text for all bird images in BirdCard and BirdDetail components (per accessibility requirements)
- [ ] T082 [P] Verify color contrast ratios meet WCAG standards across all UI components
- [ ] T083 Run full security audit: verify XSS prevention, test rate limiting, validate input sanitization across all endpoints
- [ ] T084 Run performance benchmarking: validate <3s search response time and <2s initial page load (SC-001, SC-004)
- [ ] T085 Run scale testing: validate 10 concurrent users without >10% degradation for MVP (SC-007); document path to 100 concurrent users for production
- [ ] T086 Run constitution compliance audit: verify all 5 principles satisfied (natural language first, accurate taxonomy, TDD, observability, API first)
- [ ] T087 Execute quickstart.md validation: fresh developer follows guide, completes setup, runs tests, sees working application in <10 minutes
- [ ] T088 [P] Code cleanup: remove commented code, consolidate duplicate utilities, refactor long functions
- [ ] T089 [P] Add JSDoc comments to all public functions in backend services and utilities
- [ ] T090 Update README.md with feature description, setup instructions, and link to quickstart.md
- [ ] T091 Create DEPLOYMENT.md with production deployment checklist (environment variables, database migrations, monitoring setup)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
  - **User Story 1 (P1)** [Phase 3]: Can start after Foundational - NO dependencies on other stories
  - **User Story 2 (P2)** [Phase 4]: Can start after Foundational - Integrates with US1 but independently testable
  - **User Story 4 (P2)** [Phase 5]: Can start after Foundational - Extends US1 search behavior
  - **User Story 3 (P3)** [Phase 6]: Can start after Foundational - Enhances US1 search interface
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation only - Core search capability, no story dependencies
- **User Story 2 (P2)**: Foundation only - Extends search with detail view, clicks from US1 results but independently testable
- **User Story 4 (P2)**: Foundation only - Error handling for US1 search flow
- **User Story 3 (P3)**: Foundation only - Search refinement for US1, but independently testable

**NOTE**: All user stories designed to be independently testable. US2, US4, US3 enhance US1 but don't break it if removed.

### Within Each User Story

1. **Tests FIRST** (TDD per Constitution Principle III):
   - Write all test tasks for the story
   - Run tests → ALL MUST FAIL (no implementation exists yet)
2. **Models** before services (data structures first)
3. **Services** before endpoints/UI (business logic before interfaces)
4. **Backend endpoints** before frontend integration (API contract stable)
5. **Frontend components** after API ready (consume stable endpoints)
6. **Integration** last (wire everything together)

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T002, T003 (backend/frontend init)
- T004, T005, T006, T007, T009 (dependencies and config)

**Foundational Phase (Phase 2)**:
- After T010-T016 (database setup) complete:
  - T017, T018, T019, T020 (middleware)
  - T022, T023, T024, T025 (shared types and frontend setup)

**User Story 1 (Phase 3)**:
- All tests (T026-T031) in parallel
- Models (T032, T033, T034) in parallel
- Utilities (T035, T036) in parallel
- Frontend components (T042, T043, T047) in parallel after hooks ready

**User Story 2 (Phase 4)**:
- All tests (T049-T051) in parallel
- Components (T055, T056) in parallel

**User Story 4 (Phase 5)**:
- Tests (T061-T063) in parallel
- T064 and T067 in parallel (utility and component)

**User Story 3 (Phase 6)**:
- Tests (T070-T071) in parallel
- T072 and T075 in parallel (different components)

**Polish Phase (Phase 7)**:
- Documentation (T077-T079) in parallel
- Accessibility (T080-T082) in parallel
- T088, T089 in parallel

**CRITICAL**: Once Foundational phase completes, ALL user stories (US1, US2, US4, US3) can be worked on in parallel by different team members since they're independently testable.

---

## Parallel Example: User Story 1

After Foundation phase completes, launch all US1 tests together:

```bash
# Terminal 1: Contract test for search endpoint
Task T026: Create contract test for POST /api/v1/search

# Terminal 2: Integration test for search relevance (20 curated queries)
Task T027: Create integration test for search relevance

# Terminal 3: Integration test for search performance
Task T028: Create integration test for search performance

# Terminal 4: Unit test for SearchService
Task T029: Create unit test for SearchService.search()

# Terminal 5: React component test for SearchBox
Task T030: Create React component test for SearchBox

# Terminal 6: React component test for SearchResults
Task T031: Create React component test for SearchResults
```

All tests FAIL (expected - no implementation yet). Now implement in dependency order:

```bash
# Parallel: Models (different files)
Task T032: Create Bird entity model
Task T033: Create SearchQuery entity model
Task T034: Create TaxonomyMetadata entity model

# Parallel: Utilities (different files)
Task T035: Implement OpenAI embeddings wrapper
Task T036: Implement cosine similarity function

# Sequential: Services (depend on T035, T036)
Task T037: Implement SearchService (uses T035, T036)
Task T038: Implement BirdService
Task T039: Implement LoggingService

# Sequential: Backend endpoints (depend on services)
Task T040: Implement POST /api/v1/search (uses T037, T039)
Task T041: Implement GET /api/v1/taxonomy

# Parallel: Frontend components (after hooks ready)
Task T042: Create SearchBox component
Task T043: Create BirdCard component
Task T047: Create Loading spinner
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) 🎯

**Recommended for initial delivery:**

1. Complete Phase 1: Setup (T001-T009) → ~1-2 days
2. Complete Phase 2: Foundational (T010-T025) → ~3-4 days
3. Complete Phase 3: User Story 1 (T026-T048) → ~5-7 days
4. **STOP and VALIDATE**: Run all tests, verify 90% accuracy on 20 curated queries, test browser back button
5. Deploy MVP and gather user feedback

**Total MVP: ~9-13 days for a single developer**

### Incremental Delivery

1. **Foundation** (Phases 1-2) → Foundation ready
2. **MVP Release** (Phase 3) → User Story 1 complete → Deploy/Demo 🚀
3. **Enhancement 1** (Phase 4) → Add User Story 2 → Deploy/Demo 🚀
4. **Enhancement 2** (Phase 5) → Add User Story 4 → Deploy/Demo 🚀
5. **Enhancement 3** (Phase 6) → Add User Story 3 → Deploy/Demo 🚀
6. **Polish** (Phase 7) → Final quality gates → Production Ready 🚀

### Parallel Team Strategy

With 3-4 developers after Foundational phase completes:

- **Developer A**: User Story 1 (T026-T048) - Core search [Priority P1]
- **Developer B**: User Story 2 (T049-T060) - Bird details [Priority P2]
- **Developer C**: User Story 4 (T061-T069) - Error handling [Priority P2]
- **Developer D**: User Story 3 (T070-T076) - Search refinement [Priority P3]

All stories complete in parallel, integrate seamlessly (independently testable design).

---

## Task Summary

- **Total Tasks**: 91
- **Setup Phase**: 9 tasks (T001-T009)
- **Foundational Phase**: 16 tasks (T010-T025) - BLOCKS all user stories
- **User Story 1 (P1)**: 23 tasks (T026-T048) - MVP core search
- **User Story 2 (P2)**: 12 tasks (T049-T060) - Bird detail view
- **User Story 4 (P2)**: 9 tasks (T061-T069) - Error handling
- **User Story 3 (P3)**: 7 tasks (T070-T076) - Search refinement
- **Polish Phase**: 15 tasks (T077-T091) - Cross-cutting concerns

**Parallel Opportunities**: 35+ tasks marked [P] can run in parallel within their phase

**Independent Test Criteria**:
- **US1**: User can search and see results; 90% accuracy on 20 curated queries; <3s response time
- **US2**: User can click results and view details; browser back button works
- **US4**: User receives helpful messages for failed searches; typos corrected
- **US3**: User can refine searches; history preserved and visible

**MVP Scope (Recommended)**: Phases 1-3 only (T001-T048) = 48 tasks for initial deployment

**Constitution Compliance**: All 5 principles validated:
- ✅ **Principle I**: Natural language first (FR-001, SearchBox accepts plain text)
- ✅ **Principle II**: Accurate taxonomy (eBird data, Macaulay Library images)
- ✅ **Principle III**: TDD (all tests written first, 90% accuracy requirement)
- ✅ **Principle IV**: Observability (LoggingService tracks all queries per FR-015)
- ✅ **Principle V**: API First (RESTful endpoints, React UI consumes API)

---

## Notes

- All tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- Tests MUST be written first and FAIL before implementation per Constitution Principle III
- 20 curated test queries are defined in research.md and MUST achieve 90% top-3 accuracy (SC-002)
- Database seeding scripts (T013-T016) are one-time setup but must be repeatable for taxonomy updates
- Each user story is independently completable and testable - can ship US1 alone as MVP
- Avoid premature optimization - focus on constitution compliance and correctness first
- Commit after each task or logical group for easy rollback
- Stop at any checkpoint to validate story independently before proceeding

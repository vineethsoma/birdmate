# Story Delegation: Foundation Phase (T001-T025)

**Assigned To**: Fullstack Engineer Agent  
**Story Title**: Project Foundation & Core Infrastructure  
**Priority**: P0 (Blocking - all user stories depend on this)  
**Estimated Effort**: 4-6 hours  

---

## Context

This is the foundational phase for the **Natural Language Bird Search Interface** feature. The feature enables birdwatchers to identify bird species through natural language descriptions.

**You are building the infrastructure that ALL subsequent user stories depend on.** Nothing else can proceed until this phase is complete.

---

## Acceptance Criteria

### Phase 1: Setup (T001-T009)
- [ ] Root project structure created with `backend/`, `frontend/`, `shared/`, `database/` directories
- [ ] Backend initialized: Node.js + TypeScript + Vite/Vitest configured (strict mode)
- [ ] Frontend initialized: React + TypeScript + Vite/Vitest configured (strict mode)
- [ ] Backend dependencies installed: express, openai (^4.73.0), better-sqlite3, vitest (^2.1.0), dotenv
- [ ] Frontend dependencies installed: react (^18.3.0), react-router-dom (^6.28.0), @tanstack/react-query (^5.62.0), vitest, @testing-library/react (^16.0.0)
- [ ] Shared types directory created with TypeScript interfaces exported
- [ ] ESLint + Prettier configured for both projects
- [ ] `.env.example` files created with required variables
- [ ] `.gitignore` properly excludes node_modules, .env, database files

### Phase 2: Foundational Infrastructure (T010-T025)
- [ ] Database schema created in `database/schema.sql` with tables: birds, bird_images, search_queries, search_results, taxonomy_metadata
- [ ] Migration framework in `backend/src/db/migrations/`
- [ ] SQLite client wrapper with connection pooling in `backend/src/db/client.ts`
- [ ] eBird taxonomy download script in `backend/src/db/seeds/download-taxonomy.ts`
- [ ] Taxonomy seeding script in `backend/src/db/seeds/seed-taxonomy.ts` (filter North America, 500-1000 species)
- [ ] Macaulay Library image fetching script in `backend/src/db/seeds/fetch-images.ts`
- [ ] OpenAI embeddings generation script in `backend/src/db/seeds/generate-embeddings.ts`
- [ ] Logging service in `backend/src/utils/logging.ts` (structured JSON logging)
- [ ] Input sanitization middleware in `backend/src/api/middleware/sanitize.ts` (XSS prevention)
- [ ] Error handling middleware in `backend/src/api/middleware/errorHandler.ts`
- [ ] Rate limiting middleware in `backend/src/api/middleware/rateLimit.ts`
- [ ] Express server setup in `backend/src/server.ts` with CORS and middleware stack
- [ ] Shared TypeScript types in `shared/types/index.ts` matching OpenAPI schema
- [ ] React Router configured in `frontend/src/App.tsx` (home, bird detail routes)
- [ ] TanStack Query provider configured in `frontend/src/App.tsx`
- [ ] API client wrapper in `frontend/src/services/apiClient.ts`

---

## Dependencies

**Requires** (must be complete first):
- None - this is the first phase

**Blocks** (waiting on this):
- US1: Basic Natural Language Search (23 tasks)
- US2: View Detailed Bird Information (12 tasks)
- US4: No Results Handling (9 tasks)
- US3: Refine Search from Results (7 tasks)
- Polish Phase (14 tasks)

---

## Technical Details

**Branch**: `001-bird-search-ui` (current feature branch)
**Working Directory**: `/Users/vineethsoma/workspaces/ai/birdmate/`

### Files to Create

**Backend:**
```
backend/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── src/
│   ├── server.ts
│   ├── db/
│   │   ├── client.ts
│   │   ├── migrations/
│   │   │   └── 001_initial_schema.ts
│   │   └── seeds/
│   │       ├── download-taxonomy.ts
│   │       ├── seed-taxonomy.ts
│   │       ├── fetch-images.ts
│   │       └── generate-embeddings.ts
│   ├── api/
│   │   └── middleware/
│   │       ├── sanitize.ts
│   │       ├── errorHandler.ts
│   │       └── rateLimit.ts
│   └── utils/
│       └── logging.ts
```

**Frontend:**
```
frontend/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── .env.example
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── services/
│       └── apiClient.ts
```

**Shared:**
```
shared/
├── package.json
├── tsconfig.json
└── types/
    └── index.ts
```

**Database:**
```
database/
└── schema.sql
```

---

## Key Specifications

### Database Schema (from data-model.md)

```sql
-- Core tables required
CREATE TABLE birds (
    id TEXT PRIMARY KEY,              -- eBird species code
    common_name TEXT NOT NULL,
    scientific_name TEXT NOT NULL,
    family TEXT,
    description TEXT,                 -- Rich text for semantic search
    embedding BLOB,                   -- 1536-dim vector (OpenAI)
    size_min_cm REAL,
    size_max_cm REAL,
    habitat TEXT,
    range TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bird_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bird_id TEXT REFERENCES birds(id),
    url TEXT NOT NULL,
    photographer TEXT,
    license TEXT DEFAULT 'CC BY-NC-SA',
    is_primary BOOLEAN DEFAULT FALSE
);

CREATE TABLE search_queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_text TEXT NOT NULL,
    query_embedding BLOB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    top_results TEXT                  -- JSON array of bird IDs
);

CREATE TABLE taxonomy_metadata (
    id INTEGER PRIMARY KEY,
    version TEXT NOT NULL,
    source TEXT DEFAULT 'eBird',
    updated_at TIMESTAMP
);
```

### Shared Types (from OpenAPI)

```typescript
export interface Bird {
    id: string;                       // eBird code
    commonName: string;
    scientificName: string;
    family?: string;
    description?: string;
    sizeRange?: { min: number; max: number };
    habitat?: string;
    range?: string;
    images?: BirdImage[];
}

export interface BirdImage {
    id: number;
    url: string;
    photographer?: string;
    license: string;
    isPrimary: boolean;
}

export interface SearchQuery {
    query: string;
    limit?: number;  // default 10
}

export interface SearchResult {
    bird: Bird;
    score: number;
    matchedFeatures?: string[];
}

export interface SearchResponse {
    query: string;
    results: SearchResult[];
    message?: string;  // for zero results or ambiguity
    total: number;
}

export interface TaxonomyMetadata {
    version: string;
    source: string;
    updatedAt: string;
}
```

### Environment Variables

**Backend (.env.example):**
```
OPENAI_API_KEY=sk-your-key-here
DATABASE_PATH=./database/birdmate.db
PORT=3001
NODE_ENV=development
```

**Frontend (.env.example):**
```
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

---

## Standards

### Constitution Compliance
- **Principle I**: Natural language input (no query syntax)
- **Principle II**: eBird taxonomy as authoritative source
- **Principle III**: TDD workflow (write tests first)
- **Principle IV**: Structured logging for all operations
- **Principle V**: API-first design, simple embedded database

### Code Quality
- TypeScript strict mode (zero errors)
- All functions documented with JSDoc
- Error messages include context
- Logging uses structured JSON format

### Testing
- Vitest configured for both backend and frontend
- Test scripts in package.json: `npm test`, `npm run test:watch`
- Tests validate database schema, middleware, and API client

---

## Communication

- Report progress after completing Phase 1 (setup)
- Report completion after Phase 2 (infrastructure)
- Flag blockers immediately (especially OpenAI API or Macaulay Library access issues)

---

## Validation Checklist

Before marking complete:
- [ ] `npm install` works in both backend and frontend
- [ ] `npm run build` compiles without TypeScript errors
- [ ] `npm test` runs (tests may be empty placeholders)
- [ ] Database schema creates successfully
- [ ] Server starts and responds to health check
- [ ] Frontend dev server starts and renders React app
- [ ] Shared types import correctly in both projects
- [ ] All middleware registered and logging works

---

**Start implementing now. Report progress after Phase 1 completion.**

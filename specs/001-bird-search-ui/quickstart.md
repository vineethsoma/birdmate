# Quickstart Guide: Natural Language Bird Search Interface

**Feature Branch**: `001-bird-search-ui`  
**Target Audience**: Developers implementing this feature  
**Prerequisites**: Node.js 20.x, npm/pnpm, Git

---

## 📦 Quick Setup (5 minutes)

### 1. Clone and Install Dependencies

```bash
git checkout 001-bird-search-ui

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Set Environment Variables

Create `backend/.env`:
```bash
# OpenAI API (required for semantic search)
OPENAI_API_KEY=sk-...

# Database
DATABASE_PATH=./database/birdmate.db  # SQLite for MVP
NODE_ENV=development

# Server
PORT=3000
CORS_ORIGIN=http://localhost:5173  # Vite dev server
```

Create `frontend/.env`:
```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 3. Seed Database with Bird Data

```bash
cd backend

# Download eBird taxonomy
npm run download:taxonomy

# Seed database with North American birds
npm run db:seed

# Generate embeddings for all bird descriptions (one-time, ~5 min)
npm run embeddings:generate
```

Expected output:
```
✓ Downloaded eBird taxonomy v2023.1
✓ Imported 847 North American bird species
✓ Fetched images for 847 species from Macaulay Library
✓ Generated embeddings for 847 bird descriptions
✓ Database ready at ./database/birdmate.db
```

### 4. Run Development Servers

```bash
# Terminal 1: Backend API
cd backend
npm run dev
# → API running at http://localhost:3000

# Terminal 2: Frontend UI
cd frontend
npm run dev
# → UI running at http://localhost:5173
```

### 5. Verify Setup

Open browser to `http://localhost:5173`

Try these test queries:
- `blue jay` → Should show Blue Jay in top 3
- `red chest with grey back` → Should show American Robin #1
- `small brown bird` → Should show House Sparrow, Song Sparrow, etc.

---

## 🧪 Running Tests

### Backend Integration Tests (Constitution Principle III)

```bash
cd backend
npm run test

# Run specific test suite
npm run test:search  # 20 curated query tests
npm run test:api     # API endpoint tests
npm run test:models  # Data model validation

# Run with coverage
npm run test:coverage
```

Expected test output:
```
✓ Search Relevance (20 curated queries)
  ✓ should find Blue Jay for "blue jay"
  ✓ should find American Robin for "red chest with grey back"
  ...
  ✓ 18/20 queries pass (90% accuracy - meets SC-002)

✓ API Endpoints
  ✓ POST /search returns 200 with results
  ✓ GET /birds/:id returns bird details
  ...
```

### Frontend Component Tests

```bash
cd frontend
npm run test

# Run specific component
npm run test SearchBox
npm run test BirdCard
```

---

## 🏗️ Architecture Overview

### Request Flow

```
User Query → Frontend → Backend API → OpenAI Embeddings → SQLite → Results
     ↓
"red chest grey back"
     ↓
React SearchBox component
     ↓
POST /api/v1/search { query: "..." }
     ↓
SearchService.search()
     ↓
OpenAI text-embedding-3-small (generates vector)
     ↓
SQLite cosine similarity query
     ↓
Top 5-10 birds ranked by score
     ↓
JSON response with bird cards
     ↓
React displays BirdCard components
```

### Directory Structure

```
backend/src/
├── api/
│   ├── routes/
│   │   ├── search.ts       # POST /search endpoint
│   │   ├── birds.ts        # GET /birds/:id endpoint
│   │   └── taxonomy.ts     # GET /taxonomy endpoint
│   └── middleware/
│       ├── sanitize.ts     # XSS prevention (FR-014)
│       ├── rateLimit.ts    # Rate limiting
│       └── errorHandler.ts # Centralized error handling
├── services/
│   ├── SearchService.ts    # Core search logic + embeddings
│   ├── BirdService.ts      # Bird data retrieval
│   └── LoggingService.ts   # Query logging (FR-015)
├── models/
│   ├── Bird.ts             # Bird entity + validation
│   ├── SearchQuery.ts      # Query logging entity
│   └── TaxonomyMetadata.ts # Version tracking
├── db/
│   ├── client.ts           # SQLite client wrapper
│   ├── migrations/         # Schema versions
│   └── seeds/              # Data import scripts
└── utils/
    ├── embeddings.ts       # OpenAI API wrapper
    └── similarity.ts       # Cosine distance function

frontend/src/
├── components/
│   ├── SearchBox.tsx       # Input + submit button
│   ├── SearchResults.tsx   # Grid of bird cards
│   ├── BirdCard.tsx        # Individual result card
│   ├── BirdDetail.tsx      # Full species page
│   └── shared/
│       ├── Loading.tsx     # Spinner (FR-012)
│       └── ErrorMessage.tsx # Error states (FR-007)
├── pages/
│   ├── HomePage.tsx        # Search interface
│   └── BirdDetailPage.tsx  # Detail view
├── hooks/
│   ├── useSearch.ts        # TanStack Query for search
│   └── useBirdDetail.ts    # TanStack Query for details
├── services/
│   └── api.ts              # HTTP client (fetch wrapper)
└── types/
    └── index.ts            # Shared TypeScript interfaces
```

---

## 🔑 Key Implementation Patterns

### 1. Semantic Search (Backend)

```typescript
// backend/src/services/SearchService.ts
import OpenAI from 'openai';
import { db } from '../db/client';

export class SearchService {
  private openai: OpenAI;

  async search(queryText: string, limit: number = 10): Promise<BirdSearchResult[]> {
    // 1. Generate query embedding
    const embedding = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: queryText
    });

    // 2. Find similar birds (cosine similarity)
    const results = await db.query(`
      SELECT 
        b.*,
        (1 - cosine_distance(b.embedding, ?)) as similarity_score
      FROM birds b
      WHERE similarity_score > 0.5
      ORDER BY similarity_score DESC
      LIMIT ?
    `, [embedding.data[0].embedding, limit]);

    // 3. Log query (FR-015 audit trail)
    await this.logQuery(queryText, embedding, results);

    return results;
  }
}
```

### 2. URL-Based State (Frontend)

```typescript
// frontend/src/pages/HomePage.tsx
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const { data, isLoading, error } = useSearch(query);

  const handleSearch = (newQuery: string) => {
    setSearchParams({ q: newQuery }); // Updates URL, triggers search
  };

  return (
    <div>
      <SearchBox onSearch={handleSearch} initialValue={query} />
      {isLoading && <Loading />}
      {error && <ErrorMessage message={error.message} />}
      {data && <SearchResults birds={data.results} />}
    </div>
  );
}
```

### 3. Input Sanitization (Security)

```typescript
// backend/src/api/middleware/sanitize.ts
import validator from 'validator';

export function sanitizeSearchQuery(req, res, next) {
  const { query } = req.body;

  // FR-014: XSS prevention
  if (!validator.isLength(query, { min: 1, max: 500 })) {
    return res.status(400).json({
      error: 'Invalid query',
      message: 'Query must be 1-500 characters',
      code: 'INVALID_QUERY'
    });
  }

  req.body.query = validator.escape(query);
  next();
}
```

---

## 📊 Database Schema Quick Reference

```sql
-- Bird species (core entity)
CREATE TABLE birds (
  id INTEGER PRIMARY KEY,
  ebird_code TEXT UNIQUE NOT NULL,
  common_name TEXT NOT NULL,
  scientific_name TEXT NOT NULL,
  family TEXT,
  description TEXT,
  embedding BLOB,  -- JSON array for SQLite
  field_marks TEXT, -- JSON array
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bird images (from Macaulay Library)
CREATE TABLE bird_images (
  id INTEGER PRIMARY KEY,
  bird_id INTEGER REFERENCES birds(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  photographer TEXT NOT NULL,
  license_code TEXT NOT NULL
);

-- Search query logs (audit trail)
CREATE TABLE search_logs (
  id INTEGER PRIMARY KEY,
  query_text TEXT NOT NULL,
  query_embedding BLOB,
  top_results TEXT,  -- JSON array of bird IDs
  response_time INTEGER,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Taxonomy version
CREATE TABLE taxonomy_metadata (
  version TEXT PRIMARY KEY,
  release_date DATE,
  imported_at TIMESTAMP,
  species_count INTEGER
);
```

---

## 🐛 Common Issues & Solutions

### Issue: "OpenAI API key invalid"
**Solution**: Verify `.env` has correct `OPENAI_API_KEY`. Get key from https://platform.openai.com/api-keys

### Issue: "No results for any query"
**Solution**: Ensure embeddings are generated and sqlite-vss extension is loaded:
```bash
cd backend
npm run embeddings:generate
# Verify vss extension loaded in logs
```

### Issue: "sqlite-vss module not found"
**Solution**: Install vector search extension:
```bash
cd backend
npm install sqlite-vss better-sqlite3
# Rebuild native extensions
npm rebuild
```

### Issue: "Images not loading"
**Solution**: Macaulay Library API rate limit (100 req/min). Wait or use cached data.

### Issue: "Tests failing with 'American Robin' not found"
**Solution**: Database not seeded:
```bash
cd backend
npm run db:seed
```

### Issue: "Frontend can't connect to backend"
**Solution**: Check CORS settings in `backend/src/api/server.ts`:
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
```

---

## 📈 Performance Optimization Tips

1. **Cache embeddings**: Pre-compute during seeding (not at query time)
2. **Index similarity scores**: Add SQLite index on embedding column
3. **Image lazy loading**: Use React `loading="lazy"` for thumbnails
4. **Query debouncing**: Add 300ms delay to search input
5. **Result pagination**: Future enhancement (MVP returns 5-10 max)

---

## 🚀 Next Steps

1. ✅ Verify all tests pass: `npm run test` (backend + frontend)
2. ✅ Test 20 curated queries meet 90% accuracy (SC-002)
3. ✅ Run XSS security scan: `npm run security:check`
4. ✅ Build production bundle: `npm run build`
5. Deploy to cloud (deferred - see constitution for options)

---

## 📚 API Documentation

Full API docs: [contracts/api.openapi.yml](contracts/api.openapi.yml)

Quick reference:
- `POST /api/v1/search` - Search birds by natural language
- `GET /api/v1/birds/:id` - Get bird details
- `GET /api/v1/taxonomy` - Get taxonomy version

Try interactive docs: http://localhost:3000/api-docs (Swagger UI)

---

## ✅ Formal Verification Loop

Taxonomy and search invariants are executable. The spec is read-only for agents; verifiers check the implementation against it.

| Piece | Location |
|-------|----------|
| Ontology (species, families, names, ambiguity) derived from `database/ebird-taxonomy.csv` | `formal/ontology.ts` |
| Invariants (search, audit trail, API contract, data) | `formal/invariants.ts` |
| Verifiers (Vitest + fast-check) | `backend/verify/` |
| Claude Code hooks and verifier subagent | `.claude/settings.json`, `.claude/hooks/`, `.claude/agents/verifier.md` |
| CI gate + optional Claude repair job | `.github/workflows/ci.yml` (`formal-verification`, `repair`) |

```bash
cd backend
npm run verify:fast                  # types + HTTP contract (seconds)
npm run verify:all                   # types, data, contract, property tests (100 runs)
npm run verify:all -- --runs 2000    # deeper (CI default)
npm run verify:pbt                   # or verify:types | verify:data | verify:contract
```

Verifiers need no network or API key: embeddings are replaced by a deterministic offline stand-in, and the tracked
SQLite DB is copied to a temp dir first, so `backend/database/*.db` is never modified.

On failure you get the violated invariant, its constitution principle and a shrunk counterexample:

```
❌ ambiguityFlagged violated (principle II): a query mentioning an ambiguous common name ...
   query:   "robin john.doe@example.com"
   results: [giacou1 (0.98), ...]
   message: undefined
```

**Claude Code behavior:** edits to the spec directory and `.claude/hooks` are blocked (PreToolUse); `verify:fast` runs
after each source edit (PostToolUse); a turn cannot end while `verify:all` fails (Stop; 3 retries, then CI is the backstop).
Tune with `BIRDMATE_VERIFY_RUNS` and `BIRDMATE_VERIFY_MAX_RETRIES`.

**Changing the spec:** edit it by hand in a PR; `CODEOWNERS` requires maintainer approval. A new invariant added to
`searchInvariants`, `auditInvariants`, `errorInvariants` or `dataInvariants` is picked up by the verifiers automatically.

**Repair job:** set repo variable `CLAUDE_REPAIR_ENABLED=true` and secret `ANTHROPIC_API_KEY` to let CI ask Claude to fix a failing PR.
Make **CI Success** a required status check so failures block merge.

---

**Questions?** Review [spec.md](spec.md), [data-model.md](data-model.md), or [research.md](research.md).

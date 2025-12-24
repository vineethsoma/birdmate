# Research: Natural Language Bird Search Interface

**Phase**: 0 (Outline & Research)  
**Branch**: `001-bird-search-ui`  
**Date**: 2025-12-23

## Research Tasks

This document resolves all "NEEDS CLARIFICATION" items from Technical Context and provides best practices for key technologies.

## 1. OpenAI Embeddings for Semantic Bird Search

### Decision
Use **OpenAI text-embedding-3-small** model for generating embeddings of both user queries and bird descriptions.

### Rationale
- **Cost-effective**: $0.02 per 1M tokens (~$0.0002 per bird description, ~$0.00001 per query)
- **Performance**: 1536-dimension vectors, excellent for semantic similarity
- **API simplicity**: No model training, hosting, or GPU infrastructure required
- **Natural language understanding**: Handles descriptive queries like "red chest with grey back" better than keyword matching
- **Proven for search**: Widely used for semantic search applications

### Implementation Approach
1. **Pre-compute embeddings** for all bird species descriptions during database seeding
2. **Generate query embedding** at search time (< 200ms typical latency)
3. **Cosine similarity** to rank birds by relevance to query
4. **Cache results** in SQLite alongside bird records

### Alternatives Considered
- **Self-hosted Sentence Transformers**: Requires ML infrastructure, GPU for acceptable performance. Rejected for MVP due to complexity (violates constitution principle V).
- **Keyword matching only**: Poor handling of synonyms and natural language. Rejected due to accuracy concerns (violates principle I).
- **Hybrid (keywords + embeddings)**: Added complexity for uncertain benefit. Deferred to post-MVP iteration.

### Code Pattern Example (TypeScript)
```typescript
// Backend service
import OpenAI from 'openai';

async function searchBirds(queryText: string): Promise<BirdSearchResult[]> {
  // 1. Generate query embedding
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: queryText
  });
  
  // 2. Find similar birds using cosine similarity
  const results = await db.query(`
    SELECT b.*, 
           (1 - (embedding <=> $1)) as similarity
    FROM birds b
    ORDER BY similarity DESC
    LIMIT 10
  `, [embedding.data[0].embedding]);
  
  return results;
}
```

### Dependencies
- `openai` (^4.73.0 - latest official SDK)
- `@langchain/openai` (optional - if using LangChain abstractions)
- Vector storage: SQLite with `sqlite-vss` extension (see Vector Store section below)
- Environment variable: `OPENAI_API_KEY`

---

## 2. Macaulay Library API Integration

### Decision
Use **Macaulay Library Media API** (Cornell Lab of Ornithology) for bird images.

### Rationale
- **Authoritative source**: Same organization as eBird taxonomy
- **High-quality images**: Scientifically verified, expert-reviewed
- **Multiple angles**: Breeding/non-breeding plumage, male/female, juvenile
- **CC BY-NC-SA licensing**: Free for non-commercial/educational use (matches MVP scope)
- **Rich metadata**: Species ID, photographer attribution, location, date

### Implementation Approach
1. **Batch fetch during seeding**: Query API for top 3-5 images per species
2. **Store image URLs** in database (avoid storage of actual image files)
3. **Display with attribution**: Show photographer credit per license requirements
4. **Fallback handling**: If API unavailable, show placeholder with species name

### API Endpoints
- Search media: `https://search.macaulaylibrary.org/api/v1/search?taxonCode={eBird_code}&mediaType=photo&count=5`
- Returns: JSON with image URLs, thumbnails, attribution, license info

### Alternatives Considered
- **Wikimedia Commons**: More permissive licensing (CC0/public domain available) but inconsistent quality and coverage. May revisit for commercial version.
- **Unsplash/stock photos**: Poor bird-specific coverage, generic images. Rejected due to lack of taxonomic accuracy.
- **Custom photo collection**: High licensing costs, curation effort. Not viable for MVP.

### Code Pattern Example (TypeScript)
```typescript
interface MacaulayImage {
  assetId: string;
  previewUrl: string;
  mediaUrl: string;
  commonName: string;
  scientificName: string;
  userDisplayName: string; // Photographer
  licenseCode: string; // e.g., "CC BY-NC-SA 4.0"
}

async function fetchBirdImages(eBirdCode: string): Promise<MacaulayImage[]> {
  const response = await fetch(
    `https://search.macaulaylibrary.org/api/v1/search?taxonCode=${eBirdCode}&mediaType=photo&count=5`
  );
  const data = await response.json();
  return data.results.content.map(/* map to MacaulayImage */);
}
```

### Dependencies
- No API key required for public access (rate limits apply: ~100 req/min)
- Consider caching/batch fetching to respect rate limits
- Store URLs in database to minimize API calls

---

## 3. eBird Taxonomy Data Acquisition

### Decision
Use **eBird Taxonomy v2023** (or latest at implementation) via CSV export from eBird Status & Trends.

### Rationale
- **Authoritative standard**: eBird is the global standard for bird taxonomy
- **Comprehensive coverage**: 10,000+ species globally, 1000+ North American
- **Regular updates**: Annual taxonomy updates (aligns with quarterly review cycle)
- **Free access**: CSV download available, no API key required
- **Structured format**: Species code, common name, scientific name, family, order

### Implementation Approach
1. **Download taxonomy CSV**: https://ebird.org/science/use-ebird-data/the-ebird-taxonomy
2. **Filter to North America**: Use region codes (e.g., country code US, CA, MX)
3. **Seed database**: Import into SQLite/PostgreSQL during setup
4. **Version tracking**: Store taxonomy version (e.g., "2023.1") in database metadata

### Data Structure
```csv
SPECIES_CODE,PRIMARY_COM_NAME,SCI_NAME,ORDER1,FAMILY,SPECIES_GROUP
amecro,American Crow,Corvus brachyrhynchos,Passeriformes,Corvidae,Crows and Jays
```

### Alternatives Considered
- **IOC World Bird List**: Alternative taxonomy standard, less US-focused. Rejected to align with Macaulay Library (which uses eBird codes).
- **Avibase**: Aggregates multiple taxonomies but adds complexity. Rejected for MVP simplicity.
- **Manual curation**: Not scalable, violates accuracy principle. Rejected.

### Code Pattern Example (TypeScript)
```typescript
// Database seeding script
import fs from 'fs';
import csv from 'csv-parser';

async function seedeBirdTaxonomy(filePath: string) {
  const birds: Bird[] = [];
  
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      if (isNorthAmerican(row.SPECIES_CODE)) {
        birds.push({
          code: row.SPECIES_CODE,
          commonName: row.PRIMARY_COM_NAME,
          scientificName: row.SCI_NAME,
          family: row.FAMILY,
          order: row.ORDER1
        });
      }
    })
    .on('end', async () => {
      await db.insertMany('birds', birds);
      await db.setMetadata('taxonomy_version', '2023.1');
      console.log(`Seeded ${birds.length} bird species`);
    });
}
```

---

## 4. React + TypeScript Best Practices for Search UI

### Decision
Use **React 18+ with TypeScript strict mode**, **TanStack Query** for API state, and **React Router 6** for navigation.

### Rationale
- **Type safety**: Strict TypeScript prevents runtime errors, catches API contract mismatches
- **Data fetching**: TanStack Query handles caching, loading states, error handling automatically
- **URL state**: React Router enables browser back button, shareable search URLs
- **Modern React**: Hooks-based, no class components, aligns with Vite tooling

### Component Architecture
```
<App>
  └─ <Router>
      ├─ <HomePage>
      │   ├─ <SearchBox>
      │   ├─ <SearchResults>
      │   │   └─ <BirdCard> (x5-10)
      │   └─ <LoadingSpinner>
      └─ <BirdDetailPage>
          ├─ <BirdHeader>
          ├─ <BirdImages>
          ├─ <BirdIdentification>
          └─ <SimilarSpecies>
```

### Key Patterns
1. **Custom hooks for data fetching**:
```typescript
function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => api.searchBirds(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000 // Cache 5 minutes
  });
}
```

2. **URL-based state management**:
```typescript
// In SearchBox component
const [searchParams, setSearchParams] = useSearchParams();
const query = searchParams.get('q') || '';

function handleSearch(newQuery: string) {
  setSearchParams({ q: newQuery });
}
```

3. **Responsive design with CSS Grid/Flexbox**:
```css
.bird-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}
```

### Dependencies
- `react` (^18.3.1 - stable; React 19 available but wait for ecosystem)
- `react-router-dom` (^6.28.0 - latest v6; v7 available but breaking changes)
- `@tanstack/react-query` (^5.62.0 - latest v5)
- `typescript` (^5.7.2 - latest)
- `vite` (^6.0.1 - latest)
- Testing: `vitest` (^2.1.8), `@testing-library/react` (^16.1.0), `@testing-library/user-event` (^14.5.2)

---

## 5. SQLite vs PostgreSQL for MVP Database

### Decision
Use **SQLite for MVP** with migration path to **PostgreSQL for production**.

### Rationale
- **SQLite advantages**:
  - Zero configuration: File-based database, no server required
  - Embedded: Ships with application, no external dependencies
  - Fast for < 1000 species and < 100 concurrent users
  - Perfect for development and MVP deployment
  
- **PostgreSQL migration path**:
  - `pgvector` extension for native vector similarity search
  - Better concurrency (> 100 users)
  - Horizontal scaling options
  - Production-ready for growth

### Implementation Strategy
1. **MVP Phase**: SQLite with custom similarity function (cosine distance in JavaScript)
2. **Production Migration**: PostgreSQL + pgvector when concurrent users > 50

### Schema Design (Portable SQL)
```sql
-- Works in both SQLite and PostgreSQL
CREATE TABLE birds (
  id INTEGER PRIMARY KEY,
  ebird_code TEXT UNIQUE NOT NULL,
  common_name TEXT NOT NULL,
  scientific_name TEXT NOT NULL,
  family TEXT,
  description TEXT, -- For embedding generation
  embedding BLOB, -- JSON array in SQLite, vector in PostgreSQL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bird_images (
  id INTEGER PRIMARY KEY,
  bird_id INTEGER REFERENCES birds(id),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  photographer TEXT,
  license TEXT
);

CREATE TABLE search_logs (
  id INTEGER PRIMARY KEY,
  query_text TEXT NOT NULL,
  query_embedding BLOB,
  top_results TEXT, -- JSON array of bird IDs
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Dependencies
- **SQLite**: `better-sqlite3` (Node.js binding)
- **PostgreSQL**: `pg` (node-postgres) + `pgvector` extension

---

## 6. Testing Strategy for Field-Validated Searches

### Decision
Implement **integration test suite with 20+ curated queries** from real birdwatcher scenarios.

### Rationale
- Satisfies constitution principle III (Test-First & Field-Validated)
- Ensures search relevance for common descriptions
- Validates semantic search against domain expert expectations

### Test Data Structure
```typescript
const curatedQueries: TestQuery[] = [
  {
    query: "blue jay",
    expectedInTop3: ["Blue Jay"],
    category: "common-name-exact"
  },
  {
    query: "red chest with grey back",
    expectedInTop3: ["American Robin"],
    category: "physical-description"
  },
  {
    query: "small brown bird",
    expectedInTop3: ["House Sparrow", "Song Sparrow", "House Finch"],
    category: "ambiguous-multi-match"
  },
  {
    query: "woodpecker with red head",
    expectedInTop3: ["Red-headed Woodpecker", "Pileated Woodpecker"],
    category: "specific-field-mark"
  },
  // ... 16 more queries covering edge cases
];
```

### Test Implementation (Vitest)
```typescript
describe('Search Relevance (Constitution Principle III)', () => {
  curatedQueries.forEach(({ query, expectedInTop3, category }) => {
    it(`should find ${expectedInTop3[0]} for "${query}"`, async () => {
      const results = await searchBirds(query);
      const top3Names = results.slice(0, 3).map(b => b.commonName);
      
      const foundExpected = expectedInTop3.some(expected => 
        top3Names.includes(expected)
      );
      
      expect(foundExpected).toBe(true);
    });
  });
});
```

### Success Criteria
- 90% of curated queries return correct bird in top 3 results (SC-002 from spec)
- Tests run in CI on every commit
- Failures block deployment

---

## 7. Input Sanitization & XSS Prevention

### Decision
Use **DOMPurify** for frontend sanitization and **validator.js** for backend input validation.

### Rationale
- FR-014 mandates XSS attack prevention
- Search queries are user-generated text that gets displayed in results
- Defense-in-depth: Sanitize on both frontend (before display) and backend (before storage)

### Implementation
```typescript
// Backend: Validate and escape input
import validator from 'validator';

function sanitizeSearchQuery(query: string): string {
  if (!validator.isLength(query, { min: 1, max: 500 })) {
    throw new Error('Query length invalid');
  }
  return validator.escape(query); // Escape HTML entities
}

// Frontend: Sanitize before rendering (if displaying user input back)
import DOMPurify from 'dompurify';

function SearchBox({ initialQuery }: { initialQuery?: string }) {
  const cleanQuery = DOMPurify.sanitize(initialQuery || '');
  // ... render search input
}
```

### Dependencies
- `validator` (backend validation)
- `dompurify` (frontend sanitization)
- `@types/dompurify` (TypeScript types)

---

## 8. Vector Store Strategy for Embeddings

### Decision
Use **sqlite-vss** (Vector Similarity Search extension) for SQLite MVP, migrate to **PostgreSQL + pgvector** for production.

### Rationale
- **sqlite-vss** provides native vector operations in SQLite without custom JavaScript
- Efficient cosine similarity search (C-based, not JavaScript)
- Zero-config for development (embedded like SQLite)
- Direct migration path to pgvector (similar SQL syntax)
- Handles 1536-dimension OpenAI embeddings efficiently

### Vector Store Comparison

| Solution | Pros | Cons | Decision |
|----------|------|------|----------|
| **sqlite-vss** | Fast C-based similarity, embedded, 0-config | Limited scale (< 100k vectors) | ✅ **MVP Choice** |
| **pgvector** | Production-ready, scales to millions, native indexes | Requires PostgreSQL server | ✅ **Production** |
| **JSON + JS cosine** | No dependencies | Slow for > 1000 birds, JavaScript overhead | ❌ Rejected |
| **Chroma/Pinecone** | Managed vector DB | External service, complexity | ❌ Overkill for MVP |

### Implementation: sqlite-vss

**Installation**:
```bash
npm install sqlite-vss better-sqlite3
```

**Schema (SQLite with vss)**:
```sql
-- Enable sqlite-vss extension
.load ./node_modules/sqlite-vss/vss0

-- Create virtual table for vector similarity search
CREATE VIRTUAL TABLE vss_birds USING vss0(
  embedding(1536)  -- OpenAI text-embedding-3-small dimension
);

-- Store bird data with vector IDs
CREATE TABLE birds (
  id INTEGER PRIMARY KEY,
  ebird_code TEXT UNIQUE NOT NULL,
  common_name TEXT NOT NULL,
  scientific_name TEXT NOT NULL,
  description TEXT,
  vss_id INTEGER,  -- Links to vss_birds
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert embeddings into vector store
INSERT INTO vss_birds(rowid, embedding) VALUES (?, ?);
```

**Search Query (sqlite-vss)**:
```typescript
import Database from 'better-sqlite3';

const db = new Database('birdmate.db');
db.loadExtension('sqlite-vss/vss0');

async function searchBirds(queryEmbedding: number[]): Promise<Bird[]> {
  // Use vss0 for vector similarity search
  const results = db.prepare(`
    SELECT 
      b.*,
      v.distance as similarity_score
    FROM vss_birds v
    JOIN birds b ON b.vss_id = v.rowid
    WHERE vss_search(
      v.embedding,
      vss_search_params(?, 10)  -- query embedding, top 10
    )
    ORDER BY v.distance ASC
    LIMIT 10
  `).all(JSON.stringify(queryEmbedding));
  
  return results;
}
```

### Migration to PostgreSQL + pgvector

When moving to production (> 50 concurrent users, > 10k birds):

**PostgreSQL setup**:
```sql
-- Enable pgvector extension
CREATE EXTENSION vector;

-- Create table with vector column
CREATE TABLE birds (
  id SERIAL PRIMARY KEY,
  ebird_code TEXT UNIQUE NOT NULL,
  common_name TEXT NOT NULL,
  scientific_name TEXT NOT NULL,
  description TEXT,
  embedding vector(1536),  -- Native vector type
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast similarity search (HNSW)
CREATE INDEX ON birds USING hnsw (embedding vector_cosine_ops);
```

**Search Query (pgvector)**:
```typescript
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function searchBirds(queryEmbedding: number[]): Promise<Bird[]> {
  const { rows } = await pool.query(`
    SELECT 
      *,
      1 - (embedding <=> $1::vector) as similarity_score
    FROM birds
    WHERE 1 - (embedding <=> $1::vector) > 0.5  -- Threshold filter
    ORDER BY embedding <=> $1::vector
    LIMIT 10
  `, [`[${queryEmbedding.join(',')}]`]);
  
  return rows;
}
```

### Performance Characteristics

| Metric | sqlite-vss (MVP) | pgvector (Production) |
|--------|------------------|----------------------|
| Vector capacity | ~10k vectors | Millions of vectors |
| Search latency | 10-50ms (1k birds) | 5-20ms (100k birds) |
| Concurrent queries | < 50 | 1000+ |
| Index type | Flat (exact) | HNSW (approximate) |
| Setup complexity | Zero-config | Requires PostgreSQL |

### Dependencies
- **MVP**: `sqlite-vss` (^0.1.2), `better-sqlite3` (^11.7.0)
- **Production**: `pg` (^8.13.1), PostgreSQL 15+ with `pgvector` extension

### Migration Strategy
1. **Phase 1 (MVP)**: sqlite-vss embedded with application
2. **Phase 2 (Growth)**: Export embeddings → Import to PostgreSQL + pgvector
3. **Phase 3 (Scale)**: Add HNSW index, connection pooling, read replicas

---

## Research Summary

All technical unknowns resolved. Key decisions documented:

1. ✅ **OpenAI text-embedding-3-small** for semantic search
2. ✅ **Macaulay Library API** for bird images
3. ✅ **eBird Taxonomy CSV** for species data
4. ✅ **React 18 + TanStack Query + React Router** for frontend
5. ✅ **SQLite → PostgreSQL migration path** for database
6. ✅ **20+ curated test queries** for field validation
7. ✅ **DOMPurify + validator.js** for security

**Next Phase**: Generate data models and API contracts based on this research.

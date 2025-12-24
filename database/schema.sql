-- Birdmate Database Schema
-- Version: 1.0.0
-- Compatible with: SQLite 3.x with sqlite-vss extension

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- ============================================================================
-- Core Tables
-- ============================================================================

-- Bird species with eBird taxonomy
CREATE TABLE IF NOT EXISTS birds (
    id TEXT PRIMARY KEY,              -- eBird species code (e.g., "norcad")
    common_name TEXT NOT NULL,
    scientific_name TEXT NOT NULL,
    family TEXT,
    description TEXT,                 -- Rich text for semantic search
    embedding BLOB,                   -- 1536-dim vector (OpenAI text-embedding-3-small)
    size_min_cm REAL,
    size_max_cm REAL,
    habitat TEXT,
    range TEXT,                       -- Geographic range description
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Validation constraints
    CHECK (length(id) > 0),
    CHECK (length(common_name) > 0),
    CHECK (length(scientific_name) > 0),
    CHECK (size_min_cm IS NULL OR size_min_cm > 0),
    CHECK (size_max_cm IS NULL OR size_max_cm >= size_min_cm)
);

-- Indexes for birds table
CREATE INDEX IF NOT EXISTS idx_birds_common_name ON birds(common_name);
CREATE INDEX IF NOT EXISTS idx_birds_scientific_name ON birds(scientific_name);
CREATE INDEX IF NOT EXISTS idx_birds_family ON birds(family);

-- Bird images from Macaulay Library
CREATE TABLE IF NOT EXISTS bird_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bird_id TEXT NOT NULL,
    url TEXT NOT NULL,
    photographer TEXT,
    license TEXT DEFAULT 'CC BY-NC-SA',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (bird_id) REFERENCES birds(id) ON DELETE CASCADE,
    
    -- Validation constraints
    CHECK (length(url) > 0),
    CHECK (license IN ('CC BY-NC-SA', 'CC BY', 'CC0', 'Public Domain'))
);

-- Indexes for bird_images table
CREATE INDEX IF NOT EXISTS idx_bird_images_bird_id ON bird_images(bird_id);
CREATE INDEX IF NOT EXISTS idx_bird_images_is_primary ON bird_images(is_primary) WHERE is_primary = TRUE;

-- Search query logs (observability & audit trail)
CREATE TABLE IF NOT EXISTS search_queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_text TEXT NOT NULL,
    query_embedding BLOB,             -- 1536-dim vector for query
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    top_results TEXT,                 -- JSON array of bird IDs (e.g., ["norcad", "eastblu"])
    result_count INTEGER DEFAULT 0,
    
    -- Validation constraints
    CHECK (length(query_text) > 0),
    CHECK (result_count >= 0)
);

-- Indexes for search_queries table
CREATE INDEX IF NOT EXISTS idx_search_queries_timestamp ON search_queries(timestamp DESC);

-- Search results (many-to-many relationship with scores)
CREATE TABLE IF NOT EXISTS search_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id INTEGER NOT NULL,
    bird_id TEXT NOT NULL,
    score REAL NOT NULL,              -- Similarity score (0-1)
    rank INTEGER NOT NULL,            -- Result ranking (1, 2, 3, ...)
    matched_features TEXT,            -- JSON array of features (e.g., ["color", "size"])
    
    FOREIGN KEY (query_id) REFERENCES search_queries(id) ON DELETE CASCADE,
    FOREIGN KEY (bird_id) REFERENCES birds(id) ON DELETE CASCADE,
    
    -- Validation constraints
    CHECK (score >= 0 AND score <= 1),
    CHECK (rank > 0),
    
    -- Unique constraint: one bird per query
    UNIQUE(query_id, bird_id)
);

-- Indexes for search_results table
CREATE INDEX IF NOT EXISTS idx_search_results_query_id ON search_results(query_id);
CREATE INDEX IF NOT EXISTS idx_search_results_bird_id ON search_results(bird_id);
CREATE INDEX IF NOT EXISTS idx_search_results_score ON search_results(score DESC);

-- Taxonomy metadata (eBird taxonomy versioning)
CREATE TABLE IF NOT EXISTS taxonomy_metadata (
    id INTEGER PRIMARY KEY CHECK (id = 1),  -- Singleton table (only one row)
    version TEXT NOT NULL,
    source TEXT DEFAULT 'eBird',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Validation constraints
    CHECK (length(version) > 0)
);

-- ============================================================================
-- Vector Search Virtual Table (sqlite-vss)
-- ============================================================================

-- Virtual table for efficient vector similarity search
-- Note: Requires sqlite-vss extension to be loaded
-- CREATE VIRTUAL TABLE IF NOT EXISTS vss_birds USING vss0(
--     embedding(1536)  -- OpenAI text-embedding-3-small dimension
-- );

-- ============================================================================
-- Views
-- ============================================================================

-- View: Birds with primary image
CREATE VIEW IF NOT EXISTS birds_with_images AS
SELECT 
    b.id,
    b.common_name,
    b.scientific_name,
    b.family,
    b.description,
    b.size_min_cm,
    b.size_max_cm,
    b.habitat,
    b.range,
    bi.url AS primary_image_url,
    bi.photographer,
    bi.license AS image_license
FROM birds b
LEFT JOIN bird_images bi ON b.id = bi.bird_id AND bi.is_primary = TRUE;

-- View: Popular searches (top 100 queries by frequency)
CREATE VIEW IF NOT EXISTS popular_searches AS
SELECT 
    query_text,
    COUNT(*) AS query_count,
    AVG(result_count) AS avg_results,
    MAX(timestamp) AS last_searched
FROM search_queries
GROUP BY query_text
ORDER BY query_count DESC
LIMIT 100;

-- ============================================================================
-- Triggers
-- ============================================================================

-- Update timestamp on bird modifications
CREATE TRIGGER IF NOT EXISTS update_birds_timestamp
AFTER UPDATE ON birds
FOR EACH ROW
BEGIN
    UPDATE birds SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Ensure only one primary image per bird
CREATE TRIGGER IF NOT EXISTS enforce_single_primary_image
BEFORE INSERT ON bird_images
FOR EACH ROW
WHEN NEW.is_primary = TRUE
BEGIN
    UPDATE bird_images SET is_primary = FALSE WHERE bird_id = NEW.bird_id;
END;

-- ============================================================================
-- Initial Data
-- ============================================================================

-- Insert taxonomy metadata placeholder (will be updated during seeding)
INSERT OR IGNORE INTO taxonomy_metadata (id, version, source, updated_at)
VALUES (1, '0.0.0', 'eBird', CURRENT_TIMESTAMP);

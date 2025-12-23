-- BirdMate Database Schema
-- Natural Language Bird Search Application

-- Drop existing tables if they exist (for clean migrations)
DROP TABLE IF EXISTS search_results;
DROP TABLE IF EXISTS search_queries;
DROP TABLE IF EXISTS bird_images;
DROP TABLE IF EXISTS taxonomy_metadata;
DROP TABLE IF EXISTS birds;

-- Birds table: Core bird species information
CREATE TABLE birds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    common_name TEXT NOT NULL,
    scientific_name TEXT NOT NULL UNIQUE,
    taxonomy_order INTEGER NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('species', 'issf', 'form', 'intergrade', 'hybrid', 'slash', 'spuh', 'domestic')),
    family_name TEXT,
    description TEXT,
    habitat TEXT,
    diet TEXT,
    behavior TEXT,
    conservation TEXT,
    embedding BLOB, -- Store as binary for efficient vector search
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_birds_common_name ON birds(common_name);
CREATE INDEX idx_birds_scientific_name ON birds(scientific_name);
CREATE INDEX idx_birds_taxonomy_order ON birds(taxonomy_order);
CREATE INDEX idx_birds_family_name ON birds(family_name);

-- Bird Images table: Links to Macaulay Library images
CREATE TABLE bird_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bird_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    asset_id TEXT NOT NULL UNIQUE,
    photographer TEXT,
    license_type TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (bird_id) REFERENCES birds(id) ON DELETE CASCADE
);

CREATE INDEX idx_bird_images_bird_id ON bird_images(bird_id);
CREATE INDEX idx_bird_images_is_primary ON bird_images(is_primary);

-- Search Queries table: Track user searches
CREATE TABLE search_queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_text TEXT NOT NULL,
    query_embedding BLOB, -- Store query embedding for reuse
    user_id TEXT, -- Optional user tracking
    result_count INTEGER NOT NULL DEFAULT 0,
    execution_time_ms INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_search_queries_created_at ON search_queries(created_at DESC);
CREATE INDEX idx_search_queries_user_id ON search_queries(user_id);

-- Search Results table: Links queries to bird results with scores
CREATE TABLE search_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    search_query_id INTEGER NOT NULL,
    bird_id INTEGER NOT NULL,
    similarity_score REAL NOT NULL,
    rank INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (search_query_id) REFERENCES search_queries(id) ON DELETE CASCADE,
    FOREIGN KEY (bird_id) REFERENCES birds(id) ON DELETE CASCADE
);

CREATE INDEX idx_search_results_query_id ON search_results(search_query_id);
CREATE INDEX idx_search_results_bird_id ON search_results(bird_id);
CREATE INDEX idx_search_results_similarity_score ON search_results(similarity_score DESC);

-- Taxonomy Metadata table: Raw eBird taxonomy data
CREATE TABLE taxonomy_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    species_code TEXT NOT NULL UNIQUE,
    common_name TEXT NOT NULL,
    scientific_name TEXT NOT NULL,
    category TEXT NOT NULL,
    taxonomy_order INTEGER NOT NULL,
    family_common_name TEXT,
    family_scientific_name TEXT,
    report_as_species BOOLEAN NOT NULL DEFAULT 1,
    extinct BOOLEAN NOT NULL DEFAULT 0,
    extinct_year INTEGER,
    raw_data TEXT NOT NULL, -- JSON blob of original taxonomy data
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_taxonomy_species_code ON taxonomy_metadata(species_code);
CREATE INDEX idx_taxonomy_order ON taxonomy_metadata(taxonomy_order);

-- Triggers for updated_at timestamp
CREATE TRIGGER update_birds_timestamp 
AFTER UPDATE ON birds
FOR EACH ROW
BEGIN
    UPDATE birds SET updated_at = datetime('now') WHERE id = NEW.id;
END;

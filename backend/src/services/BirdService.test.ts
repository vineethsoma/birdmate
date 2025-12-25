/**
 * Unit tests for BirdService
 * 
 * Tests bird data access layer with SQLite database
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { BirdService } from './BirdService.js';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('BirdService', () => {
  let db: Database.Database;
  let service: BirdService;
  let tempDir: string;

  beforeAll(() => {
    // Create temporary database for testing
    tempDir = mkdtempSync(join(tmpdir(), 'birdmate-test-'));
    const dbPath = join(tempDir, 'test.db');
    db = new Database(dbPath);
    
    // Create schema
    db.exec(`
      CREATE TABLE birds (
        id TEXT PRIMARY KEY,
        common_name TEXT NOT NULL,
        scientific_name TEXT NOT NULL,
        family TEXT,
        description TEXT,
        embedding BLOB,
        size_min_cm REAL,
        size_max_cm REAL,
        habitat TEXT,
        range TEXT
      );
      
      CREATE TABLE bird_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bird_id TEXT NOT NULL,
        url TEXT NOT NULL,
        photographer TEXT,
        license TEXT DEFAULT 'CC BY-NC-SA',
        is_primary BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (bird_id) REFERENCES birds(id)
      );
    `);
    
    // Insert test data
    const insert = db.prepare(`
      INSERT INTO birds (id, common_name, scientific_name, family, description, embedding, size_min_cm, size_max_cm)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Create realistic 1536-dim embeddings
    const createEmbedding = (seed: number) => {
      const embedding = new Array(1536).fill(0).map((_, i) => Math.sin(i * seed) * 0.1);
      return Buffer.from(new Float32Array(embedding).buffer);
    };
    
    insert.run('norcar', 'Northern Cardinal', 'Cardinalis cardinalis', 'Cardinalidae', 
      'Bright red bird with black face mask and crest', createEmbedding(1), 20, 23);
    insert.run('blujay', 'Blue Jay', 'Cyanocitta cristata', 'Corvidae',
      'Blue bird with white underparts and black necklace, prominent crest', createEmbedding(2), 22, 30);
    insert.run('amegor', 'American Goldfinch', 'Spinus tristis', 'Fringillidae',
      'Small bright yellow bird with black wings and cap', createEmbedding(3), 11, 14);
    
    // Add images
    const insertImage = db.prepare(`
      INSERT INTO bird_images (bird_id, url, is_primary) VALUES (?, ?, ?)
    `);
    
    insertImage.run('norcar', 'https://example.com/cardinal.jpg', 1);
    insertImage.run('blujay', 'https://example.com/bluejay.jpg', 1);
    insertImage.run('amegor', 'https://example.com/goldfinch.jpg', 1);
    
    service = new BirdService(db);
  });

  afterAll(() => {
    db.close();
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('findById', () => {
    it('should find bird by ID', () => {
      const bird = service.findById('norcar');
      
      expect(bird).toBeDefined();
      expect(bird?.id).toBe('norcar');
      expect(bird?.commonName).toBe('Northern Cardinal');
      expect(bird?.scientificName).toBe('Cardinalis cardinalis');
    });

    it('should return null for non-existent ID', () => {
      const bird = service.findById('invalid');
      expect(bird).toBeNull();
    });

    it('should include embedding as Float32Array', () => {
      const bird = service.findById('norcar');
      
      expect(bird?.embedding).toBeInstanceOf(Float32Array);
      expect(bird?.embedding).toHaveLength(1536);
    });
  });

  describe('searchBySimilarity', () => {
    const createEmbedding = (seed: number) => {
      const embedding = new Array(1536).fill(0).map((_, i) => Math.sin(i * seed) * 0.1);
      return Buffer.from(new Float32Array(embedding).buffer);
    };

    // Reset embeddings before each test to ensure consistent state
    beforeEach(() => {
      // Always start with all 3 birds having embeddings
      db.prepare('UPDATE birds SET embedding = ? WHERE id = ?').run(createEmbedding(1), 'norcar');
      db.prepare('UPDATE birds SET embedding = ? WHERE id = ?').run(createEmbedding(2), 'blujay');
      db.prepare('UPDATE birds SET embedding = ? WHERE id = ?').run(createEmbedding(3), 'amegor');
    });

    it('should return birds ranked by similarity', () => {
      const queryEmbedding = new Array(1536).fill(0).map((_, i) => Math.sin(i * 1.1) * 0.1);
      
      const results = service.searchBySimilarity(queryEmbedding, 10);
      
      expect(results).toHaveLength(3);
      expect(results[0].id).toBe('norcar'); // Closest to query
      expect(results[0].score).toBeGreaterThan(-1); // Cosine similarity range [-1, 1]
      expect(results[0].score).toBeLessThanOrEqual(1);
      
      // Verify descending order
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it('should limit results to specified count', () => {
      const queryEmbedding = new Array(1536).fill(0.1);
      
      const results = service.searchBySimilarity(queryEmbedding, 2);
      
      expect(results).toHaveLength(2);
    });

    it('should include bird details in results', () => {
      const queryEmbedding = new Array(1536).fill(0.1);
      
      const results = service.searchBySimilarity(queryEmbedding, 1);
      
      expect(results[0]).toHaveProperty('id');
      expect(results[0]).toHaveProperty('commonName');
      expect(results[0]).toHaveProperty('scientificName');
      expect(results[0]).toHaveProperty('score');
      expect(results[0]).not.toHaveProperty('embedding'); // Don't include embedding in results
    });

    it('should return empty array when no birds have embeddings', () => {
      // Clear ALL embeddings first
      db.prepare('UPDATE birds SET embedding = NULL').run();
      
      const queryEmbedding = new Array(1536).fill(0.1);
      const results = service.searchBySimilarity(queryEmbedding, 10);
      
      expect(results).toHaveLength(0);
      
      // Restore embeddings after test for other tests
      db.prepare('UPDATE birds SET embedding = ? WHERE id = ?').run(createEmbedding(1), 'norcar');
      db.prepare('UPDATE birds SET embedding = ? WHERE id = ?').run(createEmbedding(2), 'blujay');
      db.prepare('UPDATE birds SET embedding = ? WHERE id = ?').run(createEmbedding(3), 'amegor');
    });

    it('should handle edge case of single bird', () => {
      // Clear ALL embeddings first, then add only one
      db.prepare('UPDATE birds SET embedding = NULL').run();
      db.prepare('UPDATE birds SET embedding = ? WHERE id = ?').run(createEmbedding(1), 'norcar');
      
      const queryEmbedding = new Array(1536).fill(0.1);
      const results = service.searchBySimilarity(queryEmbedding, 10);
      
      expect(results).toHaveLength(1);
      
      // Restore other embeddings after test
      db.prepare('UPDATE birds SET embedding = ? WHERE id = ?').run(createEmbedding(2), 'blujay');
      db.prepare('UPDATE birds SET embedding = ? WHERE id = ?').run(createEmbedding(3), 'amegor');
    });
  });

  describe('findWithImages', () => {
    it('should find bird with primary image', () => {
      const bird = service.findWithImages('norcar');
      
      expect(bird).toBeDefined();
      expect(bird?.thumbnailUrl).toBe('https://example.com/cardinal.jpg');
    });

    it('should return null for non-existent bird', () => {
      const bird = service.findWithImages('invalid');
      expect(bird).toBeNull();
    });

    it('should handle bird without images', () => {
      // Insert bird without image
      db.prepare(`
        INSERT INTO birds (id, common_name, scientific_name, description, embedding)
        VALUES (?, ?, ?, ?, ?)
      `).run('testbird', 'Test Bird', 'Testus birdus', 'Test description', 
        Buffer.from(new Float32Array(1536).buffer));
      
      const bird = service.findWithImages('testbird');
      
      expect(bird).toBeDefined();
      expect(bird?.thumbnailUrl).toBeNull();
    });
  });

  describe('getBulkWithImages', () => {
    it('should fetch multiple birds with images', () => {
      const birds = service.getBulkWithImages(['norcar', 'blujay']);
      
      expect(birds).toHaveLength(2);
      expect(birds[0].id).toBe('norcar');
      expect(birds[0].thumbnailUrl).toBeDefined();
      expect(birds[1].id).toBe('blujay');
    });

    it('should skip non-existent IDs', () => {
      const birds = service.getBulkWithImages(['norcar', 'invalid', 'blujay']);
      
      expect(birds).toHaveLength(2);
    });

    it('should return empty array for empty input', () => {
      const birds = service.getBulkWithImages([]);
      expect(birds).toHaveLength(0);
    });

    it('should preserve order of input IDs', () => {
      const birds = service.getBulkWithImages(['blujay', 'norcar']);
      
      expect(birds[0].id).toBe('blujay');
      expect(birds[1].id).toBe('norcar');
    });
  });
});

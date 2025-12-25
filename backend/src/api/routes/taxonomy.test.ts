/**
 * Taxonomy endpoint tests (T041)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initializeDatabase, getDatabase } from '../../db/client.js';
import express from 'express';
import request from 'supertest';
import taxonomyRouter from './taxonomy.js';

describe('Taxonomy API', () => {
  let app: express.Express;
  
  beforeAll(() => {
    // Initialize test database
    initializeDatabase(':memory:');
    
    // Setup express app
    app = express();
    app.use(express.json());
    app.use('/api/v1', taxonomyRouter);
    
    // Insert test taxonomy metadata
    const db = getDatabase();
    db.exec(`
      CREATE TABLE IF NOT EXISTS taxonomy_metadata (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        version TEXT NOT NULL,
        source TEXT DEFAULT 'eBird',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CHECK (length(version) > 0)
      )
    `);
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO taxonomy_metadata (id, version, source, updated_at)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(1, '2024-v1', 'eBird', '2024-12-01');
  });
  
  afterAll(() => {
    getDatabase().close();
  });
  
  it('should return taxonomy metadata', async () => {
    const response = await request(app)
      .get('/api/v1/taxonomy')
      .expect(200);
    
    expect(response.body).toEqual({
      version: '2024-v1',
      lastUpdated: '2024-12-01',
      source: 'eBird',
    });
  });
  
  it('should return unknown when no metadata exists', async () => {
    // Clear metadata
    getDatabase().exec('DELETE FROM taxonomy_metadata');
    
    const response = await request(app)
      .get('/api/v1/taxonomy')
      .expect(200);
    
    expect(response.body).toEqual({
      version: 'unknown',
      lastUpdated: null,
      source: 'eBird',
    });
  });
});

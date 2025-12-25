/**
 * Bird data access service
 * 
 * Handles database queries for bird information and similarity search
 */

import type Database from 'better-sqlite3';
import { cosineSimilarity } from '../utils/similarity.js';

export interface Bird {
  id: string;
  commonName: string;
  scientificName: string;
  family: string | null;
  description: string | null;
  embedding: Float32Array | null;
  sizeMinCm: number | null;
  sizeMaxCm: number | null;
  habitat: string | null;
  range: string | null;
}

export interface BirdWithImage extends Omit<Bird, 'embedding'> {
  thumbnailUrl: string | null;
}

export interface SearchResult {
  id: string;
  commonName: string;
  scientificName: string;
  score: number;
}

export class BirdService {
  constructor(private db: Database.Database) {}

  /**
   * Find bird by ID
   * @param id - Bird species code (e.g., "norcar")
   * @returns Bird or null if not found
   */
  findById(id: string): Bird | null {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        common_name,
        scientific_name,
        family,
        description,
        embedding,
        size_min_cm,
        size_max_cm,
        habitat,
        range
      FROM birds
      WHERE id = ?
    `);
    
    const row = stmt.get(id) as any;
    
    if (!row) {
      return null;
    }
    
    return {
      id: row.id,
      commonName: row.common_name,
      scientificName: row.scientific_name,
      family: row.family,
      description: row.description,
      embedding: row.embedding ? new Float32Array(row.embedding.buffer) : null,
      sizeMinCm: row.size_min_cm,
      sizeMaxCm: row.size_max_cm,
      habitat: row.habitat,
      range: row.range,
    };
  }

  /**
   * Search birds by similarity to query embedding
   * @param queryEmbedding - Query vector (1536 dimensions)
   * @param limit - Maximum number of results (1-100)
   * @param minScore - Minimum similarity threshold (-1 to 1), defaults to -1 (no filtering)
   * @returns Ranked search results
   */
  searchBySimilarity(queryEmbedding: number[], limit: number, minScore: number = -1): SearchResult[] {
    // Validate inputs (D-1)
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    if (minScore < -1 || minScore > 1) {
      throw new Error('MinScore must be between -1 and 1');
    }
    
    const birds = this.fetchAllBirdsWithEmbeddings();
    const scoredResults = this.calculateSimilarityScores(birds, queryEmbedding);
    
    // Filter by minimum score, sort descending, and limit
    return scoredResults
      .filter(r => r.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  /**
   * Fetch all birds that have embeddings
   * @private
   */
  private fetchAllBirdsWithEmbeddings(): any[] {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        common_name,
        scientific_name,
        embedding
      FROM birds
      WHERE embedding IS NOT NULL
    `);
    
    return stmt.all() as any[];
  }
  
  /**
   * Calculate similarity scores for all birds
   * @private
   */
  private calculateSimilarityScores(birds: any[], queryEmbedding: number[]): SearchResult[] {
    return birds.map(bird => {
      const birdEmbedding = Array.from(new Float32Array(bird.embedding.buffer));
      const score = cosineSimilarity(queryEmbedding, birdEmbedding);
      
      return {
        id: bird.id,
        commonName: bird.common_name,
        scientificName: bird.scientific_name,
        score,
      };
    });
  }

  /**
   * Find bird with primary image
   * @param id - Bird species code
   * @returns Bird with thumbnail URL or null
   */
  findWithImages(id: string): BirdWithImage | null {
    const stmt = this.db.prepare(`
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
        i.url as thumbnail_url
      FROM birds b
      LEFT JOIN bird_images i ON b.id = i.bird_id AND i.is_primary = 1
      WHERE b.id = ?
      LIMIT 1
    `);
    
    const row = stmt.get(id) as any;
    
    if (!row) {
      return null;
    }
    
    return {
      id: row.id,
      commonName: row.common_name,
      scientificName: row.scientific_name,
      family: row.family,
      description: row.description,
      sizeMinCm: row.size_min_cm,
      sizeMaxCm: row.size_max_cm,
      habitat: row.habitat,
      range: row.range,
      thumbnailUrl: row.thumbnail_url || null,
    };
  }

  /**
   * Get multiple birds with images in specified order
   * @param ids - Array of bird IDs
   * @returns Birds with thumbnails in input order
   */
  getBulkWithImages(ids: string[]): BirdWithImage[] {
    if (ids.length === 0) {
      return [];
    }
    
    const placeholders = ids.map(() => '?').join(',');
    const stmt = this.db.prepare(`
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
        i.url as thumbnail_url
      FROM birds b
      LEFT JOIN bird_images i ON b.id = i.bird_id AND i.is_primary = 1
      WHERE b.id IN (${placeholders})
    `);
    
    const rows = stmt.all(...ids) as any[];
    
    // Create lookup map
    const birdMap = new Map<string, BirdWithImage>();
    rows.forEach(row => {
      birdMap.set(row.id, {
        id: row.id,
        commonName: row.common_name,
        scientificName: row.scientific_name,
        family: row.family,
        description: row.description,
        sizeMinCm: row.size_min_cm,
        sizeMaxCm: row.size_max_cm,
        habitat: row.habitat,
        range: row.range,
        thumbnailUrl: row.thumbnail_url || null,
      });
    });
    
    // Return in input order, skipping missing IDs
    return ids
      .map(id => birdMap.get(id))
      .filter((bird): bird is BirdWithImage => bird !== undefined);
  }
}

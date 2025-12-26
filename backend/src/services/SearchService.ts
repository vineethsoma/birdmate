/**
 * Search orchestration service
 * 
 * Coordinates embedding generation, similarity search, and result formatting
 */

import { randomUUID, createHash } from 'crypto';
import { generateEmbedding } from '../utils/embeddings.js';
import { BirdService } from './BirdService.js';

// Search configuration constants
const QUERY_MIN_LENGTH = 3;
const QUERY_MAX_LENGTH = 500;
const DEFAULT_RESULT_LIMIT = 10;
const MIN_SIMILARITY_THRESHOLD = 0.3;
const MAX_FIELD_MARKS = 5;

export interface SearchResultItem {
  id: string;
  commonName: string;
  scientificName: string;
  score: number;
  thumbnailUrl: string | null;
  fieldMarks: string[];
}

export interface SearchResponse {
  results: SearchResultItem[];
  totalCount: number;
  queryId: string;
}

export class SearchService {
  constructor(private birdService: BirdService) {}

  /**
   * Perform semantic search for birds
   * @param query - Natural language query (3-500 characters)
   * @returns Search results with ranked birds
   * @throws Error if query validation fails
   */
  async search(query: string): Promise<SearchResponse> {
    // Trim and validate
    const cleanedQuery = query.trim();
    
    if (cleanedQuery.length < QUERY_MIN_LENGTH || cleanedQuery.length > QUERY_MAX_LENGTH) {
      throw new Error(`Query must be ${QUERY_MIN_LENGTH}-${QUERY_MAX_LENGTH} characters`);
    }
    
    // Generate unique query ID for audit trail
    const queryId = randomUUID();
    
    // Log query (Constitution Principle IV - audit trail)
    // Hash query to prevent PII leakage (L-5)
    const queryHash = createHash('sha256').update(cleanedQuery).digest('hex').slice(0, 16);
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'search',
      queryId,
      queryHash,
      queryLength: cleanedQuery.length,
    }));
    
    // Generate embedding
    const { embedding } = await generateEmbedding(cleanedQuery);
    
    // Perform similarity search with minimum score threshold
    const searchResults = this.birdService.searchBySimilarity(
      embedding,
      DEFAULT_RESULT_LIMIT,
      MIN_SIMILARITY_THRESHOLD
    );
    
    if (searchResults.length === 0) {
      return {
        results: [],
        totalCount: 0,
        queryId,
      };
    }
    
    // Fetch full bird details with images
    const birdIds = searchResults.map(r => r.id);
    const birdsWithImages = this.birdService.getBulkWithImages(birdIds);
    
    // Merge search scores with bird data
    const scoreMap = new Map(searchResults.map(r => [r.id, r.score]));
    
    const results: SearchResultItem[] = birdsWithImages.map(bird => ({
      id: bird.id,
      commonName: bird.commonName,
      scientificName: bird.scientificName,
      score: Math.round((scoreMap.get(bird.id) || 0) * 100) / 100, // Round to 2 decimals
      thumbnailUrl: bird.thumbnailUrl,
      fieldMarks: this.extractFieldMarks(bird.description),
    }));
    
    return {
      results,
      totalCount: results.length,
      queryId,
    };
  }

  /**
   * Extract key field marks from bird description
   * @param description - Bird description text
   * @returns Array of field marks (e.g., ["red crest", "black mask"])
   */
  private extractFieldMarks(description: string | null): string[] {
    if (!description) {
      return [];
    }
    
    // Extract sentences or phrases with key identifying features
    const fieldMarkPatterns = [
      /(\w+\s+(?:crest|cap|crown|head|face|mask|eye|throat|breast|chest|belly|back|wings?|tail|bill|legs?))/gi,
      /(\w+\s+(?:underparts|upperparts))/gi,
      /(\w+\s+(?:necklace|collar|patch|stripe|bar|spot))/gi,
    ];
    
    const marks = new Set<string>();
    
    fieldMarkPatterns.forEach(pattern => {
      const matches = description.match(pattern);
      if (matches) {
        matches.forEach(match => {
          marks.add(match.trim().toLowerCase());
        });
      }
    });
    
    return Array.from(marks).slice(0, MAX_FIELD_MARKS); // Limit to most prominent
  }
}

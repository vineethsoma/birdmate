/**
 * Shared TypeScript interfaces for Birdmate application
 * Derived from OpenAPI 3.0 specification
 */

/**
 * Bird species entity with taxonomy and descriptive information
 */
export interface Bird {
  /** eBird species code (e.g., "norcad" for Northern Cardinal) */
  id: string;
  /** Common name in English */
  commonName: string;
  /** Scientific name (binomial nomenclature) */
  scientificName: string;
  /** Taxonomic family */
  family?: string;
  /** Rich text description for semantic search */
  description?: string;
  /** Size range in centimeters */
  sizeRange?: {
    min: number;
    max: number;
  };
  /** Habitat description */
  habitat?: string;
  /** Geographic range description */
  range?: string;
  /** Associated images */
  images?: BirdImage[];
}

/**
 * Bird image from Macaulay Library
 */
export interface BirdImage {
  /** Database ID */
  id: number;
  /** Image URL */
  url: string;
  /** Photographer name */
  photographer?: string;
  /** License (default: CC BY-NC-SA) */
  license: string;
  /** Whether this is the primary/featured image */
  isPrimary: boolean;
}

/**
 * Natural language search query
 */
export interface SearchQuery {
  /** Free-form text description */
  query: string;
  /** Maximum number of results (default: 10) */
  limit?: number;
}

/**
 * Search result with relevance score
 */
export interface SearchResult {
  /** Matched bird species */
  bird: Bird;
  /** Similarity score (0-1, higher is better) */
  score: number;
  /** Features that contributed to the match */
  matchedFeatures?: string[];
}

/**
 * API response for search endpoint
 */
export interface SearchResponse {
  /** Original query text */
  query: string;
  /** Ranked results */
  results: SearchResult[];
  /** Optional message (for zero results or ambiguity) */
  message?: string;
  /** Total number of results */
  total: number;
}

/**
 * eBird taxonomy metadata
 */
export interface TaxonomyMetadata {
  /** Taxonomy version number */
  version: string;
  /** Source (e.g., "eBird") */
  source: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * API error response
 */
export interface ErrorResponse {
  error: {
    /** Machine-readable error code */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Field name for validation errors */
    field?: string;
  };
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
}

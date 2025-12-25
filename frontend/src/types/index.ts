/**
 * Frontend-specific types for Birdmate UI
 */

/**
 * Simplified bird search result for display in search results
 * Derived from SearchResult and Bird types from shared/types
 */
export interface BirdSearchResult {
  /** eBird species code */
  id: string;
  /** Common name in English */
  commonName: string;
  /** Scientific name (binomial nomenclature) */
  scientificName: string;
  /** Thumbnail image URL (nullable if no image available) */
  thumbnailUrl: string | null;
  /** Similarity score (0-1, higher is better) */
  score: number;
  /** Key identifying features (max 2 for card display) */
  fieldMarks: string[];
}

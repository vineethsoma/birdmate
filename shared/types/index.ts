// Bird-related types
export interface Bird {
  id: number;
  commonName: string;
  scientificName: string;
  taxonomyOrder: number;
  category: string;
  familyName: string;
  description?: string;
  habitat?: string;
  diet?: string;
  behavior?: string;
  conservation?: string;
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface BirdImage {
  id: number;
  birdId: number;
  imageUrl: string;
  thumbnailUrl?: string;
  assetId: string;
  photographer?: string;
  licenseType?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface TaxonomyMetadata {
  id: number;
  speciesCode: string;
  commonName: string;
  scientificName: string;
  category: string;
  taxonomyOrder: number;
  familyCommonName?: string;
  familyScientificName?: string;
  reportAsSpecies: boolean;
  extinct: boolean;
  extinctYear?: number;
  rawData: string;
  createdAt: string;
}

// Search-related types
export interface SearchQuery {
  id?: number;
  queryText: string;
  queryEmbedding?: number[];
  userId?: string;
  resultCount?: number;
  executionTimeMs?: number;
  createdAt?: string;
}

export interface SearchResult {
  id?: number;
  searchQueryId: number;
  birdId: number;
  similarityScore: number;
  rank: number;
  createdAt?: string;
}

export interface SearchResponse {
  query: string;
  results: BirdSearchResult[];
  executionTimeMs: number;
  totalResults: number;
}

export interface BirdSearchResult {
  bird: Bird;
  images: BirdImage[];
  similarityScore: number;
  rank: number;
}

// API Error types
export interface ApiError {
  error: {
    code: string;
    message: string;
    field?: string;
    details?: unknown;
  };
}

// Request/Response types
export interface SearchRequest {
  query: string;
  limit?: number;
  offset?: number;
}

export interface BirdDetailResponse {
  bird: Bird;
  images: BirdImage[];
  relatedBirds?: Bird[];
}

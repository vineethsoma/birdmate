/**
 * API client wrapper
 * 
 * Provides type-safe HTTP client for backend API
 */

import type {
  SearchQuery,
  SearchResponse,
  Bird,
  TaxonomyMetadata,
  ErrorResponse,
  HealthResponse,
} from '../../../shared/types/index.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
    public field?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * HTTP client wrapper with error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const errorData = data as ErrorResponse;
      throw new APIError(
        errorData.error.code,
        errorData.error.message,
        response.status,
        errorData.error.field
      );
    }
    
    return data as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // Network or parsing error
    throw new APIError(
      'NETWORK_ERROR',
      error instanceof Error ? error.message : 'Network request failed',
      0
    );
  }
}

/**
 * Search for birds by natural language query
 */
export async function searchBirds(query: SearchQuery): Promise<SearchResponse> {
  return fetchAPI<SearchResponse>('/search', {
    method: 'POST',
    body: JSON.stringify(query),
  });
}

/**
 * Get bird details by ID
 */
export async function getBird(id: string): Promise<Bird> {
  return fetchAPI<Bird>(`/birds/${encodeURIComponent(id)}`);
}

/**
 * Get taxonomy metadata
 */
export async function getTaxonomyMetadata(): Promise<TaxonomyMetadata> {
  return fetchAPI<TaxonomyMetadata>('/taxonomy');
}

/**
 * Health check
 */
export async function healthCheck(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
  return response.json();
}

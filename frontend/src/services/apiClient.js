/**
 * API client wrapper
 *
 * Provides type-safe HTTP client for backend API
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';
/**
 * Custom error class for API errors
 */
export class APIError extends Error {
    code;
    statusCode;
    field;
    constructor(code, message, statusCode, field) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.field = field;
        this.name = 'APIError';
    }
}
/**
 * HTTP client wrapper with error handling
 */
async function fetchAPI(endpoint, options) {
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
            const errorData = data;
            throw new APIError(errorData.error.code, errorData.error.message, response.status, errorData.error.field);
        }
        return data;
    }
    catch (error) {
        if (error instanceof APIError) {
            throw error;
        }
        // Network or parsing error
        throw new APIError('NETWORK_ERROR', error instanceof Error ? error.message : 'Network request failed', 0);
    }
}
/**
 * Search for birds by natural language query
 */
export async function searchBirds(query) {
    return fetchAPI('/search', {
        method: 'POST',
        body: JSON.stringify(query),
    });
}
/**
 * Get bird details by ID
 */
export async function getBird(id) {
    return fetchAPI(`/birds/${encodeURIComponent(id)}`);
}
/**
 * Get taxonomy metadata
 */
export async function getTaxonomyMetadata() {
    return fetchAPI('/taxonomy');
}
/**
 * Health check
 */
export async function healthCheck() {
    const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
    return response.json();
}

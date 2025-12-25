/**
 * Cosine similarity calculation for vector embeddings
 * 
 * Implements similarity search for semantic bird matching
 */

/**
 * Normalize vector to unit length
 * @param vector - Input vector
 * @returns Normalized vector with unit length
 * @throws Error if vector is zero vector
 */
export function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  
  if (magnitude === 0) {
    throw new Error('Cannot normalize zero vector');
  }
  
  return vector.map(val => val / magnitude);
}

/**
 * Calculate cosine similarity between two vectors
 * @param v1 - First vector
 * @param v2 - Second vector
 * @returns Similarity score in range [-1, 1]
 * @throws Error if vector dimensions don't match
 */
export function cosineSimilarity(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) {
    throw new Error('Vector dimensions must match');
  }
  
  // Calculate dot product
  const dotProduct = v1.reduce((sum, val, i) => sum + val * v2[i], 0);
  
  // Calculate magnitudes
  const magnitude1 = Math.sqrt(v1.reduce((sum, val) => sum + val ** 2, 0));
  const magnitude2 = Math.sqrt(v2.reduce((sum, val) => sum + val ** 2, 0));
  
  // Avoid division by zero
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }
  
  return dotProduct / (magnitude1 * magnitude2);
}

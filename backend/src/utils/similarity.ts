/**
 * Calculate cosine similarity between two vectors
 * Returns a value between -1 and 1, where 1 means identical direction
 * 
 * @param vectorA First embedding vector
 * @param vectorB Second embedding vector
 * @returns Cosine similarity score (0-1, where 1 is most similar)
 */
export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error(`Vector dimensions must match: ${vectorA.length} !== ${vectorB.length}`);
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  // Return normalized similarity (0-1 range)
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Calculate cosine distance (inverse of similarity)
 * Returns a value between 0 and 2, where 0 means identical
 * 
 * @param vectorA First embedding vector
 * @param vectorB Second embedding vector
 * @returns Cosine distance (lower is more similar)
 */
export function cosineDistance(vectorA: number[], vectorB: number[]): number {
  return 1 - cosineSimilarity(vectorA, vectorB);
}

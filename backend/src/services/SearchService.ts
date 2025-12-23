import { getDatabaseConnection } from '../db/client.js';
import { Bird as BirdModel } from '../models/Bird.ts';
import { generateEmbedding, bufferToEmbedding } from '../utils/embeddings.js';
import { cosineSimilarity } from '../utils/similarity.js';
import { logger } from '../utils/logging.js';
import { SearchResponse, BirdSearchResult, Bird as BirdType, BirdImage } from '@shared/types';
import { NotFoundError } from '../api/middleware/errorHandler.js';

export class SearchService {
  private db = getDatabaseConnection();

  /**
   * Perform semantic search for birds matching natural language query
   * @param queryText User's natural language description
   * @param limit Maximum number of results to return (default 10)
   * @returns Search response with ranked bird results
   */
  async search(queryText: string, limit = 10): Promise<SearchResponse> {
    const startTime = Date.now();

    try {
      // 1. Generate embedding for query
      logger.info('Starting bird search', { queryText, limit });
      const queryEmbedding = await generateEmbedding(queryText);

      // 2. Fetch all birds with embeddings from database
      const birdsQuery = this.db.prepare(`
        SELECT 
          b.*,
          GROUP_CONCAT(bi.id) as image_ids,
          GROUP_CONCAT(bi.image_url) as image_urls,
          GROUP_CONCAT(bi.thumbnail_url) as thumbnail_urls,
          GROUP_CONCAT(bi.asset_id) as asset_ids,
          GROUP_CONCAT(bi.photographer) as photographers,
          GROUP_CONCAT(bi.license_type) as license_types,
          GROUP_CONCAT(bi.is_primary) as is_primaries
        FROM birds b
        LEFT JOIN bird_images bi ON b.id = bi.bird_id
        WHERE b.embedding IS NOT NULL
        GROUP BY b.id
      `);

      const rows = birdsQuery.all();

      // 3. Calculate similarity scores for each bird
      const rankedBirds: BirdSearchResult[] = [];

      for (const row of rows as Record<string, unknown>[]) {
        const bird = BirdModel.fromDatabase(row);
        
        if (!bird.embedding) {
          continue;
        }

        const similarityScore = cosineSimilarity(queryEmbedding, bird.embedding);

        // Parse images
        const images: BirdImage[] = [];
        const imageIds = (row.image_ids as string)?.split(',') || [];
        const imageUrls = (row.image_urls as string)?.split(',') || [];
        const thumbnailUrls = (row.thumbnail_urls as string)?.split(',') || [];
        const assetIds = (row.asset_ids as string)?.split(',') || [];
        const photographers = (row.photographers as string)?.split(',') || [];
        const licenseTypes = (row.license_types as string)?.split(',') || [];
        const isPrimaries = (row.is_primaries as string)?.split(',') || [];

        for (let i = 0; i < imageIds.length && imageIds[0]; i++) {
          images.push({
            id: parseInt(imageIds[i]),
            birdId: bird.id,
            imageUrl: imageUrls[i],
            thumbnailUrl: thumbnailUrls[i] !== 'null' ? thumbnailUrls[i] : undefined,
            assetId: assetIds[i],
            photographer: photographers[i] !== 'null' ? photographers[i] : undefined,
            licenseType: licenseTypes[i] !== 'null' ? licenseTypes[i] : undefined,
            isPrimary: isPrimaries[i] === '1',
            createdAt: '',
          });
        }

        rankedBirds.push({
          bird,
          images,
          similarityScore,
          rank: 0, // Will be set after sorting
        });
      }

      // 4. Sort by similarity score and assign ranks
      rankedBirds.sort((a, b) => b.similarityScore - a.similarityScore);
      
      const topResults = rankedBirds.slice(0, limit);
      topResults.forEach((result, index) => {
        result.rank = index + 1;
      });

      const executionTimeMs = Date.now() - startTime;

      logger.info('Search completed', {
        queryText,
        resultsCount: topResults.length,
        executionTimeMs,
        topScore: topResults[0]?.similarityScore || 0,
      });

      return {
        query: queryText,
        results: topResults,
        executionTimeMs,
        totalResults: topResults.length,
      };
    } catch (error) {
      logger.error('Search failed', {
        queryText,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}

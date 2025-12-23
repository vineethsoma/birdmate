import { getDatabaseConnection } from '../db/client.js';
import { SearchQuery as SearchQueryModel } from '../models/SearchQuery.js';
import { SearchQuery as SearchQueryType, BirdSearchResult } from '@shared/types';
import { logger } from '../utils/logging.js';

export class LoggingService {
  private db = getDatabaseConnection();

  /**
   * Log a search query with its results
   * @param queryText Original query text
   * @param queryEmbedding Optional embedding vector
   * @param results Search results
   * @param executionTimeMs Execution time in milliseconds
   * @returns Created query ID
   */
  async logSearchQuery(
    queryText: string,
    queryEmbedding: number[] | undefined,
    results: BirdSearchResult[],
    executionTimeMs: number
  ): Promise<number> {
    try {
      // Insert search query
      const insertQuery = this.db.prepare(`
        INSERT INTO search_queries (query_text, query_embedding, result_count, execution_time_ms)
        VALUES (?, ?, ?, ?)
      `);

      const result = insertQuery.run(
        queryText,
        queryEmbedding ? JSON.stringify(queryEmbedding) : null,
        results.length,
        executionTimeMs
      );

      const queryId = result.lastInsertRowid as number;

      // Insert search results (top 10 max)
      const topResults = results.slice(0, 10);
      
      if (topResults.length > 0) {
        const insertResults = this.db.prepare(`
          INSERT INTO search_results (search_query_id, bird_id, similarity_score, rank)
          VALUES (?, ?, ?, ?)
        `);

        const insertMany = this.db.transaction((results: BirdSearchResult[]) => {
          for (const result of results) {
            insertResults.run(queryId, result.bird.id, result.similarityScore, result.rank);
          }
        });

        insertMany(topResults);
      }

      logger.info('Logged search query', {
        queryId,
        queryText,
        resultCount: results.length,
        executionTimeMs,
      });

      return queryId;
    } catch (error) {
      logger.error('Failed to log search query', {
        queryText,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Don't throw - logging failures shouldn't break search
      return -1;
    }
  }

  /**
   * Get recent search queries for analytics
   * @param limit Maximum number of queries to return
   * @returns Array of search queries
   */
  async getRecentQueries(limit = 100): Promise<SearchQueryType[]> {
    const rows = this.db.prepare(`
      SELECT * FROM search_queries 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(limit);

    return (rows as Record<string, unknown>[]).map(row => SearchQueryModel.fromDatabase(row));
  }

  /**
   * Get failed searches (zero results) for improvement
   * @param limit Maximum number to return
   * @returns Array of search queries with zero results
   */
  async getFailedSearches(limit = 50): Promise<SearchQueryType[]> {
    const rows = this.db.prepare(`
      SELECT * FROM search_queries 
      WHERE result_count = 0 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(limit);

    return (rows as Record<string, unknown>[]).map(row => SearchQueryModel.fromDatabase(row));
  }
}

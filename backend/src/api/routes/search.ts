import { Router, Request, Response, NextFunction } from 'express';
import { SearchService } from '../../services/SearchService.js';
import { LoggingService } from '../../services/LoggingService.js';
import { SearchQuery } from '../../models/SearchQuery.js';
import { ValidationError } from '../middleware/errorHandler.js';
import { SearchRequest, SearchResponse } from '@shared/types';
import { logger } from '../../utils/logging.js';

const router = Router();
const searchService = new SearchService();
const loggingService = new LoggingService();

/**
 * POST /api/v1/search
 * Perform natural language bird search
 */
router.post('/v1/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, limit = 10 } = req.body as SearchRequest;

    // Validate query
    SearchQuery.validate({ queryText: query });

    // Perform search
    const startTime = Date.now();
    const searchResponse: SearchResponse = await searchService.search(query, limit);
    const executionTimeMs = Date.now() - startTime;

    // Log query (async, don't await)
    loggingService.logSearchQuery(
      query,
      undefined, // We don't store query embeddings in this implementation
      searchResponse.results,
      executionTimeMs
    ).catch(err => {
      logger.error('Failed to log search query', { error: err.message });
    });

    res.json(searchResponse);
  } catch (error) {
    next(error);
  }
});

export default router;

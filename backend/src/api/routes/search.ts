/**
 * Search API endpoint
 * 
 * POST /api/v1/search - Natural language bird search
 */

import { Router, type Request, type Response } from 'express';
import { SearchService } from '../../services/SearchService.js';
import { BirdService } from '../../services/BirdService.js';
import { getDatabase } from '../../db/client.js';

const router = Router();

// Initialize services
const db = getDatabase();
const birdService = new BirdService(db);
const searchService = new SearchService(birdService);

/**
 * POST /api/v1/search
 * 
 * Request body: { query: string }
 * Response: { results: Array, totalCount: number, queryId: string }
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    // Check content type
    const contentType = req.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      return res.status(415).json({
        error: {
          code: 'UNSUPPORTED_MEDIA_TYPE',
          message: 'Content-Type must be application/json',
        },
      });
    }
    
    // Validate request body
    if (!req.body || typeof req.body.query !== 'string') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query field is required and must be a string',
        },
      });
    }
    
    const { query } = req.body;
    
    // Perform search
    const result = await searchService.search(query);
    
    res.status(200).json(result);
  } catch (error: unknown) {
    // Handle validation errors
    const err = error as Error;
    if (err.message?.includes('must be 3-500 characters')) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: err.message,
        },
      });
    }
    
    // Handle other errors (E-2)
    console.error('Search error:', {
      error: err.message,
      stack: err.stack,
      queryLength: req.body.query?.length || 0,
    });
    res.status(500).json({
      error: {
        code: 'SEARCH_FAILED',
        message: 'Search service temporarily unavailable. Please try again.',
      },
    });
  }
});

// Reject GET requests with 405
router.get('/search', (_req: Request, res: Response) => {
  res.status(405).json({
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: 'GET method not allowed. Use POST instead.',
    },
  });
});

export default router;

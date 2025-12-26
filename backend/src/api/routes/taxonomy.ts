/**
 * Taxonomy API endpoint
 * 
 * GET /api/v1/taxonomy - Get taxonomy version and metadata
 */

import { Router, type Request, type Response } from 'express';
import { getDatabase } from '../../db/client.js';

const router = Router();

/**
 * GET /api/v1/taxonomy
 * 
 * Returns taxonomy version and last update date
 * FR-016: Display taxonomy version for transparency
 */
router.get('/taxonomy', (_req: Request, res: Response) => {
  try {
    const db = getDatabase();
    
    // Query taxonomy metadata
    const stmt = db.prepare(`
      SELECT 
        version,
        updated_at,
        source
      FROM taxonomy_metadata
      WHERE id = 1
    `);
    
    const metadata = stmt.get() as {
      version: string;
      updated_at: string;
      source: string;
    } | undefined;
    
    if (!metadata) {
      // No taxonomy loaded yet
      return res.status(200).json({
        version: 'unknown',
        lastUpdated: null,
        source: 'eBird',
      });
    }
    
    res.status(200).json({
      version: metadata.version,
      lastUpdated: metadata.updated_at,
      source: metadata.source,
    });
  } catch (error: unknown) {
    console.error('Taxonomy endpoint error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve taxonomy metadata',
      },
    });
  }
});

export default router;

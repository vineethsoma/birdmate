import { Router, Request, Response } from 'express';
import { getDatabaseConnection } from '../../db/client.js';

const router = Router();

/**
 * GET /api/v1/taxonomy
 * Get taxonomy version and metadata
 */
router.get('/v1/taxonomy', (_req: Request, res: Response) => {
  const db = getDatabaseConnection();

  // Get taxonomy metadata
  const metadata = db.prepare(`
    SELECT 
      COUNT(*) as species_count,
      MIN(created_at) as imported_at
    FROM birds
  `).get() as { species_count: number; imported_at: string };

  // Get version from taxonomy_metadata if available
  const versionRow = db.prepare(`
    SELECT species_code, created_at 
    FROM taxonomy_metadata 
    LIMIT 1
  `).get() as { species_code: string; created_at: string } | undefined;

  res.json({
    version: 'eBird Taxonomy 2023.1', // Hardcoded for MVP
    region: 'North America',
    speciesCount: metadata.species_count,
    importedAt: metadata.imported_at,
    lastUpdated: versionRow?.created_at || metadata.imported_at,
  });
});

export default router;

import { getDatabaseConnection } from '../db/client.js';
import { Bird as BirdModel } from '../models/Bird.js';
import { Bird as BirdType, BirdImage } from '@shared/types';
import { NotFoundError } from '../api/middleware/errorHandler.js';
import { logger } from '../utils/logging.js';

export class BirdService {
  private db = getDatabaseConnection();

  /**
   * Get bird by ID with images
   * @param id Bird ID
   * @returns Bird with images
   */
  async getBirdById(id: number): Promise<{ bird: BirdType; images: BirdImage[] }> {
    try {
      // Fetch bird
      const birdRow = this.db.prepare('SELECT * FROM birds WHERE id = ?').get(id);

      if (!birdRow) {
        throw new NotFoundError(`Bird with ID ${id} not found`);
      }

      const bird = BirdModel.fromDatabase(birdRow as Record<string, unknown>);

      // Fetch images
      const imageRows = this.db.prepare(`
        SELECT * FROM bird_images 
        WHERE bird_id = ? 
        ORDER BY is_primary DESC, id ASC
      `).all(id);

      const images: BirdImage[] = (imageRows as Record<string, unknown>[]).map(row => ({
        id: row.id as number,
        birdId: row.bird_id as number,
        imageUrl: row.image_url as string,
        thumbnailUrl: row.thumbnail_url as string | undefined,
        assetId: row.asset_id as string,
        photographer: row.photographer as string | undefined,
        licenseType: row.license_type as string | undefined,
        isPrimary: Boolean(row.is_primary),
        createdAt: row.created_at as string,
      }));

      logger.debug('Fetched bird by ID', { birdId: id, imageCount: images.length });

      return { bird, images };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Failed to fetch bird', { birdId: id, error: error instanceof Error ? error.message : 'Unknown' });
      throw error;
    }
  }

  /**
   * Get all birds (useful for admin/debugging)
   * @param limit Maximum number of birds to return
   * @param offset Pagination offset
   * @returns Array of birds
   */
  async getAllBirds(limit = 50, offset = 0): Promise<BirdType[]> {
    const rows = this.db.prepare(`
      SELECT * FROM birds 
      ORDER BY common_name ASC 
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    return (rows as Record<string, unknown>[]).map(row => BirdModel.fromDatabase(row));
  }

  /**
   * Get bird images for a specific bird
   * @param birdId Bird ID
   * @returns Array of images
   */
  async getBirdImages(birdId: number): Promise<BirdImage[]> {
    const rows = this.db.prepare(`
      SELECT * FROM bird_images 
      WHERE bird_id = ? 
      ORDER BY is_primary DESC, id ASC
    `).all(birdId);

    return (rows as Record<string, unknown>[]).map(row => ({
      id: row.id as number,
      birdId: row.bird_id as number,
      imageUrl: row.image_url as string,
      thumbnailUrl: row.thumbnail_url as string | undefined,
      assetId: row.asset_id as string,
      photographer: row.photographer as string | undefined,
      licenseType: row.license_type as string | undefined,
      isPrimary: Boolean(row.is_primary),
      createdAt: row.created_at as string,
    }));
  }
}

import { db } from '../client.js';
import { logger } from '../../utils/logging.js';

const MACAULAY_SEARCH_URL = 'https://search.macaulaylibrary.org/api/v1/search';
const IMAGES_PER_SPECIES = 5;

interface MacaulayAsset {
  assetId: string;
  previewUrl: string;
  mediaUrl: string;
  userDisplayName: string;
  licenseCode: string;
}

interface MacaulayResponse {
  results: {
    content: MacaulayAsset[];
  };
}

export async function fetchBirdImages(): Promise<void> {
  logger.info('Starting bird images fetch');

  const birds = db.prepare('SELECT id, scientific_name FROM birds').all() as Array<{
    id: number;
    scientific_name: string;
  }>;

  const insertImage = db.prepare(`
    INSERT INTO bird_images (
      bird_id, image_url, thumbnail_url, asset_id,
      photographer, license_type, is_primary
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  let totalImages = 0;

  for (const bird of birds) {
    try {
      const params = new URLSearchParams({
        taxonCode: bird.scientific_name.replace(' ', '-').toLowerCase(),
        mediaType: 'p',
        sort: 'rating_rank_desc',
        count: IMAGES_PER_SPECIES.toString(),
      });

      const response = await fetch(`${MACAULAY_SEARCH_URL}?${params}`);
      
      if (!response.ok) {
        logger.warn('Failed to fetch images for bird', {
          birdId: bird.id,
          scientificName: bird.scientific_name,
          status: response.status,
        });
        continue;
      }

      const data = (await response.json()) as MacaulayResponse;
      const assets = data.results?.content || [];

      const transaction = db.transaction(() => {
        assets.forEach((asset, index) => {
          insertImage.run(
            bird.id,
            asset.mediaUrl,
            asset.previewUrl,
            asset.assetId,
            asset.userDisplayName,
            asset.licenseCode,
            index === 0 ? 1 : 0
          );
          totalImages++;
        });
      });

      transaction();

      // Rate limit: wait 100ms between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      logger.error('Error fetching images for bird', {
        birdId: bird.id,
        scientificName: bird.scientific_name,
      }, error as Error);
    }
  }

  logger.info('Bird images fetch completed', {
    totalBirds: birds.length,
    totalImages,
    averagePerBird: (totalImages / birds.length).toFixed(2),
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fetchBirdImages()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

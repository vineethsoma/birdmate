/**
 * Macaulay Library Image Fetching Script
 * 
 * Fetches bird images from Cornell's Macaulay Library
 * Note: This is a placeholder - actual API integration requires API key
 */

import { getDatabase, transaction } from '../client.js';

interface MacaulayImage {
  assetId: string;
  previewUrl: string;
  photographer: string;
  license: string;
}

/**
 * Fetch images for a bird species from Macaulay Library
 * 
 * @param speciesCode - eBird species code
 * @returns Array of image URLs
 */
async function fetchImagesForBird(speciesCode: string): Promise<MacaulayImage[]> {
  // TODO: Implement actual Macaulay Library API integration
  // For now, return placeholder
  console.log(`📷 Fetching images for ${speciesCode} (placeholder)`);
  
  return [
    {
      assetId: `${speciesCode}-1`,
      previewUrl: `https://via.placeholder.com/400x300?text=${speciesCode}`,
      photographer: 'Placeholder',
      license: 'CC BY-NC-SA',
    },
  ];
}

/**
 * Seed bird images for all species in database
 */
export async function fetchImages(): Promise<number> {
  console.log('🖼️  Fetching bird images...');
  
  try {
    const db = getDatabase();
    
    // Get all bird IDs
    const birds = db.prepare('SELECT id FROM birds').all() as Array<{ id: string }>;
    
    console.log(`📊 Fetching images for ${birds.length} species...`);
    
    let totalImages = 0;
    
    for (const bird of birds) {
      const images = await fetchImagesForBird(bird.id);
      
      if (images.length > 0) {
        transaction((txDb) => {
          const stmt = txDb.prepare(`
            INSERT INTO bird_images (bird_id, url, photographer, license, is_primary)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT DO NOTHING
          `);
          
          images.forEach((img, index) => {
            stmt.run(bird.id, img.previewUrl, img.photographer, img.license, index === 0);
          });
        });
        
        totalImages += images.length;
      }
      
      // Rate limiting: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ Fetched ${totalImages} images for ${birds.length} species`);
    return totalImages;
  } catch (error) {
    console.error('❌ Image fetching failed:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchImages()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

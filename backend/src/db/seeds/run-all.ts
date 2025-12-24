/**
 * Run all seeding scripts in order
 */

import { downloadTaxonomy } from './download-taxonomy.js';
import { seedTaxonomy } from './seed-taxonomy.js';
import { fetchImages } from './fetch-images.js';
import { generateEmbeddings } from './generate-embeddings.js';

async function main(): Promise<void> {
  console.log('🌱 Starting database seeding...\n');
  
  try {
    // Step 1: Download taxonomy
    await downloadTaxonomy();
    console.log();
    
    // Step 2: Seed birds
    await seedTaxonomy();
    console.log();
    
    // Step 3: Fetch images
    await fetchImages();
    console.log();
    
    // Step 4: Generate embeddings
    await generateEmbeddings();
    console.log();
    
    console.log('✅ All seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();

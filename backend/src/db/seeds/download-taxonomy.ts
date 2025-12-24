/**
 * eBird Taxonomy Download Script
 * 
 * Downloads the latest eBird taxonomy CSV from Cornell Lab
 * Source: https://www.birds.cornell.edu/clementschecklist/download/
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

const EBIRD_TAXONOMY_URL = 'https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=csv';
const OUTPUT_PATH = resolve(process.cwd(), '../database/ebird-taxonomy.csv');

/**
 * Download eBird taxonomy CSV
 */
export async function downloadTaxonomy(): Promise<string> {
  console.log('📥 Downloading eBird taxonomy...');
  
  try {
    const response = await fetch(EBIRD_TAXONOMY_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const csvData = await response.text();
    writeFileSync(OUTPUT_PATH, csvData, 'utf-8');
    
    console.log(`✅ Taxonomy downloaded: ${OUTPUT_PATH}`);
    return OUTPUT_PATH;
  } catch (error) {
    console.error('❌ Failed to download taxonomy:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadTaxonomy()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

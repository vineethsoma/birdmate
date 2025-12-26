/**
 * eBird Taxonomy Download Script
 * 
 * Downloads the latest eBird taxonomy CSV from Cornell Lab
 * and filters for North American species using ABA region
 * Source: https://www.birds.cornell.edu/clementschecklist/download/
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

const EBIRD_TAXONOMY_URL = 'https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=csv';
const EBIRD_REGION_URL = 'https://api.ebird.org/v2/product/spplist/US,CA,MX'; // North America
const OUTPUT_PATH = resolve(process.cwd(), '../database/ebird-taxonomy.csv');
const NA_SPECIES_PATH = resolve(process.cwd(), '../database/na-species-codes.json');

/**
 * Download North American species list from eBird
 */
async function downloadNASpeciesList(): Promise<Set<string>> {
  console.log('  Fetching North American species list...');
  
  try {
    const response = await fetch(EBIRD_REGION_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const speciesCodes: string[] = await response.json();
    const speciesSet = new Set(speciesCodes);
    
    // Save for reference
    writeFileSync(NA_SPECIES_PATH, JSON.stringify(speciesCodes, null, 2), 'utf-8');
    console.log(`  ✅ Found ${speciesSet.size} North American species`);
    
    return speciesSet;
  } catch (error) {
    console.error('  ⚠️  Failed to download regional list, falling back to heuristics');
    return new Set();
  }
}

/**
 * Download eBird taxonomy CSV
 */
export async function downloadTaxonomy(): Promise<string> {
  console.log('📥 Downloading eBird taxonomy...');
  
  try {
    // First, get North American species list
    await downloadNASpeciesList();
    
    // Then download full taxonomy
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

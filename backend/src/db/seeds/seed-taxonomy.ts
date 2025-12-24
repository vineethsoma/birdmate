/**
 * eBird Taxonomy Seeding Script
 * 
 * Parses eBird CSV and populates the birds table
 * Filters for North American species (500-1000 species)
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { getDatabase, transaction } from '../client.js';

const TAXONOMY_CSV_PATH = resolve(process.cwd(), '../database/ebird-taxonomy.csv');

interface TaxonomyRow {
  speciesCode: string;
  comName: string;
  sciName: string;
  familyComName: string;
  category: string;
}

/**
 * Parse CSV line with proper quote handling
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Filter for North American species
 */
function isNorthAmerican(row: TaxonomyRow): boolean {
  // TODO: Add proper geographic filtering based on eBird range data
  // For MVP, we'll include all "species" category birds
  return row.category === 'species';
}

/**
 * Seed birds table from eBird taxonomy
 */
export async function seedTaxonomy(): Promise<number> {
  console.log('🌱 Seeding bird taxonomy...');
  
  try {
    const csvContent = readFileSync(TAXONOMY_CSV_PATH, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length < 2) {
      throw new Error('Invalid CSV: no data rows');
    }
    
    // Parse header - eBird uses COMMON_NAME and SCIENTIFIC_NAME
    const headers = parseCSVLine(lines[0]!);
    const speciesCodeIdx = headers.indexOf('SPECIES_CODE');
    const comNameIdx = headers.indexOf('COMMON_NAME');
    const sciNameIdx = headers.indexOf('SCIENTIFIC_NAME');
    const familyIdx = headers.indexOf('FAMILY_COM_NAME');
    const categoryIdx = headers.indexOf('CATEGORY');
    
    console.log(`  Found columns: ${headers.slice(0, 5).join(', ')}...`);
    
    if (speciesCodeIdx === -1 || comNameIdx === -1 || sciNameIdx === -1) {
      console.error(`  Available columns: ${headers.join(', ')}`);
      throw new Error('Missing required columns in CSV');
    }
    
    // Parse data rows
    const birds: TaxonomyRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]!);
      
      const bird: TaxonomyRow = {
        speciesCode: row[speciesCodeIdx] || '',
        comName: row[comNameIdx] || '',
        sciName: row[sciNameIdx] || '',
        familyComName: row[familyIdx] || '',
        category: row[categoryIdx] || '',
      };
      
      if (bird.speciesCode && bird.comName && isNorthAmerican(bird)) {
        birds.push(bird);
      }
    }
    
    // Limit to ~500-1000 species for MVP
    const limitedBirds = birds.slice(0, 1000);
    
    console.log(`📊 Filtered ${limitedBirds.length} North American species from ${lines.length - 1} total`);
    
    // Insert into database
    const inserted = transaction((db) => {
      const stmt = db.prepare(`
        INSERT INTO birds (id, common_name, scientific_name, family, description)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          common_name = excluded.common_name,
          scientific_name = excluded.scientific_name,
          family = excluded.family
      `);
      
      let count = 0;
      for (const bird of limitedBirds) {
        // Generate basic description for semantic search
        const description = `${bird.comName} (${bird.sciName}). Family: ${bird.familyComName}.`;
        
        stmt.run(bird.speciesCode, bird.comName, bird.sciName, bird.familyComName, description);
        count++;
      }
      
      return count;
    });
    
    // Update taxonomy metadata
    const db = getDatabase();
    db.prepare(`
      UPDATE taxonomy_metadata
      SET version = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run('2024v1'); // TODO: Extract version from eBird API
    
    console.log(`✅ Seeded ${inserted} bird species`);
    return inserted;
  } catch (error) {
    console.error('❌ Taxonomy seeding failed:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTaxonomy()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

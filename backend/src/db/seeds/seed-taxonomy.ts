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
const NA_SPECIES_PATH = resolve(process.cwd(), '../database/na-species-codes.json');

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
 * Load North American species codes from downloaded list
 */
function loadNASpeciesCodes(): Set<string> {
  try {
    const content = readFileSync(NA_SPECIES_PATH, 'utf-8');
    const codes: string[] = JSON.parse(content);
    return new Set(codes);
  } catch (error) {
    console.warn('  ⚠️  Could not load NA species list, using heuristics');
    return new Set();
  }
}

/**
 * Filter for North American species
 * 
 * Strategy: Use eBird regional species list (US, CA, MX) for accurate filtering
 * Fallback to heuristics if regional list unavailable
 */
function isNorthAmerican(row: TaxonomyRow, naSpeciesCodes: Set<string>): boolean {
  // Only include actual species (not hybrids, subspecies, etc.)
  if (row.category !== 'species') {
    return false;
  }
  
  // If we have the authoritative NA species list, use it
  if (naSpeciesCodes.size > 0) {
    return naSpeciesCodes.has(row.speciesCode);
  }
  
  // Fallback: Heuristic filtering (less accurate)
  const excludedFamilies = [
    'Ostriches',
    'Cassowaries and Emu',
    'Kiwis',
    'Rheas',
    'Tinamous',
    'Megapodes',
    'Guineafowl',
    'Turacos',
    'Mousebirds',
    'Mesites',
    'Honeyguides',
    'Pittas',
    'Broadbills',
    'Asities',
    'Lyrebirds',
    'Fairywrens',
    'Australasian Treecreepers',
    'Berrypeckers',
    'Australasian Babblers',
    'Logrunners',
    'Australasian Robins',
    'Rockfowl',
    'Rockjumpers',
    'Sugarbirds',
    'Bushshrikes and allies',
    'Drongos',
    'Fantails',
    'Monarch Flycatchers',
    'Honeyeaters',
  ];
  
  if (excludedFamilies.includes(row.familyComName)) {
    return false;
  }
  
  // Exclude species with geographic indicators in common name
  const excludePatterns = [
    /\bAfrican\b/i,
    /\bAsian\b/i,
    /\bEurasian\b(?!.*(Wigeon|Teal|Coot|Woodcock|Collared-Dove))/i, // Allow Eurasian species found in NA
    /\bEuropean\b/i,
    /\bAustralian\b/i,
    /\bNew Zealand\b/i,
    /\bMadagascar\b/i,
    /\bIndian\b/i,
    /\bOriental\b/i,
    /\bSomali\b/i,
    /\bEgyptian\b/i,
    /\bSouthern (?!Fulmar|Lapwing)\b/i, // Exclude Southern unless it's Southern Fulmar/Lapwing
    /\bPatagonian\b/i,
  ];
  
  for (const pattern of excludePatterns) {
    if (pattern.test(row.comName)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Seed birds table from eBird taxonomy
 */
export async function seedTaxonomy(): Promise<number> {
  console.log('🌱 Seeding bird taxonomy...');
  
  try {
    // Load North American species codes
    const naSpeciesCodes = loadNASpeciesCodes();
    console.log(`  Loaded ${naSpeciesCodes.size} North American species codes`);
    
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
      
      if (bird.speciesCode && bird.comName && isNorthAmerican(bird, naSpeciesCodes)) {
        birds.push(bird);
      }
    }
    
    console.log(`📊 Filtered ${birds.length} North American species from ${lines.length - 1} total species`);
    
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
      for (const bird of birds) {
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

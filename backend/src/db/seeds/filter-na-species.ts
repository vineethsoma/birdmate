/**
 * North American Species Filter
 * 
 * Removes non-North American species from the existing database
 * Target: Reduce from 10,142 species to ~500-1000 North American species
 */

import { getDatabase, transaction } from '../client.js';

/**
 * Execute SQL delete and return count of deleted rows
 */
function deleteAndCount(db: any, sql: string, params: unknown[] = []): number {
  const result = db.prepare(sql).run(...params);
  return result.changes;
}

/**
 * Filter database to North American species only
 */
export async function filterNASpecies(): Promise<void> {
  console.log('🔍 Filtering database to North American species only...\n');
  
  const db = getDatabase();
  let totalDeleted = 0;
  
  try {
    // Get initial count
    const beforeCount = db.prepare('SELECT COUNT(*) as count FROM birds').get() as { count: number };
    console.log(`📊 Initial count: ${beforeCount.count} species\n`);
    
    await transaction(() => {
      // 1. Delete by geographic indicators in common name
      console.log('1️⃣  Removing species by geographic indicators...');
      
      const geoPatterns = [
        ['African', "common_name LIKE '%African%'"],
        ['Asian', "common_name LIKE '%Asian%'"],
        ['European', "common_name LIKE '%European%'"],
        ['Australian/Australasian', "common_name LIKE '%Australian%' OR common_name LIKE '%Australasian%'"],
        ['Madagascar', "common_name LIKE '%Madagascar%'"],
        ['New Zealand', "common_name LIKE '%New Zealand%'"],
        ['Oriental', "common_name LIKE '%Oriental%'"],
        ['Indian', "common_name LIKE '%Indian%'"],
        ['Somali', "common_name LIKE '%Somali%'"],
        ['Egyptian', "common_name LIKE '%Egyptian%'"],
        ['Arabian', "common_name LIKE '%Arabian%'"],
        ['Patagonian', "common_name LIKE '%Patagonian%'"],
        ['Antarctic', "common_name LIKE '%Antarctic%'"],
        ['Tasmanian', "common_name LIKE '%Tasmanian%'"],
        ['Philippine', "common_name LIKE '%Philippine%'"],
        ['Indonesian', "common_name LIKE '%Indonesian%'"],
        ['Malayan', "common_name LIKE '%Malayan%'"],
        ['Chinese', "common_name LIKE '%Chinese%'"],
        ['Japanese', "common_name LIKE '%Japanese%'"],
        ['Himalayan', "common_name LIKE '%Himalayan%'"],
        ['Caucasian', "common_name LIKE '%Caucasian%'"],
        ['Siberian', "common_name LIKE '%Siberian%'"],
        ['Saharan', "common_name LIKE '%Saharan%'"],
        ['Ethiopian', "common_name LIKE '%Ethiopian%'"],
        ['Kerguelen', "common_name LIKE '%Kerguelen%'"],
      ];
      
      for (const [label, condition] of geoPatterns) {
        const deleted = deleteAndCount(db, `DELETE FROM birds WHERE ${condition}`);
        if (deleted > 0) {
          totalDeleted += deleted;
          console.log(`   ✓ Removed ${deleted} ${label} species`);
        }
      }
      
      // 2. Delete by non-North American families
      console.log('\n2️⃣  Removing non-North American families...');
      
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
      
      for (const family of excludedFamilies) {
        const deleted = deleteAndCount(db, `DELETE FROM birds WHERE family = ?`, [family]);
        if (deleted > 0) {
          totalDeleted += deleted;
          console.log(`   ✓ Removed ${deleted} ${family}`);
        }
      }
      
      // 3. Remove Old World warblers, flycatchers, and other Palearctic species
      console.log('\n3️⃣  Removing Old World species...');
      
      const oldWorldPatterns = [
        ['Old World', "common_name LIKE '%Old World%'"],
        ['Eurasian (non-NA)', "common_name LIKE '%Eurasian%' AND common_name NOT LIKE '%Wigeon%' AND common_name NOT LIKE '%Teal%' AND common_name NOT LIKE '%Coot%' AND common_name NOT LIKE '%Woodcock%' AND common_name NOT LIKE '%Collared-Dove%'"],
      ];
      
      for (const [label, condition] of oldWorldPatterns) {
        const deleted = deleteAndCount(db, `DELETE FROM birds WHERE ${condition}`);
        if (deleted > 0) {
          totalDeleted += deleted;
          console.log(`   ✓ Removed ${deleted} ${label} species`);
        }
      }
      
      // 4. Remove species from exclusively southern hemisphere regions
      console.log('\n4️⃣  Removing southern hemisphere indicators...');
      
      const southernPatterns = [
        ['Falkland', "common_name LIKE '%Falkland%'"],
        ['Galapagos', "common_name LIKE '%Galapagos%'"],
        ['Tristan', "common_name LIKE '%Tristan%'"],
        ['Gough', "common_name LIKE '%Gough%'"],
        ['Amsterdam', "common_name LIKE '%Amsterdam%'"],
      ];
      
      for (const [label, condition] of southernPatterns) {
        const deleted = deleteAndCount(db, `DELETE FROM birds WHERE ${condition}`);
        if (deleted > 0) {
          totalDeleted += deleted;
          console.log(`   ✓ Removed ${deleted} ${label} species`);
        }
      }
      
      // 5. Remove species from specific non-NA island groups
      console.log('\n5️⃣  Removing island species...');
      
      const islandPatterns = [
        ['Seychelles', "common_name LIKE '%Seychelles%'"],
        ['Mauritius', "common_name LIKE '%Mauritius%'"],
        ['Reunion', "common_name LIKE '%Reunion%'"],
        ['Comoro', "common_name LIKE '%Comoro%'"],
        ['Socotra', "common_name LIKE '%Socotra%'"],
      ];
      
      for (const [label, condition] of islandPatterns) {
        const deleted = deleteAndCount(db, `DELETE FROM birds WHERE ${condition}`);
        if (deleted > 0) {
          totalDeleted += deleted;
          console.log(`   ✓ Removed ${deleted} ${label} species`);
        }
      }
    });
    
    // Get final count
    const afterCount = db.prepare('SELECT COUNT(*) as count FROM birds').get() as { count: number };
    console.log(`\n📊 Final count: ${afterCount.count} species`);
    console.log(`🗑️  Total deleted: ${totalDeleted} species`);
    console.log(`📉 Reduction: ${((totalDeleted / beforeCount.count) * 100).toFixed(1)}%\n`);
    
    // Verify North American species are present
    console.log('✅ Verification - Sample North American species:');
    const samples = db.prepare(`
      SELECT common_name, id 
      FROM birds 
      WHERE common_name IN (
        'Blue Jay',
        'American Robin',
        'Northern Cardinal',
        'Red-tailed Hawk',
        'Great Horned Owl',
        'Ruby-throated Hummingbird',
        'American Goldfinch',
        'Song Sparrow',
        'Eastern Bluebird',
        'Carolina Wren'
      )
      ORDER BY common_name
    `).all();
    
    samples.forEach((bird: any) => {
      console.log(`   ✓ ${bird.common_name} (${bird.id})`);
    });
    
    if (samples.length === 0) {
      console.log('   ⚠️  Warning: Sample North American species not found!');
    }
    
    // Show random sample of remaining birds
    console.log('\n📋 Random sample of remaining species:');
    const randomSample = db.prepare(`
      SELECT common_name 
      FROM birds 
      ORDER BY RANDOM() 
      LIMIT 10
    `).all();
    
    randomSample.forEach((bird: any) => {
      console.log(`   • ${bird.common_name}`);
    });
    
    console.log('\n✅ Filtering complete!\n');
    
  } catch (error) {
    console.error('❌ Error during filtering:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  filterNASpecies()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

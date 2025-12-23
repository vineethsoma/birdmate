import { readFileSync } from 'fs';
import { resolve } from 'path';
import { db } from '../client.js';
import { logger } from '../../utils/logging.js';

const TAXONOMY_CSV_PATH = resolve(process.cwd(), '../../database/ebird-taxonomy.csv');
const NORTH_AMERICAN_FAMILIES = [
  'Anatidae', 'Phasianidae', 'Podicipedidae', 'Columbidae', 'Cuculidae',
  'Caprimulgidae', 'Apodidae', 'Trochilidae', 'Rallidae', 'Gruidae',
  'Charadriidae', 'Scolopacidae', 'Laridae', 'Gaviidae', 'Procellariidae',
  'Ciconiidae', 'Phalacrocoracidae', 'Pelecanidae', 'Ardeidae', 'Threskiornithidae',
  'Cathartidae', 'Pandionidae', 'Accipitridae', 'Tytonidae', 'Strigidae',
  'Alcedinidae', 'Picidae', 'Falconidae', 'Tyrannidae', 'Vireonidae',
  'Corvidae', 'Alaudidae', 'Hirundinidae', 'Paridae', 'Aegithalidae',
  'Sittidae', 'Certhiidae', 'Troglodytidae', 'Polioptilidae', 'Regulidae',
  'Turdidae', 'Mimidae', 'Sturnidae', 'Bombycillidae', 'Passeridae',
  'Fringillidae', 'Passerellidae', 'Icteridae', 'Parulidae', 'Cardinalidae',
];

interface TaxonomyRecord {
  speciesCode: string;
  commonName: string;
  scientificName: string;
  category: string;
  taxonomyOrder: number;
  familyCommonName: string;
  familyScientificName: string;
  reportAsSpecies: boolean;
}

export function seedTaxonomy(): void {
  logger.info('Starting taxonomy seed');

  try {
    const csvContent = readFileSync(TAXONOMY_CSV_PATH, 'utf-8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map((h) => h.trim());

    const insertTaxonomy = db.prepare(`
      INSERT INTO taxonomy_metadata (
        species_code, common_name, scientific_name, category,
        taxonomy_order, family_common_name, family_scientific_name,
        report_as_species, raw_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertBird = db.prepare(`
      INSERT INTO birds (
        common_name, scientific_name, taxonomy_order,
        category, family_name
      ) VALUES (?, ?, ?, ?, ?)
    `);

    let taxonomyCount = 0;
    let birdCount = 0;

    const transaction = db.transaction(() => {
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map((v) => v.trim());
        const record: TaxonomyRecord = {
          speciesCode: values[headers.indexOf('SPECIES_CODE')],
          commonName: values[headers.indexOf('PRIMARY_COM_NAME')],
          scientificName: values[headers.indexOf('SCI_NAME')],
          category: values[headers.indexOf('CATEGORY')],
          taxonomyOrder: parseInt(values[headers.indexOf('TAXON_ORDER')], 10),
          familyCommonName: values[headers.indexOf('FAMILY_COM_NAME')],
          familyScientificName: values[headers.indexOf('FAMILY_SCI_NAME')],
          reportAsSpecies: values[headers.indexOf('REPORT_AS')] === '1',
        };

        // Insert into taxonomy_metadata
        insertTaxonomy.run(
          record.speciesCode,
          record.commonName,
          record.scientificName,
          record.category,
          record.taxonomyOrder,
          record.familyCommonName,
          record.familyScientificName,
          record.reportAsSpecies ? 1 : 0,
          JSON.stringify(record)
        );
        taxonomyCount++;

        // Insert North American species into birds table
        if (
          record.category === 'species' &&
          NORTH_AMERICAN_FAMILIES.includes(record.familyScientificName)
        ) {
          insertBird.run(
            record.commonName,
            record.scientificName,
            record.taxonomyOrder,
            record.category,
            record.familyScientificName
          );
          birdCount++;
        }
      }
    });

    transaction();

    logger.info('Taxonomy seed completed', {
      taxonomyRecords: taxonomyCount,
      birdSpecies: birdCount,
    });
  } catch (error) {
    logger.error('Taxonomy seed failed', {}, error as Error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedTaxonomy();
  process.exit(0);
}

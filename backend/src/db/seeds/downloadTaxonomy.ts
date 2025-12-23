import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { logger } from '../../utils/logging.js';

const EBIRD_TAXONOMY_URL = 'https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=csv';
const OUTPUT_PATH = resolve(process.cwd(), '../../database/ebird-taxonomy.csv');

export async function downloadEbirdTaxonomy(): Promise<void> {
  logger.info('Starting eBird taxonomy download');

  try {
    const response = await fetch(EBIRD_TAXONOMY_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvData = await response.text();
    writeFileSync(OUTPUT_PATH, csvData, 'utf-8');

    logger.info('eBird taxonomy downloaded successfully', {
      path: OUTPUT_PATH,
      size: csvData.length,
    });
  } catch (error) {
    logger.error('Failed to download eBird taxonomy', {}, error as Error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  downloadEbirdTaxonomy()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

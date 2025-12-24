/**
 * Database migration runner
 * 
 * Executes SQL schema migrations in order
 */

import { resolve } from 'path';
import { runMigration } from '../client.js';

const SCHEMA_PATH = resolve(process.cwd(), '../database/schema.sql');

async function main(): Promise<void> {
  console.log('🔄 Running database migrations...');
  
  try {
    await runMigration(SCHEMA_PATH);
    console.log('✅ All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();

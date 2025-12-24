/**
 * SQLite database client wrapper with connection pooling
 * 
 * Provides a singleton database connection with transaction support
 * and proper error handling.
 */

import Database from 'better-sqlite3';
import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

const DATABASE_PATH = process.env.DATABASE_PATH || './database/birdmate.db';

let db: Database.Database | null = null;

/**
 * Initialize database connection
 * Creates database file and directory if they don't exist
 */
export function initializeDatabase(): Database.Database {
  if (db) {
    return db;
  }

  // Ensure database directory exists
  const dbDir = resolve(DATABASE_PATH, '..');
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(resolve(DATABASE_PATH), {
    verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
  });

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Performance optimizations
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('cache_size = -64000'); // 64MB cache

  console.log(`✅ Database initialized: ${DATABASE_PATH}`);

  return db;
}

/**
 * Get database instance (singleton pattern)
 */
export function getDatabase(): Database.Database {
  if (!db) {
    return initializeDatabase();
  }
  return db;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('✅ Database connection closed');
  }
}

/**
 * Execute a transaction with automatic rollback on error
 * 
 * @param callback - Function to execute within transaction
 * @returns Result of the callback
 */
export function transaction<T>(callback: (db: Database.Database) => T): T {
  const database = getDatabase();
  const transactionFn = database.transaction(callback);
  return transactionFn(database);
}

/**
 * Run database migrations
 * 
 * @param sqlFilePath - Path to SQL schema file
 */
export async function runMigration(sqlFilePath: string): Promise<void> {
  const { readFileSync } = await import('fs');
  const sql = readFileSync(sqlFilePath, 'utf-8');
  
  const database = getDatabase();
  
  try {
    // Execute entire schema as one statement
    database.exec(sql);
    console.log(`✅ Migration applied: ${sqlFilePath}`);
  } catch (error) {
    console.error(`❌ Migration failed:`, error);
    throw error;
  }
}

/**
 * Health check: verify database is accessible
 */
export function healthCheck(): boolean {
  try {
    const database = getDatabase();
    const result = database.prepare('SELECT 1 as health').get() as { health: number };
    return result.health === 1;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}

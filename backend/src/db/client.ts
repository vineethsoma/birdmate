import Database from 'better-sqlite3';
import { resolve } from 'path';
import { logger } from '../utils/logging.js';

const DATABASE_PATH = process.env.DATABASE_PATH || resolve(process.cwd(), '../database/birdmate.db');

let dbInstance: Database.Database | null = null;

export function getDatabaseConnection(): Database.Database {
  if (!dbInstance) {
    try {
      dbInstance = new Database(DATABASE_PATH, {
        verbose: process.env.NODE_ENV === 'development' ? logger.debug : undefined,
      });

      // Enable foreign keys
      dbInstance.pragma('foreign_keys = ON');
      
      // Set journal mode for better concurrency
      dbInstance.pragma('journal_mode = WAL');

      logger.info('Database connection established', { path: DATABASE_PATH });
    } catch (error) {
      logger.fatal('Failed to connect to database', { path: DATABASE_PATH }, error as Error);
      throw error;
    }
  }

  return dbInstance;
}

export function closeDatabaseConnection(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    logger.info('Database connection closed');
  }
}

export const db = getDatabaseConnection();

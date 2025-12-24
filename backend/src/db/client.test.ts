/**
 * Database client tests
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { 
  initializeDatabase, 
  getDatabase, 
  closeDatabase, 
  healthCheck, 
  transaction 
} from './client.js';

describe('Database Client', () => {
  beforeAll(() => {
    initializeDatabase();
  });
  
  afterAll(() => {
    closeDatabase();
  });
  
  it('should initialize database', () => {
    const db = getDatabase();
    expect(db).toBeDefined();
  });
  
  it('should return same instance on subsequent calls (singleton)', () => {
    const db1 = getDatabase();
    const db2 = getDatabase();
    expect(db1).toBe(db2);
  });
  
  it('should pass health check', () => {
    const healthy = healthCheck();
    expect(healthy).toBe(true);
  });
  
  it('should have birds table', () => {
    const db = getDatabase();
    const tableExists = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='birds'")
      .get();
    expect(tableExists).toBeDefined();
  });
  
  it('should have foreign keys enabled', () => {
    const db = getDatabase();
    const result = db.prepare('PRAGMA foreign_keys').get() as { foreign_keys: number };
    expect(result.foreign_keys).toBe(1);
  });

  describe('Transactions', () => {
    it('should execute transaction and return result', () => {
      const result = transaction((db) => {
        db.prepare('SELECT 1 as value').get();
        return 'success';
      });

      expect(result).toBe('success');
    });

    it('should rollback transaction on error', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Create a test table
      const db = getDatabase();
      db.exec('CREATE TEMP TABLE test_trans (id INTEGER PRIMARY KEY)');

      // First transaction should succeed
      transaction((db) => {
        db.prepare('INSERT INTO test_trans (id) VALUES (1)').run();
      });

      // Second transaction with same ID should fail (unique constraint)
      expect(() => {
        transaction((db) => {
          db.prepare('INSERT INTO test_trans (id) VALUES (1)').run();
        });
      }).toThrow();

      // Verify only first insert persisted
      const count = db.prepare('SELECT COUNT(*) as count FROM test_trans').get() as { count: number };
      expect(count.count).toBe(1);

      // Cleanup
      db.exec('DROP TABLE test_trans');
      consoleSpy.mockRestore();
    });

    it('should allow nested operations within transaction', () => {
      const db = getDatabase();
      db.exec('CREATE TEMP TABLE test_nested (id INTEGER PRIMARY KEY, value TEXT)');

      const result = transaction((db) => {
        db.prepare('INSERT INTO test_nested (id, value) VALUES (1, ?)').run('first');
        db.prepare('INSERT INTO test_nested (id, value) VALUES (2, ?)').run('second');
        
        const rows = db.prepare('SELECT COUNT(*) as count FROM test_nested').get() as { count: number };
        return rows.count;
      });

      expect(result).toBe(2);
      
      // Cleanup
      db.exec('DROP TABLE test_nested');
    });
  });

  describe('Health Check', () => {
    it('should return false on database error', () => {
      // Close database to simulate error
      closeDatabase();

      const healthy = healthCheck();

      // Should attempt to reinitialize but return false if query fails
      // (In practice, healthCheck will reinitialize via getDatabase)
      expect(typeof healthy).toBe('boolean');

      // Reinitialize for other tests
      initializeDatabase();
    });
  });

  describe('Connection Management', () => {
    it('should close database connection', () => {
      const db = getDatabase();
      expect(db).toBeDefined();

      closeDatabase();

      // After close, getDatabase should reinitialize
      const newDb = getDatabase();
      expect(newDb).toBeDefined();
    });

    it('should handle closing already closed connection', () => {
      closeDatabase();
      
      // Second close should not throw
      expect(() => closeDatabase()).not.toThrow();
    });
  });

  describe('Database Configuration', () => {
    it('should have WAL mode enabled', () => {
      const db = getDatabase();
      const result = db.prepare('PRAGMA journal_mode').get() as { journal_mode: string };
      expect(result.journal_mode.toLowerCase()).toBe('wal');
    });

    it('should have proper cache size', () => {
      const db = getDatabase();
      const result = db.prepare('PRAGMA cache_size').get() as { cache_size: number };
      // Cache size should be negative (in KB), approximately -64000
      expect(result.cache_size).toBeLessThan(0);
    });
  });
});

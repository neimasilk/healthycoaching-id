/**
 * Unit Tests: DatabaseManager
 * Location: src/core/data/local/database/__tests__/DatabaseManager.test.ts
 */

import { DatabaseManager, DatabaseInitializationError, DatabaseQueryError } from '@/core/data/local/database/DatabaseManager';

// Mock react-native-sqlite-storage
jest.mock('react-native-sqlite-storage', () => ({
  openDatabase: jest.fn()
}));

describe('DatabaseManager', () => {
  let dbManager: DatabaseManager;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    dbManager = new DatabaseManager({
      name: 'test.db',
      version: '1.0.0'
    });

    // Mock database connection
    mockDb = {
      executeSql: jest.fn(),
      transaction: jest.fn(),
      close: jest.fn()
    };

    const { openDatabase } = require('react-native-sqlite-storage');
    openDatabase.mockResolvedValue(mockDb);
  });

  describe('Constructor', () => {
    it('should create with default config', () => {
      const manager = new DatabaseManager();

      expect(manager['config'].name).toBe('healthycoaching_id.db');
      expect(manager['config'].version).toBe('1.0.0');
    });

    it('should create with custom config', () => {
      const customConfig = {
        name: 'custom.db',
        version: '2.0.0',
        location: 'Library' as const,
        readOnly: true
      };

      const manager = new DatabaseManager(customConfig);

      expect(manager['config'].name).toBe('custom.db');
      expect(manager['config'].version).toBe('2.0.0');
      expect(manager['config'].location).toBe('Library');
      expect(manager['config'].readOnly).toBe(true);
    });
  });

  describe('initialize', () => {
    it('should initialize database successfully', async () => {
      // Mock executeSql implementation
      mockDb.executeSql.mockImplementation((sql, params, success, error) => {
        if (sql.includes('PRAGMA')) {
          success(null, { insertId: null, rowsAffected: 1, rows: [] });
        }
        return { test: true };
      });

      await dbManager.initialize();

      expect(dbManager.isActive()).toBe(true);
      expect(mockDb.executeSql).toHaveBeenCalledWith(
        'PRAGMA foreign_keys = ON',
        [],
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should throw DatabaseInitializationError on failure', async () => {
      const { openDatabase } = require('react-native-sqlite-storage');
      openDatabase.mockRejectedValue(new Error('Database connection failed'));

      await expect(dbManager.initialize()).rejects.toThrow(DatabaseInitializationError);
    });

    it('should not initialize twice', async () => {
      mockDb.executeSql.mockImplementation((sql, params, success) => {
        success(null, { insertId: null, rowsAffected: 1, rows: [] });
        return { test: true };
      });

      await dbManager.initialize();
      await dbManager.initialize(); // Should not error

      expect(dbManager.isActive()).toBe(true);
    });
  });

  describe('query', () => {
    beforeEach(async () => {
      mockDb.executeSql.mockImplementation((sql, params, success) => {
        success(null, { insertId: null, rowsAffected: 0, rows: [] });
        return { test: true };
      });

      await dbManager.initialize();
      mockDb.executeSql.mockClear();
    });

    it('should execute SELECT query successfully', async () => {
      const mockRows = [{ id: 1, name: 'Test' }];
      mockDb.executeSql.mockImplementation((sql, params, success) => {
        success(null, { insertId: null, rowsAffected: 0, rows: { length: 1, item: (index) => mockRows[index] } });
        return { test: true };
      });

      const result = await dbManager.query('SELECT * FROM test', []);

      expect(result.rows).toEqual(mockRows);
      expect(result.rowsAffected).toBe(0);
    });

    it('should cache SELECT queries', async () => {
      const mockRows = [{ id: 1, name: 'Test' }];
      mockDb.executeSql.mockImplementation((sql, params, success) => {
        success(null, { insertId: null, rowsAffected: 0, rows: { length: 1, item: (index) => mockRows[index] } });
        return { test: true };
      });

      // First call
      const result1 = await dbManager.query('SELECT * FROM test', []);
      // Second call should use cache
      const result2 = await dbManager.query('SELECT * FROM test', []);

      expect(result1.rows).toEqual(mockRows);
      expect(result2.rows).toEqual(mockRows);
      expect(mockDb.executeSql).toHaveBeenCalledTimes(1); // Called only once due to cache
    });

    it('should throw DatabaseQueryError on query failure', async () => {
      mockDb.executeSql.mockImplementation((sql, params, success, error) => {
        error(null, { message: 'SQL error' });
        return { test: true };
      });

      await expect(dbManager.query('INVALID SQL', [])).rejects.toThrow(DatabaseQueryError);
    });

    it('should throw DatabaseNotInitializedError if not initialized', async () => {
      const uninitializedManager = new DatabaseManager();

      await expect(uninitializedManager.query('SELECT 1', [])).rejects.toThrow('Database not initialized');
    });
  });

  describe('execute', () => {
    beforeEach(async () => {
      mockDb.executeSql.mockImplementation((sql, params, success) => {
        success(null, { insertId: 1, rowsAffected: 1, rows: [] });
        return { test: true };
      });

      await dbManager.initialize();
      mockDb.executeSql.mockClear();
    });

    it('should execute INSERT query successfully', async () => {
      const result = await dbManager.execute('INSERT INTO test (name) VALUES (?)', ['Test']);

      expect(result.insertId).toBe(1);
      expect(result.rowsAffected).toBe(1);
    });

    it('should clear cache after write operation', async () => {
      const mockRows = [{ id: 1, name: 'Test' }];

      // Cache a read query first
      mockDb.executeSql.mockImplementation((sql, params, success) => {
        if (sql.includes('SELECT')) {
          success(null, { insertId: null, rowsAffected: 0, rows: { length: 1, item: (index) => mockRows[index] } });
        } else {
          success(null, { insertId: 1, rowsAffected: 1, rows: [] });
        }
        return { test: true };
      });

      await dbManager.query('SELECT * FROM test', []);
      await dbManager.execute('INSERT INTO test (name) VALUES (?)', ['Test']);

      // Cache should be cleared, next SELECT should hit database again
      await dbManager.query('SELECT * FROM test', []);

      // executeSql should be called 3 times (SELECT, INSERT, SELECT again)
      expect(mockDb.executeSql).toHaveBeenCalledTimes(3);
    });
  });

  describe('transaction', () => {
    beforeEach(async () => {
      mockDb.executeSql.mockImplementation((sql, params, success) => {
        success(null, { insertId: null, rowsAffected: 0, rows: [] });
        return { test: true };
      });

      mockDb.transaction.mockImplementation((callback) => {
        const mockTx = {
          executeSql: jest.fn().mockImplementation((sql, params, success) => {
            success(null, { insertId: null, rowsAffected: 0, rows: [] });
          })
        };
        callback(mockTx);
      });

      await dbManager.initialize();
      mockDb.executeSql.mockClear();
      mockDb.transaction.mockClear();
    });

    it('should execute transaction successfully', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      mockDb.transaction.mockImplementation((callback) => {
        const mockTx = {
          executeSql: jest.fn().mockImplementation((sql, params, success) => {
            success(null, { insertId: null, rowsAffected: 0, rows: [] });
          })
        };
        callback(mockTx);
      });

      const result = await dbManager.transaction(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();
      expect(mockDb.transaction).toHaveBeenCalled();
    });

    it('should throw DatabaseTransactionError on transaction failure', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Transaction failed'));

      mockDb.transaction.mockImplementation((callback) => {
        callback({
          executeSql: jest.fn()
        });
      });

      await expect(dbManager.transaction(operation)).rejects.toThrow('Transaction failed');
    });
  });

  describe('getStats', () => {
    beforeEach(async () => {
      mockDb.executeSql.mockImplementation((sql, params, success) => {
        if (sql.includes('sqlite_master')) {
          success(null, {
            insertId: null,
            rowsAffected: 0,
            rows: {
              length: 1,
              item: () => ({ name: 'test_table' })
            }
          });
        } else if (sql.includes('SELECT COUNT(*)')) {
          success(null, {
            insertId: null,
            rowsAffected: 0,
            rows: {
              length: 1,
              item: () => ({ count: 10 })
            }
          });
        } else {
          success(null, { insertId: null, rowsAffected: 0, rows: [] });
        }
        return { test: true };
      });

      await dbManager.initialize();
      mockDb.executeSql.mockClear();
    });

    it('should return database statistics', async () => {
      // Execute some queries to generate stats
      await dbManager.query('SELECT * FROM test', []);
      await dbManager.execute('INSERT INTO test (name) VALUES (?)', ['Test']);

      const stats = await dbManager.getStats();

      expect(stats).toHaveProperty('totalQueries');
      expect(stats).toHaveProperty('averageQueryTime');
      expect(stats).toHaveProperty('cacheHitRate');
      expect(stats).toHaveProperty('connectionPoolSize');
      expect(stats).toHaveProperty('lastCleanup');
      expect(stats).toHaveProperty('tableSizes');
    });

    it('should handle errors in stats calculation gracefully', async () => {
      mockDb.executeSql.mockImplementation((sql, params, success, error) => {
        if (error) {
          error(null, new Error('Stats error'));
        }
        return { test: true };
      });

      const stats = await dbManager.getStats();

      expect(stats).toHaveProperty('totalQueries', 0);
      expect(stats).toHaveProperty('averageQueryTime', 0);
      expect(stats).toHaveProperty('cacheHitRate', 0);
      expect(stats).toHaveProperty('tableSizes', {});
    });
  });

  describe('close', () => {
    beforeEach(async () => {
      mockDb.executeSql.mockImplementation((sql, params, success) => {
        success(null, { insertId: null, rowsAffected: 0, rows: [] });
        return { test: true };
      });

      await dbManager.initialize();
    });

    it('should close database successfully', async () => {
      await dbManager.close();

      expect(dbManager.isActive()).toBe(false);
      expect(mockDb.close).toHaveBeenCalled();
    });

    it('should handle close errors gracefully', async () => {
      mockDb.close.mockRejectedValue(new Error('Close failed'));

      await expect(dbManager.close()).rejects.toThrow('Close failed');
    });
  });

  describe('isActive', () => {
    it('should return false when not initialized', () => {
      expect(dbManager.isActive()).toBe(false);
    });

    it('should return true when initialized', async () => {
      mockDb.executeSql.mockImplementation((sql, params, success) => {
        success(null, { insertId: null, rowsAffected: 0, rows: [] });
        return { test: true };
      });

      await dbManager.initialize();

      expect(dbManager.isActive()).toBe(true);
    });
  });
});

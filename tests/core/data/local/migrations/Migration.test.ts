/**
 * Unit Tests: Migration System
 * Location: src/core/data/local/migrations/__tests__/Migration.test.ts
 */

import { Migration, MigrationManager } from '../Migration';
import { DatabaseManager } from '../../database/DatabaseManager';

// Mock DatabaseManager
jest.mock('../../database/DatabaseManager');

describe('Migration System', () => {
  let migrationManager: MigrationManager;
  let mockDb: jest.Mocked<DatabaseManager>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      query: jest.fn(),
      execute: jest.fn(),
      transaction: jest.fn()
    } as any;

    migrationManager = new MigrationManager(mockDb);
  });

  describe('Migration Base Class', () => {
    class TestMigration extends Migration {
      constructor(version: string, description: string) {
        super(version, description);
      }

      async up(): Promise<void> {
        // Test implementation
      }

      async down(): Promise<void> {
        // Test implementation
      }
    }

    it('should create migration with correct metadata', () => {
      const migration = new TestMigration('1.0.0', 'Test migration');

      const info = migration.getInfo();

      expect(info.version).toBe('1.0.0');
      expect(info.description).toBe('Test migration');
      expect(info.timestamp).toBeInstanceOf(Date);
    });

    it('should determine if migration needs execution', () => {
      const migration = new TestMigration('2.0.0', 'Newer migration');

      expect(migration.needsExecution('1.0.0')).toBe(true);
      expect(migration.needsExecution('2.0.0')).toBe(false);
      expect(migration.needsExecution('2.1.0')).toBe(false);
    });

    it('should compare version strings correctly', () => {
      const migration = new TestMigration('1.2.3', 'Version test');

      expect(migration.needsExecution('1.2.2')).toBe(true);
      expect(migration.needsExecution('1.2.3')).toBe(false);
      expect(migration.needsExecution('1.2.4')).toBe(false);
      expect(migration.needsExecution('2.0.0')).toBe(false);
    });
  });

  describe('MigrationManager', () => {
    describe('register', () => {
      it('should register migration', () => {
        const mockMigration = {
          getInfo: jest.fn().mockReturnValue({ version: '1.0.0', description: 'Test' })
        } as any;

        migrationManager.register(mockMigration);

        const allMigrations = migrationManager.getAllMigrations();
        expect(allMigrations).toContain(mockMigration);
      });

      it('should register multiple migrations', () => {
        const migration1 = { getInfo: jest.fn().mockReturnValue({ version: '1.0.0' }) } as any;
        const migration2 = { getInfo: jest.fn().mockReturnValue({ version: '1.1.0' }) } as any;

        migrationManager.register(migration1);
        migrationManager.register(migration2);

        const allMigrations = migrationManager.getAllMigrations();
        expect(allMigrations).toHaveLength(2);
      });
    });

    describe('getCurrentVersion', () => {
      it('should return current version from database', async () => {
        mockDb.query.mockResolvedValue({
          rows: [{ version: '1.2.0' }]
        });

        const version = await migrationManager.getCurrentVersion();

        expect(version).toBe('1.2.0');
        expect(mockDb.query).toHaveBeenCalledWith(`
          SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1
        `);
      });

      it('should return 0.0.0 when no migrations exist', async () => {
        mockDb.query.mockRejectedValue(new Error('Table not found'));

        const version = await migrationManager.getCurrentVersion();

        expect(version).toBe('0.0.0');
      });
    });

    describe('getPendingMigrations', () => {
      it('should return migrations that need execution', async () => {
        const currentVersion = '1.0.0';

        const migration1 = { needsExecution: jest.fn().mockReturnValue(false) } as any;
        const migration2 = { needsExecution: jest.fn().mockReturnValue(true) } as any;
        const migration3 = { needsExecution: jest.fn().mockReturnValue(false) } as any;

        migrationManager.register(migration1);
        migrationManager.register(migration2);
        migrationManager.register(migration3);

        mockDb.query.mockResolvedValue({
          rows: [{ version: currentVersion }]
        });

        const pending = await migrationManager.getPendingMigrations();

        expect(pending).toContain(migration2);
        expect(pending).not.toContain(migration1);
        expect(pending).not.toContain(migration3);
      });
    });

    describe('migrate', () => {
      beforeEach(() => {
        mockDb.query.mockResolvedValue({ rows: [] });
      });

      it('should execute pending migrations', async () => {
        const mockMigration = {
          version: '1.0.0',
          up: jest.fn().mockResolvedValue(undefined),
          getInfo: jest.fn().mockReturnValue({
            version: '1.0.0',
            description: 'Test migration',
            timestamp: new Date()
          }),
          needsExecution: jest.fn().mockReturnValue(true)
        } as any;

        migrationManager.register(mockMigration);

        mockDb.transaction.mockImplementation((callback) => {
          const mockTransaction = {
            execute: jest.fn().mockResolvedValue({}),
            query: jest.fn().mockResolvedValue([])
          };
          return callback(mockTransaction);
        });

        const results = await migrationManager.migrate();

        expect(results).toHaveLength(1);
        expect(results[0].success).toBe(true);
        expect(results[0].version).toBe('1.0.0');
        expect(mockMigration.up).toHaveBeenCalled();
      });

      it('should skip when no pending migrations', async () => {
        mockDb.query.mockResolvedValue({
          rows: [{ version: '1.0.0' }]
        });

        const results = await migrationManager.migrate();

        expect(results).toHaveLength(0);
        expect(mockDb.transaction).not.toHaveBeenCalled();
      });

      it('should handle migration failures', async () => {
        const mockMigration = {
          up: jest.fn().mockRejectedValue(new Error('Migration failed')),
          getInfo: jest.fn().mockReturnValue({
            version: '1.0.0',
            description: 'Failed migration',
            timestamp: new Date()
          }),
          needsExecution: jest.fn().mockReturnValue(true)
        } as any;

        migrationManager.register(mockMigration);

        mockDb.transaction.mockImplementation((callback) => {
          const mockTransaction = {
            execute: jest.fn(),
            query: jest.fn()
          };
          return callback(mockTransaction);
        });

        const results = await migrationManager.migrate();

        expect(results).toHaveLength(1);
        expect(results[0].success).toBe(false);
        expect(results[0].error).toBe('Migration failed');
      });
    });

    describe('rollback', () => {
      it('should rollback to target version', async () => {
        const mockMigration = {
          version: '1.1.0',
          down: jest.fn().mockResolvedValue(undefined),
          getInfo: jest.fn().mockReturnValue({
            version: '1.1.0',
            description: 'Rollback migration',
            timestamp: new Date()
          })
        } as any;

        migrationManager.register(mockMigration);

        mockDb.query
          .mockResolvedValueOnce({
            rows: [{ version: '1.1.0' }]
          })
          .mockResolvedValueOnce({
            rows: [{ version: '1.0.0' }]
          });

        mockDb.transaction.mockImplementation((callback) => {
          const mockTransaction = {
            execute: jest.fn().mockResolvedValue({}),
            query: jest.fn().mockResolvedValue([])
          };
          return callback(mockTransaction);
        });

        const results = await migrationManager.rollback('1.0.0');

        expect(results).toHaveLength(1);
        expect(results[0].success).toBe(true);
        expect(results[0].version).toBe('1.1.0');
        expect(mockMigration.down).toHaveBeenCalled();
      });

      it('should throw error when target version is newer than current', async () => {
        mockDb.query.mockResolvedValue({
          rows: [{ version: '1.0.0' }]
        });

        await expect(migrationManager.rollback('2.0.0')).rejects.toThrow(
          'Cannot rollback to 2.0.0 from 1.0.0'
        );
      });
    });

    describe('getHistory', () => {
      it('should return migration history', async () => {
        const mockHistory = [
          {
            version: '1.0.0',
            description: 'Initial migration',
            executed_at: Date.now()
          },
          {
            version: '1.1.0',
            description: 'Add Indonesian foods',
            executed_at: Date.now()
          }
        ];

        mockDb.query.mockResolvedValue({
          rows: mockHistory
        });

        const history = await migrationManager.getHistory();

        expect(history).toHaveLength(2);
        expect(history[0].version).toBe('1.0.0');
        expect(history[1].version).toBe('1.1.0');
      });

      it('should handle empty history gracefully', async () => {
        mockDb.query.mockRejectedValue(new Error('No history'));

        const history = await migrationManager.getHistory();

        expect(history).toHaveLength(0);
      });
    });

    describe('validateDependencies', () => {
      it('should detect duplicate versions', () => {
        const migration1 = { getInfo: jest.fn().mockReturnValue({ version: '1.0.0' }) } as any;
        const migration2 = { getInfo: jest.fn().mockReturnValue({ version: '1.0.0' }) } as any;

        migrationManager.register(migration1);
        migrationManager.register(migration2);

        const errors = migrationManager.validateDependencies();

        expect(errors).toContain('Duplicate migration versions: 1.0.0');
      });

      it('should detect invalid version format', () => {
        const migration1 = { getInfo: jest.fn().mockReturnValue({ version: '1.0' }) } as any;

        migrationManager.register(migration1);

        const errors = migrationManager.validateDependencies();

        expect(errors).toContain('Invalid version format: 1.0');
      });

      it('should return no errors for valid migrations', () => {
        const migration1 = { getInfo: jest.fn().mockReturnValue({ version: '1.0.0' }) } as any;
        const migration2 = { getInfo: jest.fn().mockReturnValue({ version: '1.1.0' }) } as any;

        migrationManager.register(migration1);
        migrationManager.register(migration2);

        const errors = migrationManager.validateDependencies();

        expect(errors).toHaveLength(0);
      });
    });
  });
});
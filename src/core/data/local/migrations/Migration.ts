/**
 * Migration Interface
 * Database migration system for schema updates
 * Location: src/core/data/local/migrations/Migration.ts
 */

import { DatabaseManager } from '../database/DatabaseManager';

export interface MigrationInfo {
  version: string;
  description: string;
  timestamp: Date;
  executedAt?: Date;
}

export interface MigrationResult {
  version: string;
  success: boolean;
  error?: string;
  executionTime: number;
}

export interface DatabaseTransaction {
  execute(sql: string, params?: any[]): Promise<any>;
  query(sql: string, params?: any[]): Promise<any[]>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export abstract class Migration {
  protected readonly version: string;
  protected readonly description: string;
  protected readonly timestamp: Date;

  constructor(version: string, description: string) {
    this.version = version;
    this.description = description;
    this.timestamp = new Date();
  }

  /**
   * Execute migration (upgrade)
   */
  abstract up(transaction: DatabaseTransaction): Promise<void>;

  /**
   * Rollback migration (downgrade)
   */
  abstract down(transaction: DatabaseTransaction): Promise<void>;

  /**
   * Get migration metadata
   */
  getInfo(): MigrationInfo {
    return {
      version: this.version,
      description: this.description,
      timestamp: this.timestamp
    };
  }

  /**
   * Get migration version (public)
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * Get migration description (public)
   */
  getDescription(): string {
    return this.description;
  }

  /**
   * Check if migration needs to be executed
   */
  needsExecution(currentVersion: string): boolean {
    return this.compareVersions(this.version, currentVersion) > 0;
  }

  /**
   * Compare version strings
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    const maxLength = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < maxLength; i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }

    return 0;
  }
}

/**
 * Migration manager for handling database schema updates
 */
export class MigrationManager {
  private migrations: Migration[] = [];

  constructor(private readonly db: DatabaseManager) {}

  /**
   * Register migration
   */
  register(migration: Migration): void {
    this.migrations.push(migration);
    console.log(`[Migration] Registered: ${migration.getVersion()} - ${migration.getDescription()}`);
  }

  /**
   * Get all registered migrations
   */
  getAllMigrations(): Migration[] {
    return [...this.migrations];
  }

  /**
   * Get pending migrations
   */
  async getPendingMigrations(): Promise<Migration[]> {
    const currentVersion = await this.getCurrentVersion();
    return this.migrations.filter(migration =>
      migration.needsExecution(currentVersion)
    );
  }

  /**
   * Get current database version
   */
  async getCurrentVersion(): Promise<string> {
    try {
      const result = await this.db.query(`
        SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1
      `);

      if (result.rows.length > 0) {
        return String(result.rows[0].version);
      }

      return '0.0.0';

    } catch (error) {
      // Schema migrations table doesn't exist yet
      return '0.0.0';
    }
  }

  /**
   * Create schema migrations table
   */
  private async createSchemaTable(): Promise<void> {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        executed_at INTEGER NOT NULL,
        checksum TEXT
      )
    `);

    console.log('[Migration] Schema migrations table created');
  }

  /**
   * Run all pending migrations
   */
  async migrate(): Promise<MigrationResult[]> {
    const results: MigrationResult[] = [];
    const startTime = Date.now();

    try {
      console.log('[Migration] Starting migration process');

      // Ensure schema table exists
      await this.createSchemaTable();

      const pendingMigrations = await this.getPendingMigrations();

      if (pendingMigrations.length === 0) {
        console.log('[Migration] No pending migrations');
        return results;
      }

      console.log(`[Migration] Found ${pendingMigrations.length} pending migrations`);

      // Execute migrations in transaction
      await this.db.transaction(async (transaction) => {
        for (const migration of pendingMigrations) {
          const migrationStartTime = Date.now();

          try {
            console.log(`[Migration] Executing: ${migration.getVersion()} - ${migration.getDescription()}`);

            // Execute migration
            await migration.up(transaction);

            // Record migration
            await this.recordMigration(transaction, migration);

            const executionTime = Date.now() - migrationStartTime;

            results.push({
              version: migration.getVersion(),
              success: true,
              executionTime
            });

            console.log(`[Migration] Completed: ${migration.getVersion()} (${executionTime}ms)`);

          } catch (error) {
            const executionTime = Date.now() - migrationStartTime;
            const errorMessage = error instanceof Error ? error.message : String(error);

            results.push({
              version: migration.getVersion(),
              success: false,
              error: errorMessage,
              executionTime
            });

            console.error(`[Migration] Failed: ${migration.getVersion()}`, error);
            throw error; // Rollback transaction
          }
        }
      });

      const totalTime = Date.now() - startTime;
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log(`[Migration] Migration completed: ${successful} success, ${failed} failed, ${totalTime}ms total`);

      return results;

    } catch (error) {
      console.error('[Migration] Migration process failed:', error);
      throw error;
    }
  }

  /**
   * Rollback to specific version
   */
  async rollback(targetVersion: string): Promise<MigrationResult[]> {
    const results: MigrationResult[] = [];
    const currentVersion = await this.getCurrentVersion();

    if (this.compareVersions(targetVersion, currentVersion) >= 0) {
      throw new Error(`Cannot rollback to ${targetVersion} from ${currentVersion}`);
    }

    try {
      console.log(`[Migration] Rolling back from ${currentVersion} to ${targetVersion}`);

      const migrationsToRollback = this.migrations
        .filter(migration =>
          this.compareVersions(migration.getVersion(), currentVersion) <= 0 &&
          this.compareVersions(migration.getVersion(), targetVersion) > 0
        )
        .sort((a, b) => this.compareVersions(b.getVersion(), a.getVersion())); // Reverse order

      await this.db.transaction(async (transaction) => {
        for (const migration of migrationsToRollback) {
          const migrationStartTime = Date.now();

          try {
            console.log(`[Migration] Rolling back: ${migration.getVersion()}`);

            // Execute rollback
            await migration.down(transaction);

            // Remove migration record
            await this.removeMigrationRecord(transaction, migration.getVersion());

            const executionTime = Date.now() - migrationStartTime;

            results.push({
              version: migration.getVersion(),
              success: true,
              executionTime
            });

            console.log(`[Migration] Rollback completed: ${migration.getVersion()}`);

          } catch (error) {
            const executionTime = Date.now() - migrationStartTime;
            const errorMessage = error instanceof Error ? error.message : String(error);

            results.push({
              version: migration.getVersion(),
              success: false,
              error: errorMessage,
              executionTime
            });

            console.error(`[Migration] Rollback failed: ${migration.getVersion()}`, error);
            throw error;
          }
        }
      });

      return results;

    } catch (error) {
      console.error('[Migration] Rollback process failed:', error);
      throw error;
    }
  }

  /**
   * Record migration execution
   */
  private async recordMigration(
    transaction: DatabaseTransaction,
    migration: Migration
  ): Promise<void> {
    const info = migration.getInfo();

    await transaction.execute(
      'INSERT INTO schema_migrations (version, description, executed_at) VALUES (?, ?, ?)',
      [info.version, info.description, Date.now()]
    );
  }

  /**
   * Remove migration record
   */
  private async removeMigrationRecord(
    transaction: DatabaseTransaction,
    version: string
  ): Promise<void> {
    await transaction.execute(
      'DELETE FROM schema_migrations WHERE version = ?',
      [version]
    );
  }

  /**
   * Get migration history
   */
  async getHistory(): Promise<MigrationInfo[]> {
    try {
      const result = await this.db.query(`
        SELECT version, description, executed_at
        FROM schema_migrations
        ORDER BY version ASC
      `);

      return result.rows.map((row: Record<string, unknown>) => ({
        version: String(row.version),
        description: String(row.description),
        timestamp: new Date(),
        executedAt: new Date(String(row.executed_at))
      }));

    } catch (error) {
      console.error('[Migration] Failed to get migration history:', error);
      return [];
    }
  }

  /**
   * Compare version strings
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    const maxLength = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < maxLength; i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }

    return 0;
  }

  /**
   * Validate migration dependencies
   */
  validateDependencies(): string[] {
    const errors: string[] = [];
    const versions = this.migrations.map(m => m.getVersion());

    // Check for duplicate versions
    const duplicates = versions.filter((version, index) => versions.indexOf(version) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate migration versions: ${duplicates.join(', ')}`);
    }

    // Check version format
    const invalidVersions = versions.filter(version => !/^\d+\.\d+\.\d+$/.test(version));
    if (invalidVersions.length > 0) {
      errors.push(`Invalid version format: ${invalidVersions.join(', ')}`);
    }

    return errors;
  }
}
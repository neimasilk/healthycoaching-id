/**
 * Database Manager
 * Centralized database management with SQLite
 * Location: src/core/data/local/database/DatabaseManager.ts
 */

import { openDatabase, SQLiteDatabase } from 'react-native-sqlite-storage';
import { BaseError } from '../../../../shared/errors/BaseError';
import { generateCorrelationId } from '../../../../shared/utils/correlationId';

export interface DatabaseConfig {
  name: string;
  version: string;
  location?: 'default' | 'Library' | 'Documents';
  createFromLocation?: number;
  readOnly?: boolean;
}

export interface ConnectionPoolConfig {
  maxConnections: number;
  minConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
}

export interface QueryResult {
  insertId?: number;
  rowsAffected: number;
  rows: any[];
}

export interface DatabaseStats {
  totalQueries: number;
  averageQueryTime: number;
  cacheHitRate: number;
  connectionPoolSize: number;
  lastCleanup: Date;
  tableSizes: Record<string, number>;
}

export class DatabaseManager {
  private db: SQLiteDatabase | null = null;
  private isInitialized = false;
  private queryCache = new Map<string, any[]>();
  private connectionPool: SQLiteDatabase[] = [];
  private queryStats = {
    totalQueries: 0,
    totalTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  };

  private readonly config: DatabaseConfig;
  private readonly poolConfig: ConnectionPoolConfig;

  constructor(config?: Partial<DatabaseConfig>) {
    this.config = {
      name: 'healthycoaching_id.db',
      version: '1.0.0',
      location: 'default',
      readOnly: false,
      ...config
    };

    this.poolConfig = {
      maxConnections: 5,
      minConnections: 1,
      connectionTimeout: 5000,
      idleTimeout: 30000
    };
  }

  /**
   * Initialize database connection
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        return;
      }

      console.log(`[Database] Initializing database: ${this.config.name}`);

      this.db = await openDatabase({
        name: this.config.name,
        location: this.config.location,
        createFromLocation: this.config.createFromLocation,
        readOnly: this.config.readOnly
      });

      // Enable foreign keys
      await this.execute('PRAGMA foreign_keys = ON');

      // Set up performance optimizations
      await this.execute('PRAGMA journal_mode = WAL');
      await this.execute('PRAGMA synchronous = NORMAL');
      await this.execute('PRAGMA cache_size = 10000');
      await this.execute('PRAGMA temp_store = MEMORY');

      // Initialize connection pool
      await this.initializeConnectionPool();

      this.isInitialized = true;
      console.log('[Database] Database initialized successfully');

    } catch (error) {
      const correlationId = generateCorrelationId();
      throw new DatabaseInitializationError(
        `Failed to initialize database: ${error}`,
        this.config.name,
        correlationId
      );
    }
  }

  /**
   * Initialize connection pool for better performance
   */
  private async initializeConnectionPool(): Promise<void> {
    const connections: SQLiteDatabase[] = [];

    for (let i = 0; i < this.poolConfig.minConnections; i++) {
      try {
        const connection = await openDatabase({
          name: this.config.name,
          location: this.config.location,
          readOnly: this.config.readOnly
        });
        connections.push(connection);
      } catch (error) {
        console.warn(`[Database] Failed to create connection ${i + 1}:`, error);
      }
    }

    this.connectionPool = connections;
  }

  /**
   * Get connection from pool
   */
  private async getConnection(): Promise<SQLiteDatabase> {
    if (this.connectionPool.length > 0) {
      return this.connectionPool.pop()!;
    }

    // Create new connection if pool is empty
    return await openDatabase({
      name: this.config.name,
      location: this.config.location,
      readOnly: this.config.readOnly
    });
  }

  /**
   * Return connection to pool
   */
  private returnConnection(connection: SQLiteDatabase): void {
    if (this.connectionPool.length < this.poolConfig.maxConnections) {
      this.connectionPool.push(connection);
    } else {
      // Close connection if pool is full
      connection.close();
    }
  }

  /**
   * Execute read query (SELECT)
   */
  async query(
    sql: string,
    params: any[] = []
  ): Promise<QueryResult> {
    const correlationId = generateCorrelationId();
    const startTime = Date.now();

    try {
      if (!this.isInitialized || !this.db) {
        throw new DatabaseNotInitializedError(
          'Database not initialized',
          correlationId
        );
      }

      const cacheKey = `${sql}:${JSON.stringify(params)}`;

      // Check cache for read queries
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        if (this.queryCache.has(cacheKey)) {
          this.queryStats.cacheHits++;
          return {
            rows: this.queryCache.get(cacheKey)!,
            rowsAffected: 0
          };
        }
        this.queryStats.cacheMisses++;
      }

      const connection = await this.getConnection();
      const result = await this.executeQuery(connection, sql, params);
      this.returnConnection(connection);

      // Cache read results
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        this.queryCache.set(cacheKey, result.rows);

        // Limit cache size
        if (this.queryCache.size > 100) {
          const firstKey = this.queryCache.keys().next().value;
          this.queryCache.delete(firstKey);
        }
      }

      // Update stats
      const queryTime = Date.now() - startTime;
      this.queryStats.totalQueries++;
      this.queryStats.totalTime += queryTime;

      console.log(`[Database] Query executed in ${queryTime}ms`, {
        correlationId,
        sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
        params: params.length
      });

      return result;

    } catch (error) {
      console.error(`[Database] Query failed`, {
        correlationId,
        sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
        params,
        error: error
      });

      throw new DatabaseQueryError(
        `Query execution failed: ${error}`,
        sql,
        params,
        correlationId
      );
    }
  }

  /**
   * Execute write query (INSERT, UPDATE, DELETE)
   */
  async execute(
    sql: string,
    params: any[] = []
  ): Promise<QueryResult> {
    const correlationId = generateCorrelationId();
    const startTime = Date.now();

    try {
      if (!this.isInitialized || !this.db) {
        throw new DatabaseNotInitializedError(
          'Database not initialized',
          correlationId
        );
      }

      const connection = await this.getConnection();
      const result = await this.executeQuery(connection, sql, params);
      this.returnConnection(connection);

      // Invalidate cache for write operations
      this.clearCache();

      // Update stats
      const queryTime = Date.now() - startTime;
      this.queryStats.totalQueries++;
      this.queryStats.totalTime += queryTime;

      console.log(`[Database] Write query executed in ${queryTime}ms`, {
        correlationId,
        sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
        rowsAffected: result.rowsAffected
      });

      return result;

    } catch (error) {
      console.error(`[Database] Write query failed`, {
        correlationId,
        sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
        params,
        error: error
      });

      throw new DatabaseQueryError(
        `Write query execution failed: ${error}`,
        sql,
        params,
        correlationId
      );
    }
  }

  /**
   * Execute query with connection
   */
  private async executeQuery(
    connection: SQLiteDatabase,
    sql: string,
    params: any[]
  ): Promise<QueryResult> {
    return new Promise((resolve, reject) => {
      connection.executeSql(
        sql,
        params,
        (_, result) => {
          const rows: any[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            rows.push(result.rows.item(i));
          }

          resolve({
            insertId: result.insertId || undefined,
            rowsAffected: result.rowsAffected,
            rows
          });
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  }

  /**
   * Execute transaction
   */
  async transaction<T>(
    operations: (transaction: DatabaseTransaction) => Promise<T>
  ): Promise<T> {
    const correlationId = generateCorrelationId();
    const startTime = Date.now();

    try {
      if (!this.isInitialized || !this.db) {
        throw new DatabaseNotInitializedError(
          'Database not initialized',
          correlationId
        );
      }

      console.log('[Database] Starting transaction', { correlationId });

      const result = await new Promise<T>((resolve, reject) => {
        this.db!.transaction((tx) => {
          const transaction: DatabaseTransaction = {
            execute: async (sql: string, params: any[] = []) => {
              return new Promise<QueryResult>((execResolve, execReject) => {
                tx.executeSql(
                  sql,
                  params,
                  (_, result) => {
                    const rows: any[] = [];
                    for (let i = 0; i < result.rows.length; i++) {
                      rows.push(result.rows.item(i));
                    }

                    execResolve({
                      insertId: result.insertId || undefined,
                      rowsAffected: result.rowsAffected,
                      rows
                    });
                  },
                  (_, error) => {
                    execReject(error);
                    return false;
                  }
                );
              });
            },
            query: async (sql: string, params: any[] = []) => {
              return new Promise<any[]>((queryResolve, queryReject) => {
                tx.executeSql(
                  sql,
                  params,
                  (_, result) => {
                    const rows: any[] = [];
                    for (let i = 0; i < result.rows.length; i++) {
                      rows.push(result.rows.item(i));
                    }
                    queryResolve(rows);
                  },
                  (_, error) => {
                    queryReject(error);
                    return false;
                  }
                );
              });
            },
            commit: async () => {
              // Transaction auto-commits
            },
            rollback: async () => {
              // Transaction auto-rolls back on error
            }
          };

          operations(transaction).then(resolve).catch(reject);
        });
      });

      const transactionTime = Date.now() - startTime;
      console.log(`[Database] Transaction completed in ${transactionTime}ms`, {
        correlationId
      });

      return result;

    } catch (error) {
      console.error(`[Database] Transaction failed`, {
        correlationId,
        error
      });

      throw new DatabaseTransactionError(
        `Transaction failed: ${error}`,
        correlationId
      );
    }
  }

  /**
   * Clear query cache
   */
  clearCache(): void {
    this.queryCache.clear();
    console.log('[Database] Query cache cleared');
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<DatabaseStats> {
    try {
      const tableSizes = await this.getTableSizes();

      return {
        totalQueries: this.queryStats.totalQueries,
        averageQueryTime: this.queryStats.totalQueries > 0
          ? this.queryStats.totalTime / this.queryStats.totalQueries
          : 0,
        cacheHitRate: this.queryStats.cacheHits + this.queryStats.cacheMisses > 0
          ? this.queryStats.cacheHits / (this.queryStats.cacheHits + this.queryStats.cacheMisses)
          : 0,
        connectionPoolSize: this.connectionPool.length,
        lastCleanup: new Date(),
        tableSizes
      };

    } catch (error) {
      console.error('[Database] Failed to get stats:', error);
      return {
        totalQueries: this.queryStats.totalQueries,
        averageQueryTime: 0,
        cacheHitRate: 0,
        connectionPoolSize: 0,
        lastCleanup: new Date(),
        tableSizes: {}
      };
    }
  }

  /**
   * Get table sizes
   */
  private async getTableSizes(): Promise<Record<string, number>> {
    try {
      const result = await this.query(`
        SELECT name, sql FROM sqlite_master
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);

      const tableSizes: Record<string, number> = {};

      for (const table of result.rows) {
        try {
          const countResult = await this.query(`SELECT COUNT(*) as count FROM ${table.name}`);
          tableSizes[table.name] = countResult.rows[0].count;
        } catch (error) {
          console.warn(`[Database] Failed to get size for table ${table.name}:`, error);
          tableSizes[table.name] = 0;
        }
      }

      return tableSizes;

    } catch (error) {
      console.error('[Database] Failed to get table sizes:', error);
      return {};
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    try {
      // Close all connections in pool
      for (const connection of this.connectionPool) {
        await connection.close();
      }
      this.connectionPool = [];

      if (this.db) {
        await this.db.close();
        this.db = null;
      }

      this.isInitialized = false;
      this.clearCache();

      console.log('[Database] Database connection closed');

    } catch (error) {
      console.error('[Database] Error closing database:', error);
      throw error;
    }
  }

  /**
   * Check if database is initialized
   */
  isActive(): boolean {
    return this.isInitialized && this.db !== null;
  }
}

/**
 * Database-specific error classes
 */
export class DatabaseInitializationError extends BaseError {
  constructor(message: string, public readonly databaseName: string, correlationId?: string) {
    super(message, 'DATABASE_INITIALIZATION_ERROR', correlationId);
    this.name = 'DatabaseInitializationError';
  }
}

export class DatabaseNotInitializedError extends BaseError {
  constructor(message: string, correlationId?: string) {
    super(message, 'DATABASE_NOT_INITIALIZED', correlationId);
    this.name = 'DatabaseNotInitializedError';
  }
}

export class DatabaseQueryError extends BaseError {
  constructor(
    message: string,
    public readonly sql: string,
    public readonly params: any[],
    correlationId?: string
  ) {
    super(message, 'DATABASE_QUERY_ERROR', correlationId);
    this.name = 'DatabaseQueryError';
  }
}

export class DatabaseTransactionError extends BaseError {
  constructor(message: string, correlationId?: string) {
    super(message, 'DATABASE_TRANSACTION_ERROR', correlationId);
    this.name = 'DatabaseTransactionError';
  }
}

/**
 * Database transaction interface
 */
export interface DatabaseTransaction {
  execute(sql: string, params?: any[]): Promise<QueryResult>;
  query(sql: string, params?: any[]): Promise<any[]>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
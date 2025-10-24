/**
 * Core Repository Interface
 * Generic repository pattern for Clean Architecture
 * Location: src/core/data/repositories/CoreRepository.ts
 */

import { BaseError } from '../../../shared/errors/BaseError';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  include?: string[];
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DatabaseTransaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export abstract class CoreRepository<T, ID extends string | number = string> {
  /**
   * Find entity by ID
   */
  abstract findById(id: ID, options?: QueryOptions): Promise<T | null>;

  /**
   * Find all entities with optional filtering
   */
  abstract findAll(options?: QueryOptions): Promise<T[]>;

  /**
   * Find entities with pagination
   */
  abstract findWithPagination(
    page: number,
    limit: number,
    options?: QueryOptions
  ): Promise<PaginationResult<T>>;

  /**
   * Find entities by custom criteria
   */
  abstract findBy(
    criteria: Partial<T>,
    options?: QueryOptions
  ): Promise<T[]>;

  /**
   * Find one entity by criteria
   */
  abstract findOne(
    criteria: Partial<T>,
    options?: QueryOptions
  ): Promise<T | null>;

  /**
   * Create new entity
   */
  abstract create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;

  /**
   * Create multiple entities
   */
  abstract createMany(
    entities: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]
  ): Promise<T[]>;

  /**
   * Update existing entity
   */
  abstract update(
    id: ID,
    updates: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<T>;

  /**
   * Update entities by criteria
   */
  abstract updateBy(
    criteria: Partial<T>,
    updates: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<T[]>;

  /**
   * Delete entity by ID
   */
  abstract delete(id: ID): Promise<boolean>;

  /**
   * Delete entities by criteria
   */
  abstract deleteBy(criteria: Partial<T>): Promise<number>;

  /**
   * Count entities by criteria
   */
  abstract count(criteria?: Partial<T>): Promise<number>;

  /**
   * Check if entity exists
   */
  abstract exists(id: ID): Promise<boolean>;

  /**
   * Check if entity exists by criteria
   */
  abstract existsBy(criteria: Partial<T>): Promise<boolean>;

  /**
   * Execute operations within a transaction
   */
  abstract transaction<R>(
    operation: (transaction: DatabaseTransaction) => Promise<R>
  ): Promise<R>;

  /**
   * Raw query execution (use sparingly)
   */
  abstract query<R = any>(
    sql: string,
    params?: any[]
  ): Promise<R[]>;

  /**
   * Backup repository data
   */
  abstract backup(): Promise<{
    data: T[];
    timestamp: Date;
    version: string;
  }>;

  /**
   * Restore repository data
   */
  abstract restore(
    backup: { data: T[]; timestamp: Date; version: string }
  ): Promise<T[]>;

  /**
   * Get repository statistics
   */
  abstract getStats(): Promise<{
    totalRecords: number;
    lastUpdated: Date;
    tableSize: number;
  }>;
}

/**
 * Repository-specific errors
 */
export class RepositoryError extends BaseError {
  constructor(
    message: string,
    public readonly repository: string,
    public readonly operation: string,
    public readonly entityId?: string | number,
    correlationId?: string
  ) {
    super(message, 'REPOSITORY_ERROR', correlationId);
    this.name = 'RepositoryError';
  }
}

export class EntityNotFoundError extends RepositoryError {
  constructor(
    entityName: string,
    entityId: string | number,
    repository: string,
    correlationId?: string
  ) {
    super(
      `${entityName} with ID ${entityId} not found`,
      repository,
      'findById',
      String(entityId),
      correlationId
    );
    this.name = 'EntityNotFoundError';
  }
}

export class DuplicateEntityError extends RepositoryError {
  constructor(
    entityName: string,
    entityId: string | number,
    repository: string,
    correlationId?: string
  ) {
    super(
      `${entityName} with ID ${entityId} already exists`,
      repository,
      'create',
      String(entityId),
      correlationId
    );
    this.name = 'DuplicateEntityError';
  }
}

export class ValidationError extends RepositoryError {
  public readonly validationErrors: string[];

  constructor(
    entityName: string,
    validationErrors: string[],
    repository: string,
    correlationId?: string
  ) {
    super(
      `Validation failed for ${entityName}: ${validationErrors.join(', ')}`,
      repository,
      'validation',
      undefined,
      correlationId
    );
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }
}
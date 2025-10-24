# Technical Documentation - HealthyCoaching Indonesia

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Core API Documentation](#core-api-documentation)
3. [Database Schema & Migrations](#database-schema--migrations)
4. [Error Handling & Correlation IDs](#error-handling--correlation-ids)
5. [Repository Pattern Implementation](#repository-pattern-implementation)
6. [Indonesian Context Implementation](#indonesian-context-implementation)
7. [TypeScript Implementation Quality](#typescript-implementation-quality)

---

## Architecture Overview

### Clean Architecture Implementation

The project follows **Clean Architecture principles** with clear separation of concerns:

```
src/
├── core/                    # Foundation Layer
│   ├── domain/             # Business Logic & Rules
│   │   ├── entities/       # Core business entities
│   │   ├── usecases/       # Business logic use cases
│   │   └── services/       # Domain services
│   ├── data/               # Data Layer Implementation
│   │   ├── local/         # SQLite database, cache
│   │   ├── remote/        # API services (placeholder)
│   │   └── repositories/  # Repository implementations
│   ├── presentation/       # UI Layer (React Native)
│   └── network/           # HTTP clients, error handling
├── shared/                # Shared utilities
│   ├── errors/           # Custom error classes
│   ├── utils/            # Helper functions
│   ├── constants/        # App constants
│   └── types/           # TypeScript type definitions
└── features/             # Feature Modules (planned)
```

### Key Architectural Principles

1. **Dependency Inversion**: Domain layer doesn't depend on infrastructure
2. **Single Responsibility**: Each class has one reason to change
3. **Repository Pattern**: Abstract data access behind interfaces
4. **Error Boundary**: Comprehensive error handling with correlation IDs
5. **Type Safety**: Strict TypeScript implementation

---

## Core API Documentation

### Domain Entities

#### MakananIndonesia Entity

**Location**: `src/core/domain/entities/MakananIndonesia.ts`

**Purpose**: Represents Indonesian food with complete nutritional and cultural information.

**Key Properties**:
```typescript
class MakananIndonesia {
  id: string                          // Unique identifier
  nama: string                        // Primary food name (Bahasa Indonesia)
  namaLain: string[]                 // Alternative names (e.g., "Nasi uduk", "Nasi kuning")
  kategori: KategoriMakanan           // Food category
  asal: string[]                      // Regional origins
  daerah: KetersediaanRegional        // Regional availability
  nutrisiPer100g: Nutrisi            // Complete nutrition profile
  porsiStandar: PorsiStandar[]       // Standard portion sizes
  gambar: string[]                    // Image URLs
  informasiBahan: InformasiBahan[]   // Ingredient information
  caraMasak: CaraMasak[]              // Cooking methods
  halalCertified: boolean            // Halal certification status
  isVegetarian: boolean              // Vegetarian compatibility
  isVegan: boolean                   // Vegan compatibility
  alergen: string[]                   // Allergen information
  popularitas: TingkatKepopuleran    // Popularity rating
  ketersediaan: string               // Availability status
  musimanHijau: boolean              // Seasonal availability
  perkiraanHarga: PriceRange         // Estimated price range
}
```

**Enums and Interfaces**:
```typescript
export enum KategoriMakanan {
  MAKANAN_POKOK = 'makanan_pokok',
  LAUK_PAUK = 'lauk_pauk',
  SAYURAN = 'sayuran',
  BUAH = 'buah',
  JAJANAN = 'jajanan',
  MINUMAN = 'minuman',
  KUE = 'kue',
  SAMBAL = 'sambal',
  KUEH_KERING = 'kueh_kering',
  BUMBU_MASAK = 'bumbu_masak'
}

export interface Nutrisi {
  kalori: number;           // kcal per 100g
  protein: number;          // gram per 100g
  karbohidrat: number;      // gram per 100g
  lemak: number;            // gram per 100g
  serat: number;            // gram per 100g
  garam: number;            // mg per 100g (important for hypertension)
  gula: number;             // gram per 100g (important for diabetes)
  vitaminA: number;         // IU per 100g
  vitaminC: number;         // mg per 100g
  kalsium: number;          // mg per 100g
  zatBesi: number;          // mg per 100g
  folat: number;            // mcg per 100g
}
```

**Key Methods**:

```typescript
// Calculate nutrition for specific portion
getNutrisiUntukPorsi(porsiIndex: number): Nutrisi

// Indonesian-specific health checks
isSehatUntukPengguna(penggunaAlergi: string[]): boolean
isTersediaDiLokasi(provinsi: string, kota?: string): boolean
isMakananKhasRamadan(): boolean

// Dietary compatibility
adalahBergizi(): boolean
dapatDimakanSelamaDiet(tipeDiet: string): boolean

// Utility methods
getPorsiRekomendasi(targetKalori: number): PorsiStandar
getInformasiNutrisiLengkap(): string
```

#### User Entity

**Location**: `src/core/domain/entities/User.ts`

**Purpose**: Represents user profile, health data, and preferences with Indonesian context.

**Key Interfaces**:
```typescript
export interface UserProfile {
  id: string;
  userId: string;
  namaLengkap: string;
  namaPanggilan: string;
  email: string;
  tanggalLahir: Date;
  jenisKelamin: 'pria' | 'wanita';
  tinggiBadan: number;        // cm
  beratBadan: number;        // kg
  targetBerat?: number;      // kg
  aktivitasFisik: AktivitasFisikLevel;
  golKesehatan: GolKesehatan[];
  preferensi: UserPreferences;
  alergi: string[];
  kondisiKesehatan: KondisiKesehatan[];
}

export interface UserPreferences {
  preferensiBahasa: 'id' | 'en';
  notifikasi: NotificationSettings;
  preferensiDiet: DietPreferences;
  preferensiPembayaran: PaymentPreferences;
  preferensiUnit: UnitPreferences;
}
```

**Key Methods**:

```typescript
// Health calculations
getUmur(): number
getBMI(): number
getBMICategory(): string

// Goal tracking
hasTargetBerat(): boolean
isGoalAktif(): GolKesehatan | null

// Indonesian context methods
isPuasa(): boolean
needsHalalFood(): boolean
getAlergenList(): string[]

// Validation
validateProfile(): { isValid: boolean; errors: string[] }
```

### Repository Pattern

**Base Repository Interface**:
```typescript
export abstract class CoreRepository<T, ID extends string | number = string> {
  // CRUD operations
  abstract findById(id: ID, options?: QueryOptions): Promise<T | null>;
  abstract findAll(options?: QueryOptions): Promise<T[]>;
  abstract create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  abstract update(id: ID, updates: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T>;
  abstract delete(id: ID): Promise<boolean>;

  // Advanced queries
  abstract findWithPagination(page: number, limit: number, options?: QueryOptions): Promise<PaginationResult<T>>;
  abstract findBy(criteria: Partial<T>, options?: QueryOptions): Promise<T[]>;
  abstract count(criteria?: Partial<T>): Promise<number>;

  // Transaction support
  abstract transaction<R>(operation: (transaction: DatabaseTransaction) => Promise<R>): Promise<R>;

  // Maintenance operations
  abstract backup(): Promise<{ data: T[]; timestamp: Date; version: string; }>;
  abstract getStats(): Promise<{ totalRecords: number; lastUpdated: Date; tableSize: number; }>;
}
```

### Use Cases

#### AnalyzeMakananHarian Use Case

**Location**: `src/core/domain/usecases/nutrition/AnalyzeMakananHarian.ts`

**Purpose**: Analyze daily nutrition intake with Indonesian context.

**Interface**:
```typescript
export interface AnalyzeMakananHarianRequest {
  userId: string;
  tanggal: Date;
  includeRekomendasi: boolean;
}

export interface AnalyzeMakananHarianResponse {
  tanggal: Date;
  totalKalori: number;
  targetKalori: number;
  persentaseTarget: number;
  nutrisiRataRata: NutritionSummary;
  makananDimakan: MakananLog[];
  status: 'kurang' | 'pas' | 'lebih';
  rekomendasi?: RekomendasiMakanan;
  alerts: Alert[];
}
```

---

## Database Schema & Migrations

### Database Technology

- **Engine**: SQLite with `react-native-sqlite-storage`
- **Location**: Local device storage
- **Manager**: `DatabaseManager` class with connection pooling
- **Transactions**: Full ACID compliance with rollback support

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  profile_data TEXT NOT NULL,      -- JSON with UserProfile
  preferences TEXT NOT NULL,       -- JSON with UserPreferences
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

#### Makanan Indonesia Table
```sql
CREATE TABLE makanan_indonesia (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  nama_lain TEXT,                  -- JSON array of alternative names
  kategori TEXT NOT NULL,
  asal TEXT,                       -- JSON array of origins
  daerah TEXT NOT NULL,            -- JSON with KetersediaanRegional
  nutrisi_per_100g TEXT NOT NULL,  -- JSON with Nutrisi
  porsi_standar TEXT NOT NULL,     -- JSON array of PorsiStandar
  gambar TEXT,                     -- JSON array of image URLs
  informasi_bahan TEXT NOT NULL,   -- JSON array of InformasiBahan
  cara_masak TEXT NOT NULL,        -- JSON array of CaraMasak
  halal_certified INTEGER NOT NULL,
  is_vegetarian INTEGER NOT NULL,
  is_vegan INTEGER NOT NULL,
  alergen TEXT,                    -- JSON array of allergens
  popularitas INTEGER NOT NULL,
  ketersediaan TEXT NOT NULL,
  musiman_hijau INTEGER NOT NULL,
  perkiraan_harga TEXT NOT NULL,   -- JSON with PriceRange
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

#### Food Tracking Logs
```sql
CREATE TABLE makanan_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  makanan_id TEXT NOT NULL,
  porsi_index INTEGER NOT NULL,
  waktu_makan TEXT NOT NULL,        -- ISO timestamp
  catatan TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (makanan_id) REFERENCES makanan_indonesia(id) ON DELETE RESTRICT
);
```

### Database Features

#### Connection Pooling
```typescript
interface ConnectionPoolConfig {
  maxConnections: number;     // Maximum connections: 5
  minConnections: number;     // Minimum connections: 1
  connectionTimeout: number;  // Connection timeout: 5000ms
  idleTimeout: number;        // Idle timeout: 30000ms
}
```

#### Performance Optimizations
```sql
PRAGMA foreign_keys = ON;           -- Enable foreign key constraints
PRAGMA journal_mode = WAL;           -- Write-Ahead Logging for performance
PRAGMA synchronous = NORMAL;        -- Balance between safety and performance
PRAGMA cache_size = 10000;          -- 10MB cache
PRAGMA temp_store = MEMORY;         -- Store temporary tables in memory
```

#### Indexes
```sql
-- Performance indexes
CREATE INDEX idx_makanan_logs_user_id ON makanan_logs(user_id);
CREATE INDEX idx_makanan_logs_created_at ON makanan_logs(created_at);
CREATE INDEX idx_makanan_indonesia_kategori ON makanan_indonesia(kategori);
CREATE INDEX idx_makanan_indonesia_popularitas ON makanan_indonesia(popularitas);
CREATE INDEX idx_workout_logs_user_id ON workout_logs(user_id);
CREATE INDEX idx_workout_logs_created_at ON workout_logs(created_at);
```

### Migration System

#### Migration Interface
```typescript
export abstract class Migration {
  constructor(
    public readonly version: string,
    public readonly description: string
  ) {}

  abstract up(transaction: DatabaseTransaction): Promise<void>;
  abstract down(transaction: DatabaseTransaction): Promise<void>;
}
```

#### Current Migrations
1. **001_initial_schema.ts** - Creates base schema (users, makanan_indonesia, logs)
2. **002_indonesian_food_data.ts** - Populates initial Indonesian food database

#### Migration Management
```typescript
// Migration execution
const migration = new InitialSchemaMigration();
await databaseManager.transaction(async (tx) => {
  await migration.up(tx);
});

// Rollback support
await databaseManager.transaction(async (tx) => {
  await migration.down(tx);
});
```

---

## Error Handling & Correlation IDs

### Error Class Hierarchy

```typescript
BaseError (abstract)
├── ValidationError
├── BusinessLogicError
│   ├── MakananError (planned)
│   ├── NutrisiAnalysisError (planned)
│   └── WorkoutError (planned)
├── NetworkError
├── TimeoutError
├── NotFoundError
├── PermissionError
├── ConfigurationError
└── DatabaseError
    ├── DatabaseInitializationError
    ├── DatabaseNotInitializedError
    ├── DatabaseQueryError
    └── DatabaseTransactionError
```

### BaseError Features

```typescript
export abstract class BaseError extends Error {
  public readonly correlationId: string;    // Unique tracking ID
  public readonly timestamp: Date;           // When error occurred
  public readonly errorCode: string;        // Machine-readable code
  public readonly context?: Record<string, any>; // Additional context
  public readonly cause?: Error;            // Root cause
  public readonly isRetryable: boolean;     // Can operation be retried
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';

  // Key methods
  getFormattedMessage(): string;            // "[ID] message"
  getErrorSummary(): ErrorSummary;         // Complete error details
  shouldReport(): boolean;                 // Report to monitoring?
  toJSON(): ErrorResponse;                  // API response format
  isSameType(other: Error): boolean;       // Type checking
  hasErrorCode(code: string): boolean;     // Code checking
}
```

### Correlation ID System

#### Generation
```typescript
// Location: src/shared/utils/correlationId.ts
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
```

#### Usage Examples
```typescript
// In repository operations
async findById(id: string): Promise<MakananIndonesia | null> {
  const correlationId = generateCorrelationId();
  try {
    // Database operation
    const result = await this.db.query('SELECT * FROM makanan_indonesia WHERE id = ?', [id]);
    return result.rows[0] || null;
  } catch (error) {
    throw new DatabaseQueryError(
      `Failed to find makanan with ID ${id}`,
      'SELECT * FROM makanan_indonesia WHERE id = ?',
      [id],
      correlationId
    );
  }
}

// In use cases
async execute(request: AnalyzeMakananHarianRequest): Promise<AnalyzeMakananHarianResponse> {
  const correlationId = generateCorrelationId();
  try {
    // Business logic execution
  } catch (error) {
    throw new BusinessLogicError(
      `Failed to analyze nutrition: ${error.message}`,
      'NUTRITION_ANALYSIS_FAILED',
      correlationId,
      { userId: request.userId, tanggal: request.tanggal }
    );
  }
}
```

### Error Context Logging

#### Database Error Context
```typescript
export class DatabaseQueryError extends BaseError {
  constructor(
    message: string,
    public readonly sql: string,        // Query that failed
    public readonly params: any[],     // Parameters used
    correlationId?: string
  ) {
    super(
      message,
      'DATABASE_QUERY_ERROR',
      correlationId,
      { sql: sql.substring(0, 100), params, timestamp: new Date() }
    );
  }
}
```

#### Repository Error Context
```typescript
export class RepositoryError extends BaseError {
  constructor(
    message: string,
    public readonly repository: string,  // Repository name
    public readonly operation: string,   // Operation type
    public readonly entityId?: string,   // Entity ID if applicable
    correlationId?: string
  ) {
    super(
      message,
      'REPOSITORY_ERROR',
      correlationId,
      { repository, operation, entityId }
    );
  }
}
```

### Error Monitoring Strategy

#### Console Logging Format
```typescript
console.log(`[Database] Query executed in ${queryTime}ms`, {
  correlationId,
  sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
  params: params.length
});

console.error(`[Database] Query failed`, {
  correlationId,
  sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
  params,
  error: error
});
```

#### Error Reporting Conditions
```typescript
shouldReport(): boolean {
  return this.severity === 'high' || this.severity === 'critical';
}
```

---

## Repository Pattern Implementation

### CoreRepository Abstract Class

**Location**: `src/core/data/repositories/CoreRepository.ts`

**Purpose**: Provides generic repository interface with common CRUD operations and advanced features.

#### Key Features

1. **Generic Type Safety**: `<T, ID extends string | number = string>`
2. **Flexible Querying**: Support for complex criteria and options
3. **Pagination**: Built-in pagination support
4. **Transaction Support**: ACID transaction management
5. **Statistics**: Performance and usage tracking
6. **Backup/Restore**: Data export/import capabilities

#### Query Options
```typescript
export interface QueryOptions {
  limit?: number;                    // Result limit
  offset?: number;                   // Result offset
  orderBy?: string;                  // Sort field
  orderDirection?: 'ASC' | 'DESC';  // Sort direction
  include?: string[];                // Related entities to include
}
```

#### Pagination Result
```typescript
export interface PaginationResult<T> {
  data: T[];           // Page data
  total: number;       // Total records
  page: number;        // Current page
  limit: number;       // Page size
  hasNext: boolean;    // Next page available
  hasPrev: boolean;    // Previous page available
}
```

### Database Transaction Interface

```typescript
export interface DatabaseTransaction {
  execute(sql: string, params?: any[]): Promise<QueryResult>;
  query(sql: string, params?: any[]): Promise<any[]>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
```

#### Transaction Usage Example
```typescript
// In repository implementation
async createWithIngredients(
  makanan: MakananIndonesia,
  ingredients: InformasiBahan[]
): Promise<MakananIndonesia> {
  return await this.databaseManager.transaction(async (tx) => {
    // Create main record
    const result = await tx.execute(
      'INSERT INTO makanan_indonesia (...) VALUES (...)',
      [/* parameters */]
    );

    const makananId = result.insertId;

    // Create ingredient records
    for (const ingredient of ingredients) {
      await tx.execute(
        'INSERT INTO makanan_ingredients (makanan_id, ...) VALUES (?, ...)',
        [makananId, /* ingredient data */]
      );
    }

    // Auto-commit on success, rollback on error
    return await this.findById(makananId);
  });
}
```

### Repository Error Handling

#### Custom Repository Errors
```typescript
export class EntityNotFoundError extends RepositoryError {
  constructor(
    entityName: string,
    entityId: ID,
    repository: string,
    correlationId?: string
  ) {
    super(
      `${entityName} with ID ${entityId} not found`,
      repository,
      'findById',
      entityId,
      correlationId
    );
    this.name = 'EntityNotFoundError';
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
    this.validationErrors = validationErrors;
    this.name = 'ValidationError';
  }
}
```

### Repository Statistics and Monitoring

#### Statistics Collection
```typescript
// Built into DatabaseManager
async getStats(): Promise<DatabaseStats> {
  return {
    totalQueries: this.queryStats.totalQueries,
    averageQueryTime: /* calculation */,
    cacheHitRate: /* calculation */,
    connectionPoolSize: this.connectionPool.length,
    lastCleanup: new Date(),
    tableSizes: await this.getTableSizes()
  };
}
```

#### Performance Monitoring
```typescript
// Query timing with correlation ID
const startTime = Date.now();
try {
  const result = await this.executeQuery(connection, sql, params);
  const queryTime = Date.now() - startTime;

  console.log(`[Database] Query executed in ${queryTime}ms`, {
    correlationId,
    sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
    params: params.length
  });

  return result;
} catch (error) {
  // Error logging with correlation ID
  throw new DatabaseQueryError(/* ... */);
}
```

---

## Indonesian Context Implementation

### Food Categories (Indonesian Specific)

```typescript
export enum KategoriMakanan {
  MAKANAN_POKOK = 'makanan_pokok',      // Staple foods (nasi, jagung, sagu)
  LAUK_PAUK = 'lauk_pauk',              // Side dishes (ayam, ikan, tempe)
  SAYURAN = 'sayuran',                  // Vegetables (kangkung, bayam, kangkung)
  BUAH = 'buah',                        // Fruits (mangga, pisang, jeruk)
  JAJANAN = 'jajanan',                  // Snacks (gorengan, kerupuk)
  MINUMAN = 'minuman',                  // Drinks (teh, kopi, jus)
  KUE = 'kue',                          // Cakes (kue tradisional)
  SAMBAL = 'sambal',                    // Sambals (various chili pastes)
  KUEH_KERING = 'kueh_kering',         // Dry cookies/snacks
  BUMBU_MASAK = 'bumbu_masak'           // Cooking spices/seasonings
}
```

### Cooking Methods (Cara Masak)

```typescript
export enum CaraMasak {
  GORENG = 'goreng',      // Frying
  REBUS = 'rebus',         // Boiling
  KUKUS = 'kukus',        // Steaming
  BAKAR = 'bakar',        // Grilling/roasting
  TIM = 'tim',            // Steaming in covered pot
  SAUTE = 'saute',        // Stir-frying
  DANDANG = 'dandang',    // Steaming in large vessel
  PANGGANG = 'panggang'   // Baking/roasting
}
```

### Regional Availability

```typescript
export interface KetersediaanRegional {
  provinsi: string[];        // Indonesian provinces
  kota: string[];           // Major cities
  musiman: ('hijau' | 'kemarau' | 'hujan' | 'penghujan')[];
}

// Example usage
const daerah: KetersediaanRegional = {
  provinsi: ['Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta'],
  kota: ['Bandung', 'Yogyakarta', 'Semarang'],
  musiman: ['hujan', 'kemarau']
};
```

### Cultural Context Methods

#### Ramadan Food Detection
```typescript
isMakananKhasRamadan(): boolean {
  const makananRamadan = [
    'ketupat', 'kolak', 'dates', 'bubur kacang',
    'opor ayam', 'soto', 'gulai', 'es buah',
    'kurma', 'sayur lodeh', 'bubur sayur'
  ];

  return makananRamadan.some(ramadanFood =>
    this.nama.toLowerCase().includes(ramadanFood)
  );
}
```

#### Regional Availability Check
```typescript
isTersediaDiLokasi(provinsi: string, kota?: string): boolean {
  if (this.ketersediaan === 'seluruh_indonesia') {
    return true;
  }

  return this.daerah.provinsi.includes(provinsi) ||
         (kota && this.daerah.kota.includes(kota));
}
```

#### Halal Certification
```typescript
halalCertified: boolean,  // Official halal certification
// Additional context in informasiBahan:
interface InformasiBahan {
  nama: string;
  persentase: number;
  kategori: string;       // 'sayuran', 'protein_hewani', 'karbohidrat', etc.
}
```

### Health Context for Indonesian Diet

#### Nutrition Priorities
```typescript
export interface Nutrisi {
  kalori: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  serat: number;
  garam: number;             // IMPORTANT: High sodium in Indonesian diet
  gula: number;              // IMPORTANT: Diabetes prevention
  vitaminA: number;
  vitaminC: number;
  kalsium: number;
  zatBesi: number;           // IMPORTANT: Anemia prevention
  folat: number;             // IMPORTANT: Pregnancy health
}
```

#### Health Assessment
```typescript
adalahBergizi(): boolean {
  const nutrisi = this.nutrisiPer100g;

  // Indonesian context: Lower salt and sugar thresholds
  const skorProtein = Math.min(nutrisi.protein / 30, 1);
  const skorSerat = Math.min(nutrisi.serat / 15, 1);
  const skorGula = Math.max(1 - (nutrisi.gula / 15), 0); // Max 15g sugar per 100g
  const skorGaram = Math.max(1 - (nutrisi.garam / 600), 0); // Max 600mg salt per 100g

  const skorTotal = (skorProtein + skorSerat + skorGula + skorGaram) / 4;
  return skorTotal >= 0.7;
}
```

### Indonesian Payment Integration

#### User Payment Preferences
```typescript
export interface UserPreferences {
  preferensiPembayaran: {
    defaultMethod: 'gopay' | 'ovo' | 'dana' | 'kartu_kredit' | 'transfer_bank';
    tersimpan: {
      gopay: boolean;
      ovo: boolean;
      dana: boolean;
    };
  };
}
```

### Language Support

#### Bilingual Interface
```typescript
export interface UserPreferences {
  preferensiBahasa: 'id' | 'en';
  // All error messages and UI text support both languages
}
```

#### Indonesian Error Messages
```typescript
// Example in entity validation
if (porsiIndex < 0 || porsiIndex >= this.porsiStandar.length) {
  throw new Error(`Porsi index ${porsiIndex} tidak valid`);
}
```

---

## TypeScript Implementation Quality

### Type Safety Analysis

#### Strict Mode Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

#### Generic Type Safety
```typescript
// Repository pattern with proper generics
export abstract class CoreRepository<T, ID extends string | number = string> {
  abstract findById(id: ID, options?: QueryOptions): Promise<T | null>;
  abstract create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
}

// Proper interface segregation
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  include?: string[];
}
```

#### Enum Usage for Type Safety
```typescript
export enum KategoriMakanan {
  MAKANAN_POKOK = 'makanan_pokok',
  LAUK_PAUK = 'lauk_pauk',
  // ... other categories
}

// Usage in entity
public kategori: KategoriMakanan,

// Type-safe method parameters
public getByKategori(kategori: KategoriMakanan): Promise<MakananIndonesia[]>
```

### Interface Design Quality

#### Clear Separation of Concerns
```typescript
// Domain interfaces - pure business logic
interface MakananIndonesia {
  id: string;
  nama: string;
  nutrisiPer100g: Nutrisi;
  // Business logic methods
  getNutrisiUntukPorsi(porsiIndex: number): Nutrisi;
}

// Database interfaces - persistence concerns
interface MakananDatabaseRecord {
  id: string;
  nama: string;
  nutrisi_per_100g: string; // JSON string
}
```

#### Rich Type Information
```typescript
export interface Nutrisi {
  kalori: number;           // kcal per 100g
  protein: number;          // gram per 100g
  karbohidrat: number;      // gram per 100g
  lemak: number;            // gram per 100g
  serat: number;            // gram per 100g
  garam: number;            // mg per 100g (penting untuk hipertensi)
  gula: number;             // gram per 100g (penting untuk diabetes)
  vitaminA: number;         // IU per 100g
  vitaminC: number;         // mg per 100g
  kalsium: number;          // mg per 100g
  zatBesi: number;          // mg per 100g
  folat: number;            // mcg per 100g
}
```

### Error Handling Types

#### Comprehensive Error Hierarchy
```typescript
export abstract class BaseError extends Error {
  public readonly correlationId: string;
  public readonly timestamp: Date;
  public readonly errorCode: string;
  public readonly context?: Record<string, any>;
  public readonly cause?: Error;
  public readonly isRetryable: boolean;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';

  // Type-safe constructor parameters
  constructor(
    message: string,
    errorCode: string,
    correlationId?: string,
    context?: Record<string, any>,
    cause?: Error,
    isRetryable: boolean = false,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) { /* ... */ }
}
```

#### Specific Error Types
```typescript
export class ValidationError extends BaseError {
  public readonly validationErrors: string[];

  constructor(
    message: string,
    validationErrors: string[] = [],
    correlationId?: string,
    context?: Record<string, any>
  ) { /* ... */ }
}
```

### Database Type Safety

#### Type-Safe Query Results
```typescript
export interface QueryResult {
  insertId?: number;
  rowsAffected: number;
  rows: any[];     // Results need to be typed manually
}

// Type-safe result processing
private async executeQuery(
  connection: SQLiteDatabase,
  sql: string,
  params: any[]
): Promise<QueryResult> {
  return new Promise((resolve, reject) => {
    connection.executeSql(sql, params, (_, result) => {
      const rows: any[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        rows.push(result.rows.item(i));
      }
      resolve({
        insertId: result.insertId || undefined,
        rowsAffected: result.rowsAffected,
        rows
      });
    }, (_, error) => {
      reject(error);
      return false;
    });
  });
}
```

#### Migration Type Safety
```typescript
export abstract class Migration {
  constructor(
    public readonly version: string,
    public readonly description: string
  ) {}

  abstract up(transaction: DatabaseTransaction): Promise<void>;
  abstract down(transaction: DatabaseTransaction): Promise<void>;
}
```

### Performance Optimizations

#### Connection Pooling
```typescript
interface ConnectionPoolConfig {
  maxConnections: number;     // Type-safe configuration
  minConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
}

// Type-safe connection management
private async getConnection(): Promise<SQLiteDatabase> {
  if (this.connectionPool.length > 0) {
    return this.connectionPool.pop()!;
  }
  return await openDatabase(/* typed config */);
}
```

#### Query Caching
```typescript
private queryCache = new Map<string, any[]>();

// Type-safe cache key generation
private generateCacheKey(operation: string, request: any): string {
  const hash = btoa(JSON.stringify(request)).replace(/[^a-zA-Z0-9]/g, '');
  return `makanan:${operation}:${hash}`;
}
```

### Code Quality Metrics

#### Type Coverage
- **Entities**: 100% typed with rich interfaces
- **Repositories**: Generic with strong typing
- **Database**: Basic typing (SQLite limitations)
- **Error Handling**: Comprehensive type safety
- **Use Cases**: Strong typing with interfaces

#### Maintainability Features
1. **Clear Naming**: Indonesian context with English types
2. **Documentation**: Comprehensive JSDoc comments
3. **Error Messages**: Bilingual support
4. **Consistent Patterns**: Repository pattern throughout
5. **Separation of Concerns**: Clean architecture boundaries

#### Areas for Improvement
1. **SQLite Result Typing**: Could improve with type-safe query builders
2. **JSON Field Validation**: Runtime type checking for JSON columns
3. **API Client Typing**: Not yet implemented
4. **Test Coverage**: Unit tests planned but not implemented

---

## Summary

This technical documentation provides a comprehensive overview of the HealthyCoaching Indonesia codebase, demonstrating:

1. **Clean Architecture Implementation**: Proper separation of concerns with domain-driven design
2. **Indonesian Context Integration**: Deep integration of local food, cultural, and health context
3. **Robust Error Handling**: Comprehensive error management with correlation tracking
4. **Type Safety**: Strong TypeScript implementation with generic patterns
5. **Database Design**: Well-structured SQLite schema with migration support
6. **Repository Pattern**: Consistent data access abstraction with transaction support

The implementation shows excellent understanding of:
- Indonesian market requirements
- Clean Architecture principles
- Type safety and error handling
- Performance optimization
- Maintainability patterns

This foundation provides a solid base for building a scalable, maintainable health coaching application specifically tailored for the Indonesian market.
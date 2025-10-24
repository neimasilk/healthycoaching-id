# Developer Onboarding Guide - HealthyCoaching Indonesia

## 🎯 Welcome to the Team!

**HealthyCoaching Indonesia** is a health & wellness coaching app specifically designed for the Indonesian market. This guide will help you get started with our codebase, understand our architecture, and contribute effectively to the project.

### Project Overview
- **Target Market**: Indonesian health & wellness sector
- **Tech Stack**: React Native + TypeScript + SQLite
- **Architecture**: Clean Architecture with Indonesian context
- **Focus**: Local food database, cultural integration, health tracking

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v16 or higher)
2. **npm** (v8 or higher)
3. **React Native CLI**
4. **Android Studio** (for Android development)
5. **VS Code** (recommended with extensions below)
6. **Git** with SSH keys configured

### Setup Steps

#### 1. Clone and Install
```bash
git clone https://github.com/neimasilk/healthycoaching-id.git
cd healthycoaching-id
npm install
```

#### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
nano .env
```

#### 3. Database Initialization
```bash
# The app will automatically initialize SQLite database on first run
# Migration files are in src/core/data/local/migrations/
```

#### 4. Development Server
```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

#### 5. Verify Installation
```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm test
```

---

## 🏗️ Architecture Overview

### Clean Architecture Structure

```
src/
├── core/                    # Foundation Layer
│   ├── domain/             # Business Logic & Rules
│   │   ├── entities/       # Core business entities
│   │   ├── usecases/       # Business logic use cases
│   │   └── services/       # Domain services
│   ├── data/               # Data Layer Implementation
│   │   ├── local/         # SQLite database, cache
│   │   ├── remote/        # API services
│   │   └── repositories/  # Repository implementations
│   ├── presentation/       # UI Layer (React Native)
│   └── network/           # HTTP clients, error handling
├── shared/                # Shared utilities
│   ├── errors/           # Custom error classes
│   ├── utils/            # Helper functions
│   ├── constants/        # App constants
│   └── types/           # TypeScript type definitions
└── features/             # Feature Modules (planned)
    ├── auth/
    ├── nutrition/
    ├── workout/
    └── profile/
```

### Key Principles

1. **Dependency Inversion**: Domain layer doesn't depend on infrastructure
2. **Single Responsibility**: Each class has one reason to change
3. **Repository Pattern**: Abstract data access behind interfaces
4. **Error Boundaries**: Comprehensive error handling with correlation IDs
5. **Indonesian Context**: Built specifically for Indonesian market

### Data Flow

```
UI Layer (React Native)
    ↓
Use Cases (Business Logic)
    ↓
Repository Interface
    ↓
Repository Implementation
    ↓
Database (SQLite) / API
```

---

## 💻 Development Workflow

### Branch Strategy

```bash
main                    # Production code
├── develop            # Staging/integration
├── feature/[name]      # New features
├── fix/[name]         # Bug fixes
└── hotfix/[name]      # Critical fixes
```

### Git Workflow

1. **Create Feature Branch**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nutrition-tracker
```

2. **Make Changes**
   - Follow coding standards
   - Add tests for new functionality
   - Update documentation

3. **Commit Changes**
```bash
git add .
git commit -m "feat: add nutrition tracking functionality"
```

4. **Push and Create PR**
```bash
git push origin feature/nutrition-tracker
# Create Pull Request on GitHub
```

### Commit Message Format

We use **Conventional Commits**:

```bash
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code formatting (no functional change)
refactor: Code refactoring
test:     Adding or updating tests
chore:    Maintenance tasks

# Examples:
feat(nutrition): add daily calorie tracking
fix(auth): resolve login validation issue
docs(api): update endpoint documentation
```

---

## 🛠️ Core Development Tasks

### 1. Adding New Indonesian Food

#### Step 1: Entity Creation
```typescript
// src/core/domain/entities/MakananIndonesia.ts
const nasiGoreng = new MakananIndonesia(
  'mkn-001',
  'Nasi Goreng',
  ['Nasi Goreng Spesial', 'Fried Rice'],
  KategoriMakanan.MAKANAN_POKOK,
  ['Indonesia', 'Jawa'],
  {
    provinsi: ['Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta'],
    kota: ['Bandung', 'Yogyakarta', 'Semarang'],
    musiman: ['hujan', 'kemarau']
  },
  {
    kalori: 163,
    protein: 6.1,
    karbohidrat: 23.6,
    lemak: 6.4,
    serat: 1.2,
    garam: 680,
    gula: 2.1,
    vitaminA: 250,
    vitaminC: 5.2,
    kalsium: 15,
    zatBesi: 1.2,
    folat: 20
  },
  [/* porsi standar */],
  [/* gambar URLs */],
  [/* informasi bahan */],
  [CaraMasak.GORENG],
  true, // halalCertified
  false, // isVegetarian
  false, // isVegan
  ['udang'], // alergen
  TingkatKepopuleran.SANGAT_POPULER,
  'seluruh_indonesia',
  false, // musimanHijau
  { /* perkiraanHarga */ },
  new Date()
);
```

#### Step 2: Database Migration
```typescript
// src/core/data/local/migrations/002_indonesian_food_data.ts
export class IndonesianFoodDataMigration extends Migration {
  constructor() {
    super('1.1.0', 'Add Indonesian food data');
  }

  async up(transaction: DatabaseTransaction): Promise<void> {
    await transaction.execute(`
      INSERT INTO makanan_indonesia (id, nama, kategori, ...)
      VALUES (?, ?, ?, ...)
    `, ['mkn-001', 'Nasi Goreng', 'makanan_pokok', /* ... */]);
  }
}
```

#### Step 3: Add Tests
```typescript
// src/core/domain/entities/__tests__/MakananIndonesia.test.ts
describe('MakananIndonesia', () => {
  describe('Nasi Goreng', () => {
    it('should calculate nutrition correctly for standard portion', () => {
      const nasiGoreng = createNasiGoreng();
      const nutrition = nasiGoreng.getNutrisiUntukPorsi(0);

      expect(nutrition.kalori).toBeGreaterThan(0);
      expect(nutrition.protein).toBeGreaterThan(0);
    });

    it('should be available in major Indonesian cities', () => {
      const nasiGoreng = createNasiGoreng();

      expect(nasiGoreng.isTersediaDiLokasi('Jawa Barat')).toBe(true);
      expect(nasiGoreng.isTersediaDiLokasi('Jawa Barat', 'Bandung')).toBe(true);
    });
  });
});
```

### 2. Creating New Use Case

#### Step 1: Define Interface
```typescript
// src/core/domain/usecases/nutrition/TrackMakananHarian.ts
export interface TrackMakananHarianRequest {
  userId: string;
  makananId: string;
  porsiIndex: number;
  waktuMakan: Date;
  catatan?: string;
}

export interface TrackMakananHarianResponse {
  success: boolean;
  makananLog: MakananLog;
  totalKaloriHarian: number;
  rekomendasi?: string;
}
```

#### Step 2: Implement Use Case
```typescript
// src/core/domain/usecases/nutrition/TrackMakananHarian.ts
export class TrackMakananHarian {
  constructor(
    private userRepo: IUserRepository,
    private makananRepo: IMakananRepository,
    private makananLogRepo: IMakananLogRepository,
    private correlationIdGenerator: () => string
  ) {}

  async execute(request: TrackMakananHarianRequest): Promise<TrackMakananHarianResponse> {
    const correlationId = this.correlationIdGenerator();

    try {
      // Validate user exists
      const user = await this.userRepo.findById(request.userId);
      if (!user) {
        throw new NotFoundError('User', request.userId, correlationId);
      }

      // Validate food exists
      const makanan = await this.makananRepo.findById(request.makananId);
      if (!makanan) {
        throw new NotFoundError('Makanan', request.makananId, correlationId);
      }

      // Check for allergies
      if (!makanan.isSehatUntukPengguna(user.getAlergenList())) {
        throw new BusinessLogicError(
          'Makanan tidak aman untuk user karena alergi',
          'ALLERGY_CONFLICT',
          correlationId
        );
      }

      // Create log entry
      const makananLog = new MakananLog(
        generateId(),
        request.userId,
        request.makananId,
        request.porsiIndex,
        request.waktuMakan,
        request.catatan
      );

      await this.makananLogRepo.create(makananLog);

      // Calculate daily total
      const dailyTotal = await this.calculateDailyTotal(request.userId, request.waktuMakan);

      return {
        success: true,
        makananLog,
        totalKaloriHarian: dailyTotal.totalKalori,
        rekomendasi: this.generateRekomendasi(dailyTotal, user)
      };

    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }

      throw new BusinessLogicError(
        `Failed to track makanan: ${error.message}`,
        'TRACK_MAKANAN_FAILED',
        correlationId,
        { request }
      );
    }
  }
}
```

#### Step 3: Add Tests
```typescript
// src/core/domain/usecases/__tests__/TrackMakananHarian.test.ts
describe('TrackMakananHarian', () => {
  let useCase: TrackMakananHarian;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockMakananRepo: jest.Mocked<IMakananRepository>;

  beforeEach(() => {
    mockUserRepo = createMockUserRepository();
    mockMakananRepo = createMockMakananRepository();

    useCase = new TrackMakananHarian(
      mockUserRepo,
      mockMakananRepo,
      mockMakananLogRepo,
      () => 'test-correlation-id'
    );
  });

  it('should successfully track Indonesian food consumption', async () => {
    // Arrange
    const mockUser = createMockUser();
    const mockMakanan = createMockNasiGoreng();
    const request = createMockTrackRequest();

    mockUserRepo.findById.mockResolvedValue(mockUser);
    mockMakananRepo.findById.mockResolvedValue(mockMakanan);

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.success).toBe(true);
    expect(result.makananLog).toBeDefined();
    expect(result.totalKaloriHarian).toBeGreaterThan(0);
  });
});
```

### 3. Adding New Repository

#### Step 1: Create Repository Implementation
```typescript
// src/core/data/repositories/MakananRepository.ts
export class MakananRepository extends CoreRepository<MakananIndonesia, string> {
  constructor(
    private databaseManager: DatabaseManager,
    private correlationIdGenerator: () => string
  ) {
    super();
  }

  async findById(id: string, options?: QueryOptions): Promise<MakananIndonesia | null> {
    const correlationId = this.correlationIdGenerator();

    try {
      const result = await this.databaseManager.query(
        'SELECT * FROM makanan_indonesia WHERE id = ?',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToEntity(result.rows[0]);

    } catch (error) {
      throw new DatabaseQueryError(
        `Failed to find makanan with ID ${id}`,
        'SELECT * FROM makanan_indonesia WHERE id = ?',
        [id],
        correlationId
      );
    }
  }

  async searchByNama(
    keyword: string,
    kategori?: KategoriMakanan,
    limit: number = 20
  ): Promise<MakananIndonesia[]> {
    const correlationId = this.correlationIdGenerator();

    try {
      let sql = `
        SELECT * FROM makanan_indonesia
        WHERE (nama LIKE ? OR nama_lain LIKE ?)
      `;
      const params = [`%${keyword}%`, `%${keyword}%`];

      if (kategori) {
        sql += ' AND kategori = ?';
        params.push(kategori);
      }

      sql += ' ORDER BY popularitas DESC LIMIT ?';
      params.push(limit);

      const result = await this.databaseManager.query(sql, params);

      return result.rows.map(row => this.mapRowToEntity(row));

    } catch (error) {
      throw new DatabaseQueryError(
        `Failed to search makanan with keyword ${keyword}`,
        sql,
        params,
        correlationId
      );
    }
  }

  private mapRowToEntity(row: any): MakananIndonesia {
    return new MakananIndonesia(
      row.id,
      row.nama,
      JSON.parse(row.nama_lain || '[]'),
      row.kategori,
      JSON.parse(row.asal || '[]'),
      JSON.parse(row.daerah),
      JSON.parse(row.nutrisi_per_100g),
      JSON.parse(row.porsi_standar),
      JSON.parse(row.gambar || '[]'),
      JSON.parse(row.informasi_bahan),
      JSON.parse(row.cara_masak),
      Boolean(row.halal_certified),
      Boolean(row.is_vegetarian),
      Boolean(row.is_vegan),
      JSON.parse(row.alergen || '[]'),
      row.popularitas,
      row.ketersediaan,
      Boolean(row.musiman_hijau),
      JSON.parse(row.perkiraan_harga),
      new Date(row.last_updated),
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}
```

---

## 🧪 Testing Guide

### Test Structure

```
src/
├── __tests__/              # Integration tests
├── core/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── __tests__/ # Entity unit tests
│   │   └── usecases/
│   │       └── __tests__/ # Use case tests
│   └── data/
│       └── repositories/
│           └── __tests__/ # Repository tests
└── shared/
    ├── errors/
    │   └── __tests__/     # Error class tests
    └── utils/
        └── __tests__/     # Utility tests
```

### Testing Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- MakananIndonesia.test.ts

# Run tests matching pattern
npm test -- --testPathPattern="entities"
```

### Test Examples

#### Entity Tests
```typescript
describe('MakananIndonesia', () => {
  describe('Nutrition Calculation', () => {
    it('should calculate nutrition for standard portion', () => {
      const makanan = new MakananIndonesia(/* ... */);
      const nutrition = makanan.getNutrisiUntukPorsi(0);

      expect(nutrition.kalori).toBeGreaterThan(0);
      expect(nutrition.protein).toBeGreaterThan(0);
    });

    it('should throw error for invalid portion index', () => {
      const makanan = new MakananIndonesia(/* ... */);

      expect(() => makanan.getNutrisiUntukPorsi(999))
        .toThrow('Porsi index 999 tidak valid');
    });
  });

  describe('Indonesian Context', () => {
    it('should detect Ramadan foods correctly', () => {
      const kolak = new MakananIndonesia(
        'mkn-002',
        'Kolak Pisang',
        [],
        KategoriMakanan.MINUMAN,
        /* ... */
      );

      expect(kolak.isMakananKhasRamadan()).toBe(true);
    });

    it('should check regional availability', () => {
      const rendang = createRendang();

      expect(rendang.isTersediaDiLokasi('Sumatera Barat')).toBe(true);
      expect(rendang.isTersediaDiLokasi('Papua')).toBe(false);
    });
  });
});
```

#### Repository Tests
```typescript
describe('MakananRepository', () => {
  let repository: MakananRepository;
  let mockDatabaseManager: jest.Mocked<DatabaseManager>;

  beforeEach(() => {
    mockDatabaseManager = createMockDatabaseManager();
    repository = new MakananRepository(mockDatabaseManager, () => 'test-id');
  });

  describe('findById', () => {
    it('should return makanan when found', async () => {
      const mockRow = createMockMakananRow();
      mockDatabaseManager.query.mockResolvedValue({
        rows: [mockRow],
        rowsAffected: 0
      });

      const result = await repository.findById('mkn-001');

      expect(result).toBeInstanceOf(MakananIndonesia);
      expect(result?.nama).toBe('Nasi Goreng');
    });

    it('should return null when not found', async () => {
      mockDatabaseManager.query.mockResolvedValue({
        rows: [],
        rowsAffected: 0
      });

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });
});
```

### Mock Utilities

```typescript
// src/core/domain/entities/__tests__/mocks/MakananIndonesia.mock.ts
export const createMockNasiGoreng = (): MakananIndonesia => {
  return new MakananIndonesia(
    'mkn-001',
    'Nasi Goreng',
    ['Nasi Goreng Spesial'],
    KategoriMakanan.MAKANAN_POKOK,
    ['Indonesia', 'Jawa'],
    {
      provinsi: ['Jawa Barat', 'Jawa Tengah'],
      kota: ['Bandung', 'Yogyakarta'],
      musiman: ['hujan', 'kemarau']
    },
    {
      kalori: 163,
      protein: 6.1,
      karbohidrat: 23.6,
      lemak: 6.4,
      serat: 1.2,
      garam: 680,
      gula: 2.1,
      vitaminA: 250,
      vitaminC: 5.2,
      kalsium: 15,
      zatBesi: 1.2,
      folat: 20
    },
    [
      {
        id: 'pors-001',
        nama: '1 piring',
        beratGram: 300,
        deskripsi: 'Satu piring nasi goreng standard'
      }
    ],
    [],
    [
      { nama: 'nasi', persentase: 60, kategori: 'karbohidrat' },
      { nama: 'telur', persentase: 20, kategori: 'protein_hewani' },
      { nama: 'bumbu', persentase: 20, kategori: 'bumbu_masak' }
    ],
    [CaraMasak.GORENG],
    true,
    false,
    false,
    ['udang'],
    TingkatKepopuleran.SANGAT_POPULER,
    'seluruh_indonesia',
    false,
    { minimal: 15000, maksimal: 25000, mataUang: 36000 },
    new Date()
  );
};
```

---

## 🚨 Error Handling Guide

### Our Error Philosophy

1. **Correlation IDs**: Every error gets a unique ID for tracking
2. **Context**: Errors include relevant context for debugging
3. **Type Safety**: Strongly typed error classes
4. **Indonesian Context**: Error messages in Indonesian when appropriate

### Error Hierarchy

```typescript
BaseError
├── ValidationError
├── BusinessLogicError
│   ├── MakananError
│   ├── NutrisiAnalysisError
│   └── WorkoutError
├── NetworkError
├── DatabaseError
│   ├── DatabaseQueryError
│   ├── DatabaseInitializationError
│   └── DatabaseTransactionError
├── NotFoundError
└── ConfigurationError
```

### Creating Custom Errors

```typescript
export class MakananError extends BusinessLogicError {
  constructor(
    message: string,
    errorCode: string,
    correlationId?: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      errorCode,
      correlationId,
      context,
      false, // isRetryable
      'medium' // severity
    );
    this.name = 'MakananError';
  }
}

// Usage
throw new MakananError(
  'Makanan tidak tersedia di lokasi ini',
  'MAKANAN_UNAVAILABLE_IN_REGION',
  correlationId,
  { makananId: 'mkn-001', provinsi: 'Papua' }
);
```

### Error Handling Best Practices

```typescript
// Good: Use correlation IDs
async trackMakanan(request: TrackRequest): Promise<TrackResponse> {
  const correlationId = generateCorrelationId();

  try {
    // Business logic
    return await this.processTracking(request, correlationId);
  } catch (error) {
    if (error instanceof BaseError) {
      throw error; // Re-throw our errors
    }

    // Wrap unknown errors
    throw new BusinessLogicError(
      `Failed to track makanan: ${error.message}`,
      'TRACK_MAKANAN_FAILED',
      correlationId,
      { request, originalError: error }
    );
  }
}

// Good: Specific error types
if (!makanan.isSehatUntukPengguna(user.alergi)) {
  throw new BusinessLogicError(
    'Makanan tidak aman untuk pengguna karena alergi',
    'ALLERGY_CONFLICT',
    correlationId,
    { makananId: makanan.id, alergen: user.alergi }
  );
}

// Good: Include context
throw new DatabaseQueryError(
  `Failed to find makanan with ID ${id}`,
  'SELECT * FROM makanan_indonesia WHERE id = ?',
  [id],
  correlationId
);
```

---

## 🌏 Indonesian Context Guide

### Food Categories

Understanding Indonesian food categories is crucial:

```typescript
export enum KategoriMakanan {
  MAKANAN_POKOK = 'makanan_pokok',      // Staple foods (nasi, jagung, sagu)
  LAUK_PAUK = 'lauk_pauk',              // Main dishes (ayam, ikan, tempe)
  SAYURAN = 'sayuran',                  // Vegetables (kangkung, bayam)
  BUAH = 'buah',                        // Fruits (mangga, pisang, jeruk)
  JAJANAN = 'jajanan',                  // Street food/snacks
  MINUMAN = 'minuman',                  // Drinks (teh, kopi, jus)
  KUE = 'kue',                          // Cakes (kue tradisional)
  SAMBAL = 'sambal',                    // Various chili pastes
  BUMBU_MASAK = 'bumbu_masak'           // Cooking spices
}
```

### Regional Considerations

```typescript
// Always check regional availability
if (!makanan.isTersediaDiLokasi(user.provinsi, user.kota)) {
  // Suggest alternatives
  const alternatives = await this.getAlternatives(makanan, user.provinsi);
  throw new MakananError(
    `${makanan.nama} tidak tersedia di ${user.kota}`,
    'REGIONAL_UNAVAILABLE',
    correlationId,
    { alternatives: alternatives.map(a => a.nama) }
  );
}
```

### Halal Certification

```typescript
// Always respect halal preferences
if (user.needsHalalFood() && !makanan.halalCertified) {
  throw new BusinessLogicError(
    'Makanan tidak memiliki sertifikasi halal',
    'HALAL_CERTIFICATION_REQUIRED',
    correlationId,
    { makananId: makanan.id, userId: user.id }
  );
}
```

### Health Priorities for Indonesian Market

1. **Salt Intake**: High sodium in Indonesian diet
2. **Sugar**: Diabetes prevention focus
3. **Anemia**: Iron deficiency common
4. **Fiber**: Low fiber intake concerns

```typescript
// Health assessment with Indonesian context
adalahBergizi(): boolean {
  const nutrisi = this.nutrisiPer100g;

  // Lower salt threshold for Indonesian diet
  const skorGaram = Math.max(1 - (nutrisi.garam / 600), 0); // Max 600mg

  // Lower sugar threshold for diabetes prevention
  const skorGula = Math.max(1 - (nutrisi.gula / 15), 0); // Max 15g

  // Higher importance for iron (anemia prevention)
  const skorBesi = Math.min(nutrisi.zatBesi / 5, 1); // 5mg+ iron per 100g

  return (skorGaram + skorGula + skorBesi) / 3 >= 0.7;
}
```

---

## 🔧 Development Tools

### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-jest"
  ]
}
```

### Useful Scripts

```bash
# Development
npm start                    # Start Metro bundler
npm run android             # Run on Android device/emulator
npm run ios                 # Run on iOS simulator

# Quality Assurance
npm run lint                # Check code style
npm run lint:fix            # Fix auto-fixable linting issues
npm run type-check          # TypeScript type checking
npm test                    # Run all tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage      # Generate coverage report

# Build & Deploy
npm run build:android       # Build Android APK/AAB
npm run build:ios          # Build iOS IPA
```

### Debugging Tips

#### React Native Debugger
```bash
# Start with debugging enabled
npx react-native start --reset-cache

# Android debug logs
adb logcat -s ReactNativeJS

# Flipper for advanced debugging
npx react-native flipper
```

#### Database Debugging
```typescript
// Enable database logging
const dbManager = new DatabaseManager({
  name: 'healthycoaching_debug.db',
  location: 'default'
});

// Check database stats
const stats = await dbManager.getStats();
console.log('Database Stats:', stats);
```

#### Error Tracking
```typescript
// All errors include correlation IDs
try {
  // Your code
} catch (error) {
  if (error instanceof BaseError) {
    console.error('Error Details:', error.getErrorSummary());
    console.error('Correlation ID:', error.correlationId);
  }
}
```

---

## 📚 Learning Resources

### React Native
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Native Community](https://github.com/react-native-community)

### TypeScript
- [TypeScript Handbook](https://www.typeshandbook.com/)
- [React Native with TypeScript](https://reactnative.dev/docs/typescript)

### Clean Architecture
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Clean Architecture in React Native](https://github.com/themakeable/clean-architecture-react-native)

### Indonesian Context
- [Indonesian Food Database](https://www.panganku.id/)
- [BPOM Indonesian Food Standards](https://www.pom.go.id/)

### Testing
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)

---

## ❓ Getting Help

### Team Communication

1. **Slack**: #healthycoaching-dev for technical discussions
2. **GitHub Issues**: For bug reports and feature requests
3. **Code Reviews**: Required for all PRs

### Common Issues

#### Database Initialization
```bash
# Clear database if needed
npx react-native clean-project-auto

# Reset Metro cache
npm start -- --reset-cache
```

#### Android Build Issues
```bash
# Clean Android build
cd android && ./gradlew clean

# Check Android dependencies
./gradlew dependencies
```

#### TypeScript Errors
```bash
# Check for type errors
npm run type-check

# Update types if needed
npm update @types/react @types/react-native
```

### Escalation Path

1. **First**: Check documentation and common issues
2. **Second**: Ask in team Slack channel
3. **Third**: Create GitHub issue with detailed description
4. **Fourth**: Schedule meeting with tech lead

---

## 🎉 Contributing

### Code Standards

1. **Follow Clean Architecture principles**
2. **Write tests for new functionality**
3. **Update documentation**
4. **Use meaningful commit messages**
5. **Consider Indonesian context**

### Review Process

1. **Self-review**: Check your own code first
2. **Peer review**: Another developer reviews
3. **Lead review**: Tech lead approves
4. **Merge**: Deploy to staging for testing

### Recognition

Great contributions are recognized in:
- Team meetings
- GitHub contributions
- Performance reviews
- Team celebrations

---

## 🏁 Conclusion

Welcome to HealthyCoaching Indonesia! You're joining at an exciting time as we build the foundation for a revolutionary health coaching app specifically designed for Indonesian market.

**Your first week goals:**
1. ✅ Set up development environment
2. ✅ Understand the architecture
3. ✅ Run the app successfully
4. ✅ Make your first small contribution
5. ✅ Get familiar with our testing approach

Remember: We're building not just an app, but a solution that will help Indonesians live healthier lives while respecting their culture and preferences.

**Selamat datang dan sukses!** (Welcome and good luck!)

---

## 📞 Quick Reference

### Important Files
- **Architecture**: `src/core/`
- **Entities**: `src/core/domain/entities/`
- **Database**: `src/core/data/local/`
- **Errors**: `src/shared/errors/`
- **Tests**: `src/**/__tests__/`

### Key Commands
```bash
npm start              # Start development
npm run android        # Run on Android
npm test               # Run tests
npm run lint           # Check code style
npm run type-check     # Type checking
```

### Help Resources
- Team Slack: #healthycoaching-dev
- GitHub Issues: Project repository
- Documentation: `/docs/` folder
- Tech Lead: [Contact information]

Good luck, and enjoy building with us! 🇮🇩
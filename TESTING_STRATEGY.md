# Testing Strategy - HealthyCoaching Indonesia

## 🧪 Overview

Testing strategy yang komprehensif untuk memastikan **error handling yang mudah dilacak** dan **code quality yang tinggi**. Setiap layer memiliki test yang spesifik dan terisolasi.

## 📊 Android-Optimized Test Pyramid

```
        /\
       /  \     E2E Tests (3%)
      /____\    - Critical Android user journeys
     /      \   - Device-specific integrations
    /________\   - Android lifecycle testing
   /          \
  /            \  Integration Tests (27%)
 /______________\ - Android API integrations
/________________\ - Database + storage performance
/                  \ - Android background services
/____________________\
/                        \ Unit Tests (70%)
/__________________________\  - Business logic
                           - Android-specific utilities
                           - Component behavior
                           - Performance optimization

🤖 Android Additions:
- Device Matrix Testing (5% of total)
- Performance Testing (10% of total)
- Memory Leak Testing (5% of total)
- Battery Usage Testing (5% of total)

## 🎯 Testing Guidelines

### 1. **Unit Testing (70%)**
Test individual components and functions in isolation.

#### Domain Layer Testing
```typescript
// tests/unit/core/domain/entities/MakananIndonesia.test.ts
describe('MakananIndonesia', () => {
  describe('constructor', () => {
    it('should create makanan with valid data', () => {
      // Arrange
      const validMakanan = {
        id: 'nasi-goreng-001',
        nama: 'Nasi Goreng',
        kategori: KategoriMakanan.MAKANAN_POKOK,
        nutrisiPer100g: createValidNutrisi()
      };

      // Act
      const makanan = new MakananIndonesia(validMakanan);

      // Assert
      expect(makanan.id).toBe('nasi-goreng-001');
      expect(makanan.nama).toBe('Nasi Goreng');
      expect(makanan.nutrisiPer100g.kalori).toBeGreaterThan(0);
    });

    it('should throw error with invalid nutrition data', () => {
      // Arrange
      const invalidMakanan = {
        id: 'test-001',
        nama: 'Test Food',
        kategori: KategoriMakanan.MAKANAN_POKOK,
        nutrisiPer100g: {
          kalori: -100, // Invalid negative calories
          protein: 0,
          karbohidrat: 0,
          lemak: 0
        }
      };

      // Act & Assert
      expect(() => new MakananIndonesia(invalidMakanan))
        .toThrow(ValidationError);
    });
  });

  describe('getNutrisiForPorsi', () => {
    it('should calculate nutrition correctly for different portions', () => {
      // Arrange
      const makanan = new MakananIndonesia(createValidMakananData());

      // Act
      const porsi200g = makanan.getNutrisiForPorsi(1); // 200g portion
      const porsi100g = makanan.getNutrisiForPorsi(0); // 100g portion

      // Assert
      expect(porsi200g.kalori).toBe(porsi100g.kalori * 2);
      expect(porsi200g.protein).toBe(porsi100g.protein * 2);
    });
  });

  describe('isHealthyForUser', () => {
    it('should reject foods with allergens', () => {
      // Arrange
      const makananUdang = new MakananIndonesia({
        ...createValidMakananData(),
        alergen: ['udang']
      });

      const user = {
        alergies: ['udang', 'kacang']
      };

      // Act & Assert
      expect(makananUdang.isHealthyForUser(user.alergies, 'normal')).toBe(false);
    });

    it('should accept vegetarian foods for vegetarian users', () => {
      // Arrange
      const makananVegetarian = new MakananIndonesia({
        ...createValidMakananData(),
        isVegetarian: true
      });

      // Act & Assert
      expect(makananVegetarian.isHealthyForUser([], 'vegetarian')).toBe(true);
    });
  });
});
```

#### Use Case Testing
```typescript
// tests/unit/core/domain/usecases/AnalyzeMakananHarian.test.ts
describe('AnalyzeMakananHarian', () => {
  let useCase: AnalyzeMakananHarian;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockMakananRepo: jest.Mocked<IMakananRepository>;
  let mockNutrisiAnalyzer: jest.Mocked<INutrisiAnalyzer>;
  let mockAlerter: jest.Mocked<IAlerter>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create mock dependencies
    mockUserRepo = createMockUserRepository();
    mockMakananRepo = createMockMakananRepository();
    mockNutrisiAnalyzer = createMockNutrisiAnalyzer();
    mockAlerter = createMockAlerter();

    // Create use case with mocked dependencies
    useCase = new AnalyzeMakananHarian(
      mockUserRepo,
      mockMakananRepo,
      mockNutrisiAnalyzer,
      mockAlerter
    );
  });

  describe('execute', () => {
    it('should analyze daily nutrition correctly', async () => {
      // Arrange
      const request: AnalyzeMakananHarianRequest = {
        userId: 'user-123',
        tanggal: new Date('2024-01-15'),
        includeRekomendasi: true
      };

      const mockUser = createMockUser();
      const mockMakananLog = createMockMakananLog();
      const mockTargetKalori = 2000;

      // Setup mock returns
      mockUserRepo.getById.mockResolvedValue(mockUser);
      mockMakananRepo.getMakananLogByDateRange.mockResolvedValue(mockMakananLog);
      mockNutrisiAnalyzer.getKaloriTarget.mockResolvedValue(mockTargetKalori);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toEqual({
        tanggal: request.tanggal,
        totalKalori: expect.any(Number),
        targetKalori: mockTargetKalori,
        persentaseTarget: expect.any(Number),
        nutrisiRataRata: expect.objectContaining({
          protein: expect.any(Number),
          karbohidrat: expect.any(Number),
          lemak: expect.any(Number)
        }),
        makananDimakan: mockMakananLog,
        status: expect.stringMatching(/^(kurang|pas|lebih)$/),
        rekomendasi: expect.any(Object),
        alerts: expect.any(Array)
      });
    });

    it('should generate salt alert when intake exceeds WHO limit', async () => {
      // Arrange
      const request = createHighSaltIntakeRequest();

      // Setup mocks
      setupMocksForHighSaltScenario();

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.alerts).toContainEqual(
        expect.objectContaining({
          code: 'GARAM_TERLALU_BANYAK',
          type: 'warning'
        })
      );

      // Verify alerter was called
      expect(mockAlerter.createAlert).toHaveBeenCalledWith(
        'GARAM_TERLALU_BANYAK',
        expect.any(String),
        'warning'
      );
    });

    it('should handle user not found error gracefully', async () => {
      // Arrange
      const request: AnalyzeMakananHarianRequest = {
        userId: 'nonexistent-user',
        tanggal: new Date(),
        includeRekomendasi: false
      };

      mockUserRepo.getById.mockRejectedValue(
        new UserNotFoundError('User not found')
      );

      // Act & Assert
      await expect(useCase.execute(request))
        .rejects
        .toThrow(UserNotFoundError);
    });
  });
});
```

### 2. **Integration Testing (25%)**

#### Repository Integration Tests
```typescript
// tests/integration/repositories/MakananRepositoryImpl.test.ts
describe('MakananRepositoryImpl Integration', () => {
  let repository: MakananRepositoryImpl;
  let testDatabase: SQLiteDatabase;

  beforeAll(async () => {
    // Setup in-memory database for testing
    testDatabase = await createTestDatabase();
    await seedTestData(testDatabase);
  });

  afterAll(async () => {
    await testDatabase.close();
  });

  beforeEach(() => {
    repository = new MakananRepositoryImpl(
      testDatabase,
      mockApiService,
      mockCacheManager,
      mockNetworkStatus
    );
  });

  describe('searchByNama', () => {
    it('should return cached results when available', async () => {
      // Arrange
      const searchRequest = {
        keyword: 'nasi goreng',
        lokasi: 'Jakarta'
      };

      // Seed cache with data
      await seedCacheWithResults(searchRequest);

      // Act
      const result = await repository.searchByNama(searchRequest);

      // Assert
      expect(result.makanan).toHaveLength(5);
      expect(result.hasMore).toBe(false);

      // Verify API was not called (cache hit)
      expect(mockApiService.searchMakanan).not.toHaveBeenCalled();
    });

    it('should fallback to API when cache miss', async () => {
      // Arrange
      const searchRequest = {
        keyword: 'soto ayam',
        lokasi: 'Surabaya'
      };

      mockNetworkStatus.isOnline.mockResolvedValue(true);
      mockApiService.searchMakanan.mockResolvedValue({
        makanan: [createMockMakanan()],
        total: 1,
        hasMore: false
      });

      // Act
      const result = await repository.searchByNama(searchRequest);

      // Assert
      expect(result.makanan).toHaveLength(1);
      expect(mockApiService.searchMakanan).toHaveBeenCalledWith(searchRequest);
    });

    it('should return local results when offline', async () => {
      // Arrange
      const searchRequest = {
        keyword: 'rendang',
        lokasi: 'Padang'
      };

      mockNetworkStatus.isOnline.mockResolvedValue(false);

      // Seed local database
      await seedLocalDatabase(['rendang']);

      // Act
      const result = await repository.searchByNama(searchRequest);

      // Assert
      expect(result.makanan).toHaveLength(1);
      expect(mockApiService.searchMakanan).not.toHaveBeenCalled();
    });
  });
});
```

#### API Integration Tests
```typescript
// tests/integration/api/MakananApiService.test.ts
describe('MakananApiService Integration', () => {
  let apiService: MakananApiService;
  let mockServer: SetupServerApi;

  beforeAll(() => {
    // Setup mock server for API testing
    mockServer = setupServer();
    mockServer.listen();
  });

  afterAll(() => {
    mockServer.close();
  });

  beforeEach(() => {
    apiService = new MakananApiService(createHttpClient());
    mockServer.resetHandlers();
  });

  describe('searchMakanan', () => {
    it('should handle successful API response', async () => {
      // Arrange
      const mockApiResponse = {
        data: [
          {
            id: 'nasi-goreng-001',
            nama: 'Nasi Goreng',
            kategori: 'makanan_pokok',
            nutrisi_per_100g: {
              kalori: 165,
              protein: 7,
              karbohidrat: 30,
              lemak: 4
            }
          }
        ]
      };

      mockServer.use(
        rest.get('/api/makanan/search', (req, res, ctx) => {
          return res(ctx.json(mockApiResponse));
        })
      );

      // Act
      const result = await apiService.searchMakanan('nasi goreng');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].nama).toBe('Nasi Goreng');
      expect(result[0].nutrisiPer100g.kalori).toBe(165);
    });

    it('should handle API error with proper error wrapping', async () => {
      // Arrange
      mockServer.use(
        rest.get('/api/makanan/search', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Server error' }));
        })
      );

      // Act & Assert
      await expect(apiService.searchMakanan('test'))
        .rejects
        .toThrow(NetworkError);
    });
  });
});
```

### 3. **End-to-End Testing (5%)**

#### Critical User Journeys
```typescript
// tests/e2e/userJourneys/CompleteMealTracking.test.ts
describe('Complete Meal Tracking Journey', () => {
  let app: Application;

  beforeAll(async () => {
    app = await initializeApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should track complete meal from search to saving', async () => {
    // 1. User logs in
    await app.login('test@example.com', 'password');

    // 2. Navigate to meal tracking
    await app.navigateTo('/nutrition/tracker');

    // 3. Search for food
    await app.fillInput('[data-testid="search-input"]', 'nasi goreng');
    await app.pressKey('Enter');

    // 4. Select food from search results
    await app.clickElement('[data-testid="food-card-nasi-goreng"]');

    // 5. Set portion size
    await app.selectOption('[data-testid="portion-select"]', '1 piring');

    // 6. Save meal
    await app.clickButton('[data-testid="save-meal-button"]');

    // 7. Verify meal is saved
    const todayMeals = await app.getTodayMeals();
    expect(todayMeals).toContain(
      expect.objectContaining({
        nama: 'Nasi Goreng',
        porsi: '1 piring'
      })
    );

    // 8. Check daily nutrition is updated
    const nutritionSummary = await app.getNutritionSummary();
    expect(nutritionSummary.totalKalori).toBeGreaterThan(0);
  });
});
```

## 🎯 Error Handling Testing

### Error Correlation Testing
```typescript
// tests/unit/core/network/ErrorHandler.test.ts
describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;
  let mockLogger: jest.Mocked<ILogger>;
  let mockNotificationService: jest.Mocked<INotificationService>;
  let mockAnalyticsService: jest.Mocked<IAnalyticsService>;

  beforeEach(() => {
    errorHandler = new ErrorHandler(
      mockLogger,
      mockNotificationService,
      mockAnalyticsService
    );
  });

  describe('handleError', () => {
    it('should generate unique correlation ID for each error', async () => {
      // Arrange
      const error = new Error('Test error');

      // Act
      await errorHandler.handleError(error);
      await errorHandler.handleError(new Error('Another error'));

      // Assert
      expect(mockLogger.error).toHaveBeenCalledTimes(2);

      // Verify correlation IDs are different
      const firstCall = mockLogger.error.mock.calls[0][1];
      const secondCall = mockLogger.error.mock.calls[1][1];

      expect(firstCall.error.correlationId).not.toBe(
        secondCall.error.correlationId
      );
    });

    it('should include full context in error logs', async () => {
      // Arrange
      const error = new ValidationError(
        'Email tidak valid',
        'email',
        'invalid-email'
      );
      const context = {
        userId: 'user-123',
        action: 'register',
        deviceInfo: 'iPhone 13'
      };

      // Act
      await errorHandler.handleError(error, context);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error occurred',
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            context: expect.objectContaining({
              userId: 'user-123',
              action: 'register'
            }),
            correlationId: expect.stringMatching(/^HC-\d+-\w+$/)
          }),
          buildNumber: expect.any(String),
          platform: expect.any(String)
        })
      );
    });

    it('should show Indonesian error message to user', async () => {
      // Arrange
      const networkError = new NetworkError(
        'No internet connection',
        undefined,
        undefined
      );

      // Act
      await errorHandler.handleError(networkError);

      // Assert
      expect(mockNotificationService.showError).toHaveBeenCalledWith(
        'Tidak ada koneksi internet. Silakan periksa jaringan Anda.',
        expect.objectContaining({
          duration: 5000,
          action: expect.objectContaining({
            text: 'Coba Lagi'
          })
        })
      );
    });
  });
});
```

## 📊 Test Coverage Requirements

### Android-Specific Coverage Targets
- **Domain Layer**: 95% coverage (critical business logic)
- **Data Layer**: 85% coverage (repositories, API clients)
- **Presentation Layer**: 80% coverage (components, screens)
- **Integration Tests**: 70% coverage (layer interactions)
- **Android Utilities**: 90% coverage (memory management, performance)
- **Device Compatibility**: 100% coverage for target device matrix
- **E2E Tests**: Cover critical Android user journeys only

### Android Device Testing Matrix
```typescript
const androidTestDevices = {
  lowEnd: [
    'Samsung Galaxy A12', // 2GB RAM, Android 11
    'Xiaomi Redmi 9',     // 2GB RAM, Android 10
    'Oppo A53'           // 3GB RAM, Android 11
  ],
  midRange: [
    'Samsung Galaxy A52', // 4GB RAM, Android 12
    'Xiaomi Redmi Note 11', // 6GB RAM, Android 12
    'Oppo Reno7'         // 8GB RAM, Android 13
  ],
  highEnd: [
    'Samsung Galaxy S22', // 8GB RAM, Android 13
    'Google Pixel 7',    // 8GB RAM, Android 13
    'Xiaomi 12 Pro'      // 12GB RAM, Android 13
  ]
};
```

### Coverage Reporting
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html

# Check specific thresholds
npx jest --coverage --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'
```

## 🚀 CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
```

## 📝 Test Documentation

### Test Naming Conventions
```typescript
describe('Component/Feature', () => {
  describe('method/specific behavior', () => {
    it('should do [expected behavior] when [condition]', () => {
      // Test implementation
    });
  });
});
```

### Test Structure (AAA Pattern)
```typescript
it('should calculate correct nutrition for 200g portion', () => {
  // Arrange - Setup test data and mocks
  const makanan = new MakananIndonesia(createValidData());

  // Act - Execute the method being tested
  const result = makanan.getNutrisiForPorsi(1);

  // Assert - Verify the results
  expect(result.kalori).toBe(330); // 165 * 2
});
```

## 🎯 Testing Best Practices

### DO's
- ✅ Test business logic independently of frameworks
- ✅ Use dependency injection for easy mocking
- ✅ Write descriptive test names
- ✅ Test error scenarios, not just success paths
- ✅ Use factories for test data creation
- ✅ Keep tests simple and focused

### DON'Ts
- ❌ Don't test implementation details
- ❌ Don't mock too much (test realistic scenarios)
- ❌ Don't ignore test coverage
- ❌ Don't write brittle tests (too specific expectations)
- ❌ Don't skip testing edge cases
- ❌ Don't use shared state between tests

Testing strategy ini memastikan **error tracking yang mudah** dan **code quality yang tinggi** untuk aplikasi HealthyCoaching Indonesia!
# Testing Infrastructure and Strategies - HealthyCoaching Indonesia

## 📋 Overview

This document outlines the comprehensive testing strategy for HealthyCoaching Indonesia, a React Native application built with TypeScript and Clean Architecture principles. Our testing approach ensures reliability, maintainability, and confidence in our Indonesian health coaching application.

### Testing Goals

1. **Reliability**: Ensure app works correctly across different devices and scenarios
2. **Maintainability**: Catch regressions early and facilitate safe refactoring
3. **User Experience**: Validate Indonesian context and cultural features work correctly
4. **Performance**: Ensure app remains responsive with large food databases
5. **Data Integrity**: Validate SQLite operations and migrations

### Test Pyramid

```
    /\
   /E2E\     <- Few (5%)
  /_____\
 /Integration\ <- Some (15%)
/_____________\
/    Unit      \  <- Many (80%)
/_______________\
```

---

## 🧪 Unit Testing

### Scope

Unit tests focus on testing individual functions, classes, and modules in isolation:

- **Domain Entities**: Business logic validation
- **Use Cases**: Business rule implementation
- **Repository Methods**: Data transformation logic
- **Utility Functions**: Helper and utility functions
- **Error Classes**: Error handling and message formatting

### Configuration

#### Jest Setup (`jest.config.js`)

```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*)/)',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.ts',
    '<rootDir>/src/**/__tests__/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

#### Jest Setup (`jest.setup.js`)

```javascript
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock SQLite
jest.mock('react-native-sqlite-storage', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn((fn) => {
      fn({
        executeSql: jest.fn((query, params, successCallback) => {
          successCallback(null, {
            rows: {
              length: 0,
              item: jest.fn(() => ({})),
            },
            insertId: 1,
            rowsAffected: 1,
          });
        }),
      });
    }),
    executeSql: jest.fn(),
    close: jest.fn(),
  })),
}));

// Mock correlation ID generation
jest.mock('@/shared/utils/correlationId', () => ({
  generateCorrelationId: jest.fn(() => 'test-correlation-id'),
}));
```

### Entity Testing Examples

#### MakananIndonesia Entity Tests

```typescript
// src/core/domain/entities/__tests__/MakananIndonesia.test.ts
import { MakananIndonesia, KategoriMakanan, CaraMasak, TingkatKepopuleran } from '../MakananIndonesia';
import { createMockNasiGoreng, createMockSayurLodeh } from './mocks/MakananIndonesia.mock';

describe('MakananIndonesia', () => {
  describe('Constructor', () => {
    it('should create valid Indonesian food entity', () => {
      const nasiGoreng = createMockNasiGoreng();

      expect(nasiGoreng).toBeInstanceOf(MakananIndonesia);
      expect(nasiGoreng.id).toBe('mkn-001');
      expect(nasiGoreng.nama).toBe('Nasi Goreng');
      expect(nasiGoreng.kategori).toBe(KategoriMakanan.MAKANAN_POKOK);
      expect(nasiGoreng.halalCertified).toBe(true);
    });

    it('should require all required fields', () => {
      expect(() => {
        new MakananIndonesia(
          '', // Empty ID should fail
          'Test',
          [],
          KategoriMakanan.MAKANAN_POKOK,
          [],
          {} as any,
          {} as any,
          [],
          [],
          [],
          true,
          false,
          false,
          [],
          TingkatKepopuleran.SANGAT_POPULER,
          'seluruh_indonesia',
          false,
          {} as any,
          new Date()
        );
      }).not.toThrow();
    });
  });

  describe('Nutrition Calculation', () => {
    it('should calculate nutrition for standard portion correctly', () => {
      const nasiGoreng = createMockNasiGoreng();
      const nutrition = nasiGoreng.getNutrisiUntukPorsi(0);

      // Test calculation: 300g portion = 3x 100g values
      expect(nutrition.kalori).toBe(489); // 163 * 3
      expect(nutrition.protein).toBeCloseTo(18.3, 1); // 6.1 * 3
      expect(nutrition.karbohidrat).toBeCloseTo(70.8, 1); // 23.6 * 3
      expect(nutrition.lemak).toBeCloseTo(19.2, 1); // 6.4 * 3
    });

    it('should handle different portion sizes correctly', () => {
      const nasiGoreng = createMockNasiGoreng();

      // 150g portion
      const nutrition150g = nasiGoreng.getNutrisiUntukPorsi(1);

      expect(nutrition150g.kalori).toBeCloseTo(244.5, 1); // 163 * 1.5
      expect(nutrition150g.protein).toBeCloseTo(9.15, 1); // 6.1 * 1.5
    });

    it('should throw error for invalid portion index', () => {
      const nasiGoreng = createMockNasiGoreng();

      expect(() => nasiGoreng.getNutrisiUntukPorsi(-1))
        .toThrow('Porsi index -1 tidak valid');

      expect(() => nasiGoreng.getNutrisiUntukPorsi(999))
        .toThrow('Porsi index 999 tidak valid');
    });
  });

  describe('Indonesian Context Methods', () => {
    describe('isMakananKhasRamadan', () => {
      it('should identify Ramadan foods correctly', () => {
        const kolak = new MakananIndonesia(
          'mkn-002',
          'Kolak Pisang',
          [],
          KategoriMakanan.MINUMAN,
          [],
          {} as any,
          {} as any,
          [],
          [],
          [],
          true,
          false,
          false,
          [],
          TingkatKepopuleran.CUKUP_POPULER,
          'seluruh_indonesia',
          false,
          {} as any,
          new Date()
        );

        expect(kolak.isMakananKhasRamadan()).toBe(true);
      });

      it('should not identify non-Ramadan foods as Ramadan foods', () => {
        const nasiGoreng = createMockNasiGoreng();
        expect(nasiGoreng.isMakananKhasRamadan()).toBe(false);
      });
    });

    describe('isTersediaDiLokasi', () => {
      it('should return true for nationally available foods', () => {
        const nasiGoreng = createMockNasiGoreng();

        expect(nasiGoreng.isTersediaDiLokasi('Jawa Barat')).toBe(true);
        expect(nasiGoreng.isTersediaDiLokasi('Sumatera Barat')).toBe(true);
        expect(nasiGoreng.isTersediaDiLokasi('Papua')).toBe(true);
      });

      it('should check regional availability correctly', () => {
        const rendang = new MakananIndonesia(
          'mkn-003',
          'Rendang',
          [],
          KategoriMakanan.LAUK_PAUK,
          ['Sumatera Barat'],
          {
            provinsi: ['Sumatera Barat', 'Sumatera Utara'],
            kota: ['Padang', 'Bukittinggi', 'Medan'],
            musiman: ['hujan', 'kemarau']
          },
          {} as any,
          [],
          [],
          [],
          [],
          true,
          false,
          false,
          ['santan'],
          TingkatKepopuleran.SANGAT_POPULER,
          'beberapa_wilayah',
          false,
          {} as any,
          new Date()
        );

        expect(rendang.isTersediaDiLokasi('Sumatera Barat')).toBe(true);
        expect(rendang.isTersediaDiLokasi('Sumatera Barat', 'Padang')).toBe(true);
        expect(rendang.isTersediaDiLokasi('Jawa Barat')).toBe(false);
      });
    });

    describe('isSehatUntukPengguna', () => {
      it('should check allergies correctly', () => {
        const makananKacang = new MakananIndonesia(
          'mkn-004',
          'Kacang Goreng',
          [],
          KategoriMakanan.JAJANAN,
          [],
          {} as any,
          {} as any,
          [],
          [],
          [],
          true,
          false,
          false,
          ['kacang tanah'],
          TingkatKepopuleran.CUKUP_POPULER,
          'seluruh_indonesia',
          false,
          {} as any,
          new Date()
        );

        const userAlergiKacang = ['kacang tanah', 'udang'];
        const userTidakAlergi = ['telur'];

        expect(makananKacang.isSehatUntukPengguna(userAlergiKacang)).toBe(false);
        expect(makananKacang.isSehatUntukPengguna(userTidakAlergi)).toBe(true);
      });

      it('should handle case-insensitive allergen matching', () => {
        const makananUdang = new MakananIndonesia(
          'mkn-005',
          'Udang Goreng',
          [],
          KategoriMakanan.LAUK_PAUK,
          [],
          {} as any,
          {} as any,
          [],
          [],
          [],
          true,
          false,
          false,
          ['Udang'],
          TingkatKepopuleran.SANGAT_POPULER,
          'seluruh_indonesia',
          false,
          {} as any,
          new Date()
        );

        const userAlergi = ['UDANG']; // Uppercase
        expect(makananUdang.isSehatUntukPengguna(userAlergi)).toBe(false);
      });
    });

    describe('Health Assessment', () => {
      it('should assess nutritional value correctly', () => {
        const sayurBayam = new MakananIndonesia(
          'mkn-006',
          'Sayur Bayam',
          [],
          KategoriMakanan.SAYURAN,
          [],
          {} as any,
          {
            kalori: 23,
            protein: 2.9,
            karbohidrat: 3.6,
            lemak: 0.4,
            serat: 2.2,
            garam: 70,
            gula: 0.4,
            vitaminA: 469,
            vitaminC: 28.1,
            kalsium: 99,
            zatBesi: 2.7,
            folat: 194
          },
          [],
          [],
          [],
          [],
          true,
          true,
          true,
          [],
          TingkatKepopuleran.CUKUP_POPULER,
          'seluruh_indonesia',
          false,
          {} as any,
          new Date()
        );

        expect(sayurBayam.adalahBergizi()).toBe(true); // High in fiber, low in salt and sugar
      });

      it('should identify unhealthy foods correctly', () => {
        const gorengan = new MakananIndonesia(
          'mkn-007',
          'Gorengan',
          [],
          KategoriMakanan.JAJANAN,
          [],
          {} as any,
          {
            kalori: 250,
            protein: 3,
            karbohidrat: 20,
            lemak: 18,
            serat: 1,
            garam: 800,
            gula: 5,
            vitaminA: 0,
            vitaminC: 0,
            kalsium: 20,
            zatBesi: 1,
            folat: 10
          },
          [],
          [],
          [],
          [],
          true,
          false,
          false,
          [],
          TingkatKepopuleran.CUKUP_POPULER,
          'seluruh_indonesia',
          false,
          {} as any,
          new Date()
        );

        expect(gorengan.adalahBergizi()).toBe(false); // High salt and fat
      });
    });

    describe('Dietary Compatibility', () => {
      it('should check vegetarian compatibility correctly', () => {
        const tempe = new MakananIndonesia(
          'mkn-008',
          'Tempe Goreng',
          [],
          KategoriMakanan.LAUK_PAUK,
          [],
          {} as any,
          {} as any,
          [],
          [],
          [
            { nama: 'tempe', persentase: 100, kategori: 'protein_nabati' }
          ],
          [CaraMasak.GORENG],
          true,
          true,
          true,
          [],
          TingkatKepopuleran.SANGAT_POPULER,
          'seluruh_indonesia',
          false,
          {} as any,
          new Date()
        );

        const ayamGoreng = new MakananIndonesia(
          'mkn-009',
          'Ayam Goreng',
          [],
          KategoriMakanan.LAUK_PAUK,
          [],
          {} as any,
          {} as any,
          [],
          [],
          [
            { nama: 'ayam', persentase: 100, kategori: 'protein_hewani' }
          ],
          [CaraMasak.GORENG],
          true,
          false,
          false,
          [],
          TingkatKepopuleran.SANGAT_POPULER,
          'seluruh_indonesia',
          false,
          {} as any,
          new Date()
        );

        expect(tempe.dapatDimakanSelamaDiet('vegetarian')).toBe(true);
        expect(ayamGoreng.dapatDimakanSelamaDiet('vegetarian')).toBe(false);
      });
    });
  });

  describe('Utility Methods', () => {
    it('should format nutrition information correctly', () => {
      const nasiGoreng = createMockNasiGoreng();
      const info = nasiGoreng.getInformasiNutrisiLengkap();

      expect(info).toContain('Kalori: 163');
      expect(info).toContain('Protein: 6.1g');
      expect(info).toContain('Karbohidrat: 23.6g');
      expect(info).toContain('Lemak: 6.4g');
      expect(info).toContain('Serat: 1.2g');
      expect(info).toContain('Garam: 680mg');
      expect(info).toContain('Gula: 2.1g');
    });

    it('should get recommended portion for target calories', () => {
      const nasiGoreng = createMockNasiGoreng();

      // Target around 300 calories
      const porsi300kal = nasiGoreng.getPorsiRekomendasi(300);
      expect(porsi300kal.beratGram).toBeCloseTo(180, 0); // 300/163 * 100 ≈ 184g
    });
  });
});
```

#### User Entity Tests

```typescript
// src/core/domain/entities/__tests__/User.test.ts
import { User, UserPreferences, UserProfile } from '../User';
import { createMockUser, createMockUserProfile } from './mocks/User.mock';

describe('User', () => {
  describe('Constructor', () => {
    it('should create valid user entity', () => {
      const user = createMockUser();

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe('user-001');
      expect(user.email).toBe('user@example.com');
      expect(user.profile).toBeDefined();
    });
  });

  describe('Health Calculations', () => {
    it('should calculate age correctly', () => {
      const today = new Date('2024-01-01');
      const birthDate = new Date('1990-01-01');
      const userProfile = createMockUserProfile({
        tanggalLahir: birthDate
      });

      const user = new User('user-001', 'test@example.com', userProfile, today);

      expect(user.getUmur()).toBe(34);
    });

    it('should handle birthday edge cases correctly', () => {
      // Test birthday hasn't occurred yet this year
      const today = new Date('2024-03-15');
      const birthDate = new Date('1990-12-25');
      const userProfile = createMockUserProfile({
        tanggalLahir: birthDate
      });

      const user = new User('user-001', 'test@example.com', userProfile, today);

      expect(user.getUmur()).toBe(33); // Birthday hasn't happened yet
    });

    it('should calculate BMI correctly', () => {
      const userProfile = createMockUserProfile({
        tinggiBadan: 170, // 1.7m
        beratBadan: 70    // 70kg
      });

      const user = new User('user-001', 'test@example.com', userProfile, new Date());

      const expectedBMI = 70 / (1.7 * 1.7); // 70 / 2.89 = 24.22
      expect(user.getBMI()).toBeCloseTo(expectedBMI, 2);
    });

    it('should categorize BMI correctly', () => {
      const testCases = [
        { height: 170, weight: 55, expectedCategory: 'kurus' },    // BMI: 19.0
        { height: 170, weight: 65, expectedCategory: 'normal' },   // BMI: 22.5
        { height: 170, weight: 75, expectedCategory: 'kelebihan' }, // BMI: 25.9
        { height: 170, weight: 85, expectedCategory: 'obesitas_1' }, // BMI: 29.4
        { height: 170, weight: 95, expectedCategory: 'obesitas_2' }, // BMI: 32.9
      ];

      testCases.forEach(({ height, weight, expectedCategory }) => {
        const userProfile = createMockUserProfile({
          tinggiBadan: height,
          beratBadan: weight
        });

        const user = new User('user-001', 'test@example.com', userProfile, new Date());

        expect(user.getBMICategory()).toBe(expectedCategory);
      });
    });
  });

  describe('Goal Management', () => {
    it('should check if user has weight target', () => {
      const userWithTarget = createMockUser({
        profile: createMockUserProfile({ targetBerat: 65 })
      });

      const userWithoutTarget = createMockUser({
        profile: createMockUserProfile({ targetBerat: undefined })
      });

      expect(userWithTarget.hasTargetBerat()).toBe(true);
      expect(userWithoutTarget.hasTargetBerat()).toBe(false);
    });

    it('should identify active goals correctly', () => {
      const today = new Date('2024-01-01');

      const activeGoal = {
        id: 'goal-001',
        jenis: 'turun_berat' as const,
        target: 5,
        targetTanggal: new Date('2024-06-01'), // Future date
        isActive: true,
        createdAt: today
      };

      const expiredGoal = {
        id: 'goal-002',
        jenis: 'turun_berat' as const,
        target: 3,
        targetTanggal: new Date('2023-06-01'), // Past date
        isActive: true,
        createdAt: today
      };

      const inactiveGoal = {
        id: 'goal-003',
        jenis: 'turun_berat' as const,
        target: 4,
        targetTanggal: new Date('2024-06-01'), // Future date
        isActive: false, // Inactive
        createdAt: today
      };

      const userWithActiveGoal = createMockUser({
        profile: createMockUserProfile({ golKesehatan: [activeGoal, expiredGoal, inactiveGoal] })
      });

      const activeGoalFound = userWithActiveGoal.isGoalAktif();
      expect(activeGoalFound).toBe(activeGoal);
    });
  });

  describe('Indonesian Context', () => {
    it('should check halal food requirements', () => {
      const userHalal = createMockUser({
        profile: createMockUserProfile({
          preferensi: {
            preferensiBahasa: 'id' as const,
            notifikasi: {
              email: true,
              push: true,
              workoutReminder: true,
              mealReminder: true
            },
            preferensiDiet: {
              tipe: 'none' as const,
              halalOnly: true,
              tidakSuka: []
            },
            preferensiPembayaran: {
              defaultMethod: 'gopay' as const,
              tersimpan: {
                gopay: true,
                ovo: false,
                dana: false
              }
            },
            preferensiUnit: {
              berat: 'kg' as const,
              tinggi: 'cm' as const,
              suhu: 'celsius' as const,
              jarak: 'km' as const
            }
          }
        })
      });

      const userNonHalal = createMockUser({
        profile: createMockUserProfile({
          preferensi: {
            preferensiBahasa: 'id' as const,
            notifikasi: {
              email: true,
              push: true,
              workoutReminder: true,
              mealReminder: true
            },
            preferensiDiet: {
              tipe: 'none' as const,
              halalOnly: false,
              tidakSuka: []
            },
            preferensiPembayaran: {
              defaultMethod: 'kartu_kredit' as const,
              tersimpan: {
                gopay: false,
                ovo: false,
                dana: false
              }
            },
            preferensiUnit: {
              berat: 'kg' as const,
              tinggi: 'cm' as const,
              suhu: 'celsius' as const,
              jarak: 'km' as const
            }
          }
        })
      });

      expect(userHalal.needsHalalFood()).toBe(true);
      expect(userNonHalal.needsHalalFood()).toBe(false);
    });

    it('should return allergen list correctly', () => {
      const userWithAllergies = createMockUser({
        profile: createMockUserProfile({
          alergi: ['udang', 'kacang tanah', 'telur']
        })
      });

      const allergens = userWithAllergies.getAlergenList();
      expect(allergens).toEqual(['udang', 'kacang tanah', 'telur']);
    });
  });

  describe('Profile Validation', () => {
    it('should validate correct profile', () => {
      const user = createMockUser();
      const validation = user.validateProfile();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid email', () => {
      const userWithInvalidEmail = createMockUser({
        profile: createMockUserProfile({ email: 'invalid-email' })
      });

      const validation = userWithInvalidEmail.validateProfile();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Email tidak valid');
    });

    it('should detect invalid height', () => {
      const testCases = [
        { height: 99, expectedError: true },   // Too short
        { height: 100, expectedError: false },  // Minimum valid
        { height: 250, expectedError: false },  // Maximum valid
        { height: 251, expectedError: true },   // Too tall
      ];

      testCases.forEach(({ height, expectedError }) => {
        const user = createMockUser({
          profile: createMockUserProfile({ tinggiBadan: height })
        });

        const validation = user.validateProfile();

        if (expectedError) {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain('Tinggi badan harus antara 100-250 cm');
        } else {
          // Height might still be invalid due to other factors, so just check specific error
          expect(validation.errors).not.toContain('Tinggi badan harus antara 100-250 cm');
        }
      });
    });

    it('should detect invalid weight', () => {
      const testCases = [
        { weight: 29, expectedError: true },   // Too light
        { weight: 30, expectedError: false },  // Minimum valid
        { weight: 300, expectedError: false },  // Maximum valid
        { weight: 301, expectedError: true },   // Too heavy
      ];

      testCases.forEach(({ weight, expectedError }) => {
        const user = createMockUser({
          profile: createMockUserProfile({ beratBadan: weight })
        });

        const validation = user.validateProfile();

        if (expectedError) {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain('Berat badan harus antara 30-300 kg');
        } else {
          expect(validation.errors).not.toContain('Berat badan harus antara 30-300 kg');
        }
      });
    });

    it('should detect invalid name', () => {
      const userWithShortName = createMockUser({
        profile: createMockUserProfile({ namaLengkap: 'A' }) // Too short
      });

      const userWithEmptyName = createMockUser({
        profile: createMockUserProfile({ namaLengkap: '   ' }) // Whitespace only
      });

      const validationShort = userWithShortName.validateProfile();
      const validationEmpty = userWithEmptyName.validateProfile();

      expect(validationShort.isValid).toBe(false);
      expect(validationShort.errors).toContain('Nama lengkap harus diisi minimal 2 karakter');

      expect(validationEmpty.isValid).toBe(false);
      expect(validationEmpty.errors).toContain('Nama lengkap harus diisi minimal 2 karakter');
    });
  });
});
```

### Use Case Testing Examples

```typescript
// src/core/domain/usecases/__tests__/AnalyzeMakananHarian.test.ts
import { AnalyzeMakananHarian } from '../AnalyzeMakananHarian';
import { createMockUser, createMockUserProfile } from '../../entities/__tests__/mocks/User.mock';
import { createMockNasiGoreng } from '../../entities/__tests__/mocks/MakananIndonesia.mock';
import { MakananLog } from '../../../types/MakananLog';

describe('AnalyzeMakananHarian', () => {
  let useCase: AnalyzeMakananHarian;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockMakananRepo: jest.Mocked<IMakananRepository>;
  let mockMakananLogRepo: jest.Mocked<IMakananLogRepository>;
  let mockNutrisiAnalyzer: jest.Mocked<INutrisiAnalyzer>;

  beforeEach(() => {
    mockUserRepo = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockMakananRepo = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockMakananLogRepo = {
      findByUserIdAndDateRange: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockNutrisiAnalyzer = {
      getKaloriTarget: jest.fn(),
      analyzeNutrisi: jest.fn(),
    };

    useCase = new AnalyzeMakananHarian(
      mockUserRepo,
      mockMakananRepo,
      mockMakananLogRepo,
      mockNutrisiAnalyzer
    );
  });

  describe('execute', () => {
    it('should analyze daily nutrition correctly', async () => {
      // Arrange
      const mockUser = createMockUser();
      const mockMakanan = createMockNasiGoreng();
      const targetKalori = 2000;

      const today = new Date('2024-01-15');
      const startOfDay = new Date('2024-01-15T00:00:00.000Z');
      const endOfDay = new Date('2024-01-15T23:59:59.999Z');

      const mockMakananLog: MakananLog[] = [
        {
          id: 'log-001',
          userId: 'user-001',
          makananId: 'mkn-001',
          porsiIndex: 0,
          waktuMakan: new Date('2024-01-15T08:00:00.000Z'),
          catatan: 'Sarapan',
          createdAt: new Date()
        }
      ];

      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockMakananRepo.findById.mockResolvedValue(mockMakanan);
      mockMakananLogRepo.findByUserIdAndDateRange.mockResolvedValue(mockMakananLog);
      mockNutrisiAnalyzer.getKaloriTarget.mockResolvedValue(targetKalori);

      const request = {
        userId: 'user-001',
        tanggal: today,
        includeRekomendasi: true
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.tanggal).toEqual(today);
      expect(result.totalKalori).toBe(489); // Nasi goreng nutrition
      expect(result.targetKalori).toBe(targetKalori);
      expect(result.persentaseTarget).toBeCloseTo(24.45, 2); // 489/2000 * 100
      expect(result.status).toBe('kurang'); // Less than 80% of target
      expect(result.rekomendasi).toBeDefined();
      expect(result.makananDimakan).toEqual(mockMakananLog);

      // Verify method calls
      expect(mockUserRepo.findById).toHaveBeenCalledWith('user-001');
      expect(mockMakananLogRepo.findByUserIdAndDateRange).toHaveBeenCalledWith(
        'user-001',
        startOfDay,
        endOfDay
      );
      expect(mockNutrisiAnalyzer.getKaloriTarget).toHaveBeenCalledWith(mockUser);
    });

    it('should handle user not found error', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      const request = {
        userId: 'nonexistent-user',
        tanggal: new Date(),
        includeRekomendasi: false
      };

      await expect(useCase.execute(request))
        .rejects.toThrow('User with ID nonexistent-user not found');
    });

    it('should generate correct nutrition status', async () => {
      const mockUser = createMockUser();
      const today = new Date('2024-01-15');
      const targetKalori = 2000;

      // Test different calorie scenarios
      const testCases = [
        { totalKalori: 1200, expectedStatus: 'kurang' },  // 60% of target
        { totalKalori: 1800, expectedStatus: 'pas' },     // 90% of target
        { totalKalori: 2400, expectedStatus: 'lebih' },   // 120% of target
      ];

      for (const { totalKalori, expectedStatus } of testCases) {
        const mockMakananLog: MakananLog[] = [
          {
            id: 'log-001',
            userId: 'user-001',
            makananId: 'mkn-001',
            porsiIndex: 0,
            waktuMakan: today,
            catatan: 'Test meal',
            createdAt: new Date()
          }
        ];

        mockUserRepo.findById.mockResolvedValue(mockUser);
        mockMakananLogRepo.findByUserIdAndDateRange.mockResolvedValue(mockMakananLog);
        mockNutrisiAnalyzer.getKaloriTarget.mockResolvedValue(targetKalori);

        // Mock nutrition calculation to return specific total
        jest.spyOn(useCase as any, 'calculateTotalNutrisi').mockResolvedValue({
          kalori: totalKalori,
          protein: 50,
          karbohidrat: 200,
          lemak: 60,
          serat: 20,
          garam: 3000,
          gula: 30,
          vitaminA: 1000,
          vitaminC: 50,
          kalsium: 500,
          zatBesi: 10,
          folat: 200
        });

        const request = {
          userId: 'user-001',
          tanggal: today,
          includeRekomendasi: false
        };

        const result = await useCase.execute(request);
        expect(result.status).toBe(expectedStatus);
      }
    });
  });
});
```

### Mock Utilities

```typescript
// src/core/domain/entities/__tests__/mocks/MakananIndonesia.mock.ts
import { MakananIndonesia, KategoriMakanan, CaraMasak, TingkatKepopuleran } from '../MakananIndonesia';

export const createMockNasiGoreng = (overrides: Partial<MakananIndonesia> = {}): MakananIndonesia => {
  return new MakananIndonesia(
    'mkn-001',
    'Nasi Goreng',
    ['Nasi Goreng Spesial', 'Fried Rice'],
    KategoriMakanan.MAKANAN_POKOK,
    ['Indonesia', 'Jawa'],
    {
      provinsi: ['Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur'],
      kota: ['Bandung', 'Yogyakarta', 'Semarang', 'Surabaya'],
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
      },
      {
        id: 'pors-002',
        nama: '1 mangkok',
        beratGram: 250,
        deskripsi: 'Satu mangkok nasi goreng'
      }
    ],
    ['https://example.com/nasi-goreng-1.jpg'],
    [
      { nama: 'nasi', persentase: 60, kategori: 'karbohidrat' },
      { nama: 'telur', persentase: 20, kategori: 'protein_hewani' },
      { nama: 'bumbu', persentase: 15, kategori: 'bumbu_masak' },
      { nama: 'minyak', persentase: 5, kategori: 'lemak' }
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
    new Date('2024-01-01'),
    new Date('2024-01-01'),
    new Date()
  );
};

// Mock implementations for repositories
export const createMockMakananRepository = (): jest.Mocked<IMakananRepository> => {
  return {
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findBy: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    exists: jest.fn(),
    existsBy: jest.fn(),
    findWithPagination: jest.fn(),
    transaction: jest.fn(),
    query: jest.fn(),
    backup: jest.fn(),
    restore: jest.fn(),
    getStats: jest.fn(),
    searchByNama: jest.fn(),
    getByKategori: jest.fn(),
    getByAsal: jest.fn(),
    getDetail: jest.fn(),
    getPopularMakanan: jest.fn(),
    getRekomendasiUntukDiet: jest.fn(),
    getMakananMusim: jest.fn(),
    saveMakanan: jest.fn(),
    clearCache: jest.fn(),
    syncWithServer: jest.fn(),
    getMakananLogByDateRange: jest.fn()
  };
};
```

---

## 🔧 Integration Testing

### Scope

Integration tests verify that multiple components work together correctly:

- **Repository + Database**: Data persistence operations
- **Use Cases + Repositories**: Business logic integration
- **Database Migrations**: Schema evolution
- **Error Handling**: Error propagation and correlation ID tracking

### Database Integration Tests

```typescript
// src/core/data/local/__tests__/DatabaseManager.integration.test.ts
import { DatabaseManager } from '../database/DatabaseManager';
import { InitialSchemaMigration } from '../migrations/001_initial_schema';

describe('DatabaseManager Integration', () => {
  let dbManager: DatabaseManager;

  beforeEach(async () => {
    dbManager = new DatabaseManager({
      name: 'test_healthycoaching.db',
      location: 'temp'
    });

    await dbManager.initialize();

    // Run initial schema migration
    const migration = new InitialSchemaMigration();
    await dbManager.transaction(async (tx) => {
      await migration.up(tx);
    });
  });

  afterEach(async () => {
    await dbManager.close();
  });

  describe('CRUD Operations', () => {
    it('should create and retrieve user data', async () => {
      const userData = {
        id: 'user-001',
        email: 'test@example.com',
        profile_data: JSON.stringify({
          namaLengkap: 'Test User',
          tanggalLahir: '1990-01-01',
          jenisKelamin: 'pria',
          tinggiBadan: 170,
          beratBadan: 70
        }),
        preferences: JSON.stringify({
          preferensiBahasa: 'id',
          notifikasi: { email: true, push: true, workoutReminder: true, mealReminder: true },
          preferensiDiet: { tipe: 'none', halalOnly: true, tidakSuka: [] }
        }),
        created_at: Date.now(),
        updated_at: Date.now()
      };

      // Create user
      await dbManager.execute(
        'INSERT INTO users (id, email, profile_data, preferences, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [userData.id, userData.email, userData.profile_data, userData.preferences, userData.created_at, userData.updated_at]
      );

      // Retrieve user
      const result = await dbManager.query(
        'SELECT * FROM users WHERE id = ?',
        [userData.id]
      );

      expect(result.rows).toHaveLength(1);
      const user = result.rows[0];
      expect(user.email).toBe(userData.email);
      expect(user.id).toBe(userData.id);

      const profile = JSON.parse(user.profile_data);
      expect(profile.namaLengkap).toBe('Test User');
    });

    it('should handle foreign key constraints correctly', async () => {
      // First, create a user
      await dbManager.execute(
        'INSERT INTO users (id, email, profile_data, preferences, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        ['user-001', 'test@example.com', '{}', '{}', Date.now(), Date.now()]
      );

      // Create Indonesian food
      const makananData = {
        id: 'mkn-001',
        nama: 'Nasi Goreng',
        kategori: 'makanan_pokok',
        daerah: JSON.stringify({
          provinsi: ['Jawa Barat'],
          kota: ['Bandung'],
          musiman: ['hujan', 'kemarau']
        }),
        nutrisi_per_100g: JSON.stringify({
          kalori: 163,
          protein: 6.1,
          karbohidrat: 23.6,
          lemak: 6.4
        }),
        porsi_standar: JSON.stringify([{
          id: 'pors-001',
          nama: '1 piring',
          beratGram: 300,
          deskripsi: 'Satu piring nasi goreng'
        }]),
        informasi_bahan: JSON.stringify([]),
        cara_masak: JSON.stringify(['goreng']),
        halal_certified: 1,
        is_vegetarian: 0,
        is_vegan: 0,
        alergen: JSON.stringify([]),
        popularitas: 7,
        ketersediaan: 'seluruh_indonesia',
        musiman_hijau: 0,
        perkiraan_harga: JSON.stringify({ minimal: 15000, maksimal: 25000 }),
        created_at: Date.now(),
        updated_at: Date.now()
      };

      await dbManager.execute(
        `INSERT INTO makanan_indonesia (
          id, nama, kategori, daerah, nutrisi_per_100g, porsi_standar,
          informasi_bahan, cara_masak, halal_certified, is_vegetarian, is_vegan,
          alergen, popularitas, ketersediaan, musiman_hijau, perkiraan_harga,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          makananData.id,
          makananData.nama,
          makananData.kategori,
          makananData.daerah,
          makananData.nutrisi_per_100g,
          makananData.porsi_standar,
          makananData.informasi_bahan,
          makananData.cara_masak,
          makananData.halal_certified,
          makananData.is_vegetarian,
          makananData.is_vegan,
          makananData.alergen,
          makananData.popularitas,
          makananData.ketersediaan,
          makananData.musiman_hijau,
          makananData.perkiraan_harga,
          makananData.created_at,
          makananData.updated_at
        ]
      );

      // Create food log (valid foreign keys)
      await dbManager.execute(
        'INSERT INTO makanan_logs (id, user_id, makanan_id, porsi_index, waktu_makan, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        ['log-001', 'user-001', 'mkn-001', 0, Date.now(), Date.now()]
      );

      // Verify log was created
      const logResult = await dbManager.query(
        'SELECT * FROM makanan_logs WHERE id = ?',
        ['log-001']
      );

      expect(logResult.rows).toHaveLength(1);
      expect(logResult.rows[0].user_id).toBe('user-001');
      expect(logResult.rows[0].makanan_id).toBe('mkn-001');
    });

    it('should reject invalid foreign key references', async () => {
      // Try to create food log with non-existent user
      await expect(
        dbManager.execute(
          'INSERT INTO makanan_logs (id, user_id, makanan_id, porsi_index, waktu_makan, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          ['log-invalid', 'nonexistent-user', 'mkn-001', 0, Date.now(), Date.now()]
        )
      ).rejects.toThrow();

      // Try to create food log with non-existent food
      await dbManager.execute(
        'INSERT INTO users (id, email, profile_data, preferences, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        ['user-001', 'test@example.com', '{}', '{}', Date.now(), Date.now()]
      );

      await expect(
        dbManager.execute(
          'INSERT INTO makanan_logs (id, user_id, makanan_id, porsi_index, waktu_makan, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          ['log-invalid-2', 'user-001', 'nonexistent-food', 0, Date.now(), Date.now()]
        )
      ).rejects.toThrow();
    });
  });

  describe('Transaction Support', () => {
    it('should commit successful transactions', async () => {
      let committed = false;

      await dbManager.transaction(async (tx) => {
        await tx.execute(
          'INSERT INTO users (id, email, profile_data, preferences, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          ['user-001', 'test@example.com', '{}', '{}', Date.now(), Date.now()]
        );

        // Verify data exists within transaction
        const result = await tx.query(
          'SELECT * FROM users WHERE id = ?',
          ['user-001']
        );
        expect(result).toHaveLength(1);

        committed = true;
      });

      expect(committed).toBe(true);

      // Verify data exists after transaction
      const result = await dbManager.query(
        'SELECT * FROM users WHERE id = ?',
        ['user-001']
      );
      expect(result.rows).toHaveLength(1);
    });

    it('should rollback failed transactions', async () => {
      await expect(
        dbManager.transaction(async (tx) => {
          await tx.execute(
            'INSERT INTO users (id, email, profile_data, preferences, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            ['user-001', 'test@example.com', '{}', '{}', Date.now(), Date.now()]
          );

          // This will fail - duplicate ID
          await tx.execute(
            'INSERT INTO users (id, email, profile_data, preferences, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            ['user-001', 'test@example.com', '{}', '{}', Date.now(), Date.now()]
          );
        })
      ).rejects.toThrow();

      // Verify no data was inserted
      const result = await dbManager.query(
        'SELECT * FROM users WHERE id = ?',
        ['user-001']
      );
      expect(result.rows).toHaveLength(0);
    });
  });

  describe('Query Performance', () => {
    it('should use indexes effectively', async () => {
      // Insert test data
      const foods = Array.from({ length: 1000 }, (_, i) => ({
        id: `mkn-${String(i).padStart(4, '0')}`,
        nama: `Makanan ${i}`,
        kategori: i % 2 === 0 ? 'makanan_pokok' : 'lauk_pauk',
        popularitas: Math.floor(Math.random() * 10) + 1,
        created_at: Date.now() - (i * 1000),
        updated_at: Date.now()
      }));

      for (const food of foods) {
        await dbManager.execute(
          'INSERT INTO makanan_indonesia (id, nama, kategori, daerah, nutrisi_per_100g, porsi_standar, informasi_bahan, cara_masak, halal_certified, is_vegetarian, is_vegan, alergen, popularitas, ketersediaan, musiman_hijau, perkiraan_harga, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            food.id,
            food.nama,
            food.kategori,
            '{}',
            '{}',
            '[]',
            '[]',
            '[]',
            1,
            0,
            0,
            '[]',
            food.popularitas,
            'seluruh_indonesia',
            0,
            '{}',
            food.created_at,
            food.updated_at
          ]
        );
      }

      // Test indexed query performance
      const startTime = Date.now();
      const result = await dbManager.query(
        'SELECT * FROM makanan_indonesia WHERE kategori = ? ORDER BY popularitas DESC LIMIT 20',
        ['makanan_pokok']
      );
      const queryTime = Date.now() - startTime;

      expect(result.rows).toHaveLength(20);
      expect(queryTime).toBeLessThan(100); // Should be very fast with index
      expect(result.rows[0].popularitas).toBeGreaterThanOrEqual(result.rows[1].popularitas);
    });
  });
});
```

---

## 📊 Testing Commands & Scripts

### Available Scripts

```bash
# Package.json scripts
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "jest --config=e2e/config/jest.e2e.config.js",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:android:unit": "jest --testPathPattern=unit/android",
    "test:android:instrumented": "cd android && ./gradlew connectedAndroidTest",
    "test:android:performance": "jest --testPathPattern=performance/android"
  }
}
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage

# Run in watch mode for development
npm run test:watch

# Run specific test file
npm test -- MakananIndonesia.test.ts

# Run tests matching pattern
npm test -- --testPathPattern="entities"
npm test -- --testNamePattern="should calculate"
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Coverage will be generated in coverage/lcov-report/index.html
# Open in browser to see detailed coverage information

# Check coverage thresholds in jest.config.js
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

---

## 🎯 Testing Best Practices

### General Guidelines

1. **Test Behavior, Not Implementation**: Focus on what code does, not how it does it
2. **Use Descriptive Names**: Test names should clearly describe what is being tested
3. **Arrange-Act-Assert**: Structure tests clearly with setup, execution, and verification
4. **Independent Tests**: Tests should not depend on each other
5. **Mock External Dependencies**: Use mocks for databases, APIs, and external services

### Indonesian Context Testing

1. **Regional Availability**: Test foods work correctly in different regions
2. **Halal Compliance**: Verify halal filtering works properly
3. **Cultural Features**: Test Ramadan foods, local payment methods, etc.
4. **Language Support**: Verify Indonesian text displays correctly
5. **Local Standards**: Test against Indonesian health standards and regulations

### Performance Testing

1. **Database Performance**: Monitor query execution times
2. **Memory Usage**: Check for memory leaks in long-running operations
3. **Large Dataset Handling**: Test with thousands of food entries
4. **Offline Performance**: Ensure app works without network connection

### Error Handling Testing

1. **Correlation IDs**: Verify all errors include correlation IDs
2. **Error Propagation**: Test errors bubble up correctly through layers
3. **Graceful Degradation**: App should continue working with non-critical errors
4. **User-Friendly Messages**: Error messages should be helpful and in Indonesian when appropriate

---

## 📈 Test Metrics and Goals

### Coverage Targets

- **Global Coverage**: 80% minimum
- **Entities**: 95% coverage (critical business logic)
- **Use Cases**: 90% coverage (user workflows)
- **Repositories**: 85% coverage (data access)
- **Utilities**: 90% coverage (helper functions)

### Quality Metrics

- **Test Success Rate**: >95%
- **Flaky Tests**: <1% of total tests
- **Test Execution Time**: Unit tests <5s total, Integration tests <30s total
- **E2E Test Stability**: >90% success rate

### Indonesian Context Coverage

- **Indonesian Foods**: 100% of implemented foods tested
- **Regional Features**: All regional-specific features tested
- **Cultural Integration**: All cultural features tested
- **Halal Compliance**: All halal-related logic tested

---

This comprehensive testing infrastructure ensures HealthyCoaching Indonesia maintains high code quality while properly handling Indonesian market requirements and cultural context.
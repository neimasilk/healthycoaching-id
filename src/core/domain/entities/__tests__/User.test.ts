/**
 * Unit Test: User Entity
 * Location: src/core/domain/entities/__tests__/
 * Purpose: Test User entity business logic and validation
 */

import { User, UserProfile, UserPreferences, AktivitasFisikLevel } from '../User';

describe('User Entity', () => {
  describe('Constructor', () => {
    it('should create user with valid data', () => {
      // Arrange
      const userProfile: UserProfile = {
        id: 'profile-123',
        userId: 'user-123',
        namaLengkap: 'John Doe',
        namaPanggilan: 'John',
        email: 'john.doe@example.com',
        noTelepon: '+62812345678',
        tanggalLahir: new Date('1990-01-15'),
        jenisKelamin: 'pria',
        tinggiBadan: 170,
        beratBadan: 70,
        aktivitasFisik: {
          level: 'cukup' as AktivitasFisikLevel,
          targetMenitPerMinggu: 150
        },
        golKesehatan: [],
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
            tidakSuka: ['sambal', 'pedas']
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
            jarak: 'km' as const,
            unit: 'km' as const
          }
        },
        alergi: ['seafood', 'kacang'],
        kondisiKesehatan: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Act
      const user = new User(
        'user-123',
        'john.doe@example.com',
        userProfile,
        new Date('2023-01-01'),
        new Date('2023-01-01')
      );

      // Assert
      expect(user.id).toBe('user-123');
      expect(user.email).toBe('john.doe@example.com');
      expect(user.profile.namaLengkap).toBe('John Doe');
      expect(user.createdAt).toEqual(new Date('2023-01-01'));
      expect(user.updatedAt).toEqual(new Date('2023-01-01'));
    });

    it('should auto-update updatedAt if not provided', () => {
      // Arrange
      const userProfile = createMockUserProfile();
      const beforeUpdate = new Date();
      sleep(10); // Small delay
      const afterUpdate = new Date();

      // Act
      const user = new User('user-123', 'test@example.com', userProfile, beforeUpdate);

      // Assert
      expect(user.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
      expect(user.updatedAt.getTime()).toBeLessThanOrEqualTo(afterUpdate.getTime());
    });
  });

  describe('getUmur', () => {
    it('should calculate correct age', () => {
      // Arrange
      const userProfile = createMockUserProfile();
      userProfile.tanggalLahir = new Date('1990-01-15'); // 34 years old as of 2024
      const user = new User('user-123', 'test@example.com', userProfile);

      // Act
      const age = user.getUmur();

      // Assert
      expect(age).toBe(34);
    });

    it('should handle leap year correctly', () => {
      // Arrange
      const userProfile = createMockUserProfile();
      userProfile.tanggalLahir = new Date('2000-02-29'); // Leap year
      const user = new User('user-123', 'test@example.com', userProfile);

      // Act
      const today = new Date();
      today.setFullYear(2024, 2, 28); // Day before leap day
      const age = user.getUmur();

      // Assert
      expect(age).toBe(23); // Almost 24
    });

    it('should handle birthday today', () => {
      // Arrange
      const userProfile = createMockUserProfile();
      const today = new Date();
      userProfile.tanggalLahir = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
      const user = new User('user-123', 'test@example.com', userProfile);

      // Act
      const age = user.getUmur();

      // Assert
      expect(age).toBe(25);
    });
  });

  describe('getBMI', () => {
    it('should calculate BMI correctly', () => {
      // Arrange
      const userProfile = createMockUserProfile();
      userProfile.tinggiBadan = 170; // 1.7m
      userProfile.beratBadan = 65; // 65kg
      const user = new User('user-123', 'test@example.com', userProfile);

      // Act
      const bmi = user.getBMI();

      // Assert
      const expectedBMI = 65 / (1.7 * 1.7);
      expect(bmi).toBeCloseTo(expectedBMI, 2);
    });

    it('should handle edge cases', () => {
      // Arrange
      const userProfile = createMockUserProfile();
      userProfile.tinggiBadan = 0; // Invalid height
      userProfile.beratBadan = 70;
      const user = new User('user-123', 'test@example.com', userProfile);

      // Act & Assert
      expect(() => user.getBMI()).toThrow('Height must be greater than 0');
    });
  });

  describe('getBMICategory', () => {
    it('should return correct BMI category - kurus', () => {
      const user = createUserWithBMI(17);
      expect(user.getBMICategory()).toBe('kurus');
    });

    it('should return correct BMI category - normal', () => {
      const user = createUserWithBMI(21);
      expect(user.getBMICategory()).toBe('normal');
    });

    it('should return correct BMI category - kelebihan', () => {
      const user = createUserWithBMI(24);
      expect(user.getBMICategory()).toBe('kelebihan');
    });

    it('should return correct BMI category - obesitas_1', () => {
      const user = createUserWithBMI(27);
      expect(user.getBMICategory()).toBe('obesitas_1');
    });

    it('should return correct BMI category - obesitas_2', () => {
      const user = createUserWithBMI(32);
      expect(user.getBMICategory()).toBe('obesitas_2');
    });
  });

  describe('hasTargetBerat', () => {
    it('should return true when target weight is set', () => {
      const userProfile = createMockUserProfile();
      userProfile.targetBerat = 65;
      const user = new User('user-123', 'test@example.com', userProfile);

      expect(user.hasTargetBerat()).toBe(true);
    });

    it('should return false when target weight is not set', () => {
      const userProfile = createMockUserProfile();
      userProfile.targetBerat = undefined;
      const user = new User('user-123', 'test@example.com', userProfile);

      expect(user.hasTargetBerat()).toBe(false);
    });
  });

  describe('Indonesian Context Methods', () => {
    it('should check if user needs halal food', () => {
      const userProfile = createMockUserProfile();
      userProfile.preferensi.preferensiDiet.halalOnly = true;
      const user = new User('user-123', 'test@example.com', userProfile);

      expect(user.needsHalalFood()).toBe(true);
    });

    it('should return alergen list', () => {
      const userProfile = createMockUserProfile();
      userProfile.alergi = ['udang', 'kacang', 'susu'];
      const user = new User('user-123', 'test@example.com', userProfile);

      expect(user.getAlergenList()).toEqual(['udang', 'kacang', 'susu']);
    });

    it('should check puasa preference', () => {
      const userProfile = createMockUserProfile();
      userProfile.preferensi.preferensiDiet.tipe = 'vegetarian';
      const user = new User('user-123', 'test@example.com', userProfile);

      expect(user.isPuasa()).toBe(false); // Vegetarian assumed not fasting
    });
  });

  describe('validateProfile', () => {
    it('should return validation errors for invalid data', () => {
      const invalidProfile: Partial<UserProfile> = {
        id: 'profile-123',
        userId: 'user-123',
        namaLengkap: '', // Invalid: empty
        email: 'invalid-email', // Invalid: not email format
        tanggalLahir: new Date(),
        jenisKelamin: 'pria',
        tinggiBadan: 50, // Invalid: too short
        beratBadan: 20, // Invalid: too light
        aktivitasFisik: { level: 'cukup', targetMenitPerMinggu: 150 },
        golKesehatan: [],
        preferensi: {
          preferensiBahasa: 'id',
          notifikasi: {
            email: true,
            push: true,
            workoutReminder: true,
            mealReminder: true
          },
          preferensiDiet: { tipe: 'none', halalOnly: true, tidakSuka: [] },
          preferensiPembayaran: { defaultMethod: 'gopay', tersimpan: { gopay: true, ovo: false, dana: false } },
          preferensiUnit: { berat: 'kg', tinggi: 'cm', suhu: 'celsius', jarak: 'km', unit: 'km' }
        },
        alergi: [],
        kondisiKesehatan: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Act
      const user = new User('user-123', 'invalid-email@example.com', invalidProfile);

      // Assert
      const validation = user.validateProfile();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Email tidak valid');
      expect(validation.errors).toContain('Tinggi badan harus antara 100-250 cm');
      expect(validation.errors).toContain('Berat badan harus antara 30-300 kg');
      expect(validation.errors).toContain('Nama lengkap harus diisi minimal 2 karakter');
    });

    it('should return valid for correct data', () => {
      const validProfile = createMockUserProfile();
      const user = new User('user-123', 'valid@example.com', validProfile);

      // Act
      const validation = user.validateProfile();

      // Assert
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should validate email format correctly', () => {
      const userProfile = createMockUserProfile();
      userProfile.email = 'user@domain.com'; // Valid
      const user = new User('user-123', userProfile.email, userProfile);

      // Act
      const validation = user.validateProfile();

      // Assert
      expect(validation.isValid).toBe(true);

      // Test private method
      expect(user['validateEmail']('invalid-email')).toBe(false);
      expect(user['validateEmail']('user@domain.com')).toBe(true);
    });
  });
});

// Helper functions
function createMockUserProfile(): UserProfile {
  return {
    id: 'profile-123',
    userId: 'user-123',
    namaLengkap: 'Test User',
    namaPanggilan: 'Test',
    email: 'test@example.com',
    noTelepon: '+62812345678',
    tanggalLahir: new Date('1990-01-15'),
    jenisKelamin: 'pria',
    tinggiBadan: 170,
    beratBadan: 70,
    aktivitasFisik: {
      level: 'cukup' as AktivitasFisikLevel,
      targetMenitPerMinggu: 150
    },
    golKesehatan: [],
    preferensi: {
      preferensiBahasa: 'id',
      notifikasi: {
        email: true,
        push: true,
        workoutReminder: true,
        mealReminder: true
      },
      preferensiDiet: {
        tipe: 'none',
        halalOnly: true,
        tidakSuka: []
      },
      preferensiPembayaran: {
        defaultMethod: 'gopay',
        tersimpan: {
          gopay: true,
          ovo: false,
          dana: false
        }
      },
      preferensiUnit: {
        berat: 'kg',
        tinggi: 'cm',
        suhu: 'celsius',
        jarak: 'km',
        unit: 'km'
      }
    },
    alergi: ['seafood', 'kacang'],
    kondisiKesehatan: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

function createUserWithBMI(bmi: number): User {
  const userProfile = createMockUserProfile();
  // BMI = weight (kg) / (height in m)^2
  // Using height 1.7m, weight = BMI * (1.7)^2
  const weight = bmi * (1.7 * 1.7);
  userProfile.beratBadan = Math.round(weight);
  return new User('user-123', 'test@example.com', userProfile);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
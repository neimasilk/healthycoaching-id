/**
 * Test Setup Configuration
 * Global Jest setup for React Native testing
 * Location: tests/setup.ts
 */

try {
  require('react-native-gesture-handler/jestSetup');
} catch (error) {
  // Gesture handler setup is optional in tests; ignore when module is absent.
}

// Mock react-native modules
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-sqlite-storage
jest.mock('react-native-sqlite-storage', () => ({
  openDatabase: jest.fn(),
  DEBUG: jest.fn(),
  enablePromise: jest.fn(),
}));

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  check: jest.fn(),
  request: jest.fn(),
  openSettings: jest.fn(),
  PERMISSIONS: {
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
      WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
    },
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTOS: 'ios.permission.PHOTOS',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
  },
}));

// Mock react-native-firebase
jest.mock(
  '@react-native-firebase/app',
  () => ({
    firebase: {
      apps: [],
    },
  }),
  { virtual: true }
);

jest.mock(
  '@react-native-firebase/analytics',
  () => ({
    default: () => ({
      logEvent: jest.fn(),
      logScreenView: jest.fn(),
      setUserId: jest.fn(),
      setUserProperty: jest.fn(),
    }),
  }),
  { virtual: true }
);

jest.mock(
  '@react-native-firebase/crashlytics',
  () => ({
    default: () => ({
      recordError: jest.fn(),
      setUserId: jest.fn(),
      log: jest.fn(),
      setAttribute: jest.fn(),
    }),
  }),
  { virtual: true }
);

jest.mock(
  '@react-native-firebase/performance',
  () => ({
    default: () => ({
      newTrace: jest.fn(() => ({
        start: jest.fn(),
        stop: jest.fn(),
        putMetric: jest.fn(),
      })),
      newHttpMetric: jest.fn(() => ({
        setHttpResponseCode: jest.fn(),
        setRequestPayloadSize: jest.fn(),
        setResponsePayloadSize: jest.fn(),
        setAttribute: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      })),
    }),
  }),
  { virtual: true }
);

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');
jest.mock('react-native-vector-icons/Feather', () => 'Icon');

// Mock react-native-fast-image
jest.mock('react-native-fast-image', () => 'FastImage');

// Mock react-native-device-info
jest.mock('react-native-device-info', () => ({
  getVersion: jest.fn(() => '1.0.0'),
  getBuildNumber: jest.fn(() => '1'),
  getSystemName: jest.fn(() => 'Android'),
  getSystemVersion: jest.fn(() => '11'),
  getModel: jest.fn(() => 'Pixel 6'),
  isEmulator: jest.fn().mockResolvedValue(false),
  getUniqueId: jest.fn().mockResolvedValue('test-device-id'),
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

const mockDate = new Date('2023-10-24T12:00:00.000Z');
const originalWarn = console.warn;

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(mockDate);
  // Mock performance.now for timing tests
  global.performance = {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(),
    getEntriesByType: jest.fn(),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
  } as any;
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') ||
        args[0].includes('componentWillUpdate') ||
        args[0].includes('VirtualizedList'))
    ) {
      return;
    }
    originalWarn(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  jest.useRealTimers();
});

// Global test utilities
export const mockAsyncStorage = () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
});

(global as any).generateCorrelationId = () => 'HC-20231024120000-12345678';

export const mockDatabase = () => ({
  executeSql: jest.fn(),
  transaction: jest.fn(),
  close: jest.fn(),
});

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-123',
  email: 'test@example.com',
  profile: {
    id: 'profile-123',
    userId: 'test-user-123',
    namaLengkap: 'Test User',
    namaPanggilan: 'Test',
    email: 'test@example.com',
    noTelepon: '+62812345678',
    tanggalLahir: new Date('1990-01-15'),
    jenisKelamin: 'pria' as const,
    tinggiBadan: 170,
    beratBadan: 70,
    aktivitasFisik: {
      level: 'cukup' as const,
      targetMenitPerMinggu: 150,
    },
    golKesehatan: [],
    preferensi: {
      preferensiBahasa: 'id' as const,
      notifikasi: {
        email: true,
        push: true,
        workoutReminder: true,
        mealReminder: true,
      },
      preferensiDiet: {
        tipe: 'none' as const,
        halalOnly: true,
        tidakSuka: [],
      },
      preferensiPembayaran: {
        defaultMethod: 'gopay' as const,
        tersimpan: {
          gopay: true,
          ovo: false,
          dana: false,
        },
      },
      preferensiUnit: {
        berat: 'kg' as const,
        tinggi: 'cm' as const,
        suhu: 'celsius' as const,
        jarak: 'km' as const,
        unit: 'km' as const,
      },
    },
    alergi: ['seafood', 'kacang'],
    kondisiKesehatan: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockFood = (overrides = {}) => ({
  id: 'mk-test-001',
  nama: 'Test Food',
  namaLain: ['Alternative Name'],
  kategori: 'makanan_pokok' as const,
  asal: ['Jawa'],
  daerah: {
    provinsi: ['Jawa'],
    kota: ['Jakarta'],
    musiman: ['hijau', 'kemarau'] as const,
  },
  nutrisiPer100g: {
    kalori: 200,
    protein: 10,
    karbohidrat: 30,
    lemak: 5,
    serat: 2,
    garam: 200,
    gula: 5,
    vitaminA: 100,
    vitaminC: 20,
    kalsium: 30,
    zatBesi: 2,
    folat: 10,
  },
  porsiStandar: [
    {
      id: '100g',
      nama: '100 gram',
      beratGram: 100,
      deskripsi: '100 gram portion',
    },
  ],
  gambar: ['https://example.com/image.jpg'],
  informasiBahan: [
    { nama: 'Rice', persentase: 100, kategori: 'karbohidrat' },
  ],
  caraMasak: ['rebus' as const],
  halalCertified: true,
  isVegetarian: true,
  isVegan: true,
  alergen: [],
  popularitas: 5,
  ketersediaan: 'seluruh_indonesia' as const,
  musimanHijau: false,
  perkiraanHarga: {
    minimal: 10000,
    maksimal: 20000,
    mataUang: 15000,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

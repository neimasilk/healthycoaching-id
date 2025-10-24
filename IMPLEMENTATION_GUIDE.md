# Implementation Guide - HealthyCoaching Indonesia

## 🚀 Getting Started

### 1. **Project Setup**

```bash
# Initialize React Native/Flutter project
npx react-native init HealthyCoachingID --template react-native-template-typescript
# atau
flutter create healthy_coaching_id --org com.healthycoaching

# Navigate to project
cd healthy_coaching_id

# Install core dependencies
npm install @reduxjs/toolkit react-redux
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage
npm install react-native-sqlite-storage
npm install axios
npm install react-hook-form
npm install react-native-svg
npm install react-native-chart-kit
npm install react-native-vector-icons
npm install date-fns
npm install uuid
```

### 2. **Folder Structure Setup**

```bash
# Create the modular structure
mkdir -p src/{core,domain,data,presentation,network}/{entities,repositories,usecases,services,api,dto,components,screens}
mkdir -p src/features/{auth,nutrition,workout,profile,recommendations}/{presentation,domain}
mkdir -p src/shared/{constants,types,utils,extensions,errors}
mkdir -p tests/{unit,integration,e2e}
```

### 3. **Configuration Files**

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "src",
    "paths": {
      "@core/*": ["core/*"],
      "@features/*": ["features/*"],
      "@shared/*": ["shared/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "android", "ios"]
}
```

### 4. **Core Entity Implementation**

#### src/core/domain/entities/MakananIndonesia.ts
```typescript
export enum KategoriMakanan {
  MAKANAN_POKOK = 'makanan_pokok',
  LAUK_PAUK = 'lauk_pauk',
  SAYURAN = 'sayuran',
  BUAH = 'buah',
  JAJANAN = 'jajanan',
  MINUMAN = 'minuman',
  KUE = 'kue',
  SAMBAL = 'sambal'
}

export enum CaraMasak {
  GORENG = 'goreng',
  REBUS = 'rebus',
  KUKUS = 'kukus',
  BAKAR = 'bakar',
  TIM = 'tim',
  SAUTE = 'saute'
}

export interface Nutrisi {
  kalori: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  serat: number;
  garam: number;    // mg
  gula: number;     // gram
  vitaminA: number;  // IU
  vitaminC: number;  // mg
  kalsium: number;  // mg
  zatBesi: number;  // mg
}

export interface Porsi {
  nama: string;      // "1 piring", "1 mangkok", "100 gram"
  beratGram: number;
  deskripsi: string;
}

export interface BahanUtama {
  nama: string;
  persentase: number; // percentage of total ingredients
}

export class MakananIndonesia {
  constructor(
    public readonly id: string,
    public nama: string,
    public namaLain: string[],
    public kategori: KategoriMakanan,
    public asal: string[],           // ["Jawa", "Sumatera", "Bali"]
    public nutrisiPer100g: Nutrisi,
    public porsiStandar: Porsi[],
    public bahanUtama: BahanUtama[],
    public caraMasak: CaraMasak[],
    public gambar: string[],
    public halalCertified: boolean,
    public isVegetarian: boolean,
    public isVegan: boolean,
    public alergen: string[],        // ["udang", "kacang", "susu"]
    public popularitas: number,      // 1-10 rating
    public ketersediaan: string[],   // ["Jakarta", "Surabaya", "Bandung"]
    public musim: string[],          // ["hujan", "kemarau"]
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  // Business logic methods
  getNutrisiForPorsi(porsiIndex: number): Nutrisi {
    const porsi = this.porsiStandar[porsiIndex];
    const factor = porsi.beratGram / 100;

    return {
      kalori: Math.round(this.nutrisiPer100g.kalori * factor),
      protein: Math.round(this.nutrisiPer100g.protein * factor * 10) / 10,
      karbohidrat: Math.round(this.nutrisiPer100g.karbohidrat * factor * 10) / 10,
      lemak: Math.round(this.nutrisiPer100g.lemak * factor * 10) / 10,
      serat: Math.round(this.nutrisiPer100g.serat * factor * 10) / 10,
      garam: Math.round(this.nutrisiPer100g.garam * factor),
      gula: Math.round(this.nutrisiPer100g.gula * factor * 10) / 10,
      vitaminA: Math.round(this.nutrisiPer100g.vitaminA * factor),
      vitaminC: Math.round(this.nutrisiPer100g.vitaminC * factor * 10) / 10,
      kalsium: Math.round(this.nutrisiPer100g.kalsium * factor),
      zatBesi: Math.round(this.nutrisiPer100g.zatBesi * factor * 10) / 10
    };
  }

  isHealthyForUser(userAlergies: string[], userDiet: string): boolean {
    // Check allergies
    const hasAllergy = this.alergen.some(alergen =>
      userAlergies.includes(alergen)
    );
    if (hasAllergy) return false;

    // Check dietary restrictions
    switch (userDiet) {
      case 'vegetarian':
        return this.isVegetarian;
      case 'vegan':
        return this.isVegan;
      default:
        return true;
    }
  }

  isAvailableInLocation(location: string): boolean {
    return this.ketersediaan.includes(location) ||
           this.ketersediaan.includes('Seluruh Indonesia');
  }
}
```

### 5. **Repository Implementation**

#### src/core/domain/repositories/IMakananRepository.ts
```typescript
import { MakananIndonesia, KategoriMakanan } from '../entities/MakananIndonesia';

export interface SearchMakananRequest {
  keyword: string;
  kategori?: KategoriMakanan;
  lokasi?: string;
  halalOnly?: boolean;
  vegetarianOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchMakananResponse {
  makanan: MakananIndonesia[];
  total: number;
  hasMore: boolean;
}

export interface IMakananRepository {
  // Search methods
  searchByNama(request: SearchMakananRequest): Promise<SearchMakananResponse>;
  getByKategori(kategori: KategoriMakanan, limit?: number): Promise<MakananIndonesia[]>;
  getByAsal(daerah: string, limit?: number): Promise<MakananIndonesia[]>;

  // Detail methods
  getDetail(id: string): Promise<MakananIndonesia>;
  getPopularMakanan(limit?: number): Promise<MakananIndonesia[]>;

  // Recommendation methods
  getRekomendasiUntukDiet(tipeDiet: string, limit?: number): Promise<MakananIndonesia[]>;
  getMakananMusim(musim: string, limit?: number): Promise<MakananIndonesia[]>;

  // Cache methods
  saveMakanan(makanan: MakananIndonesia): Promise<void>;
  clearCache(): Promise<void>;
  syncWithServer(): Promise<void>;
}
```

#### src/core/data/repositories/MakananRepositoryImpl.ts
```typescript
export class MakananRepositoryImpl implements IMakananRepository {
  constructor(
    private localDb: AppDatabase,
    private apiService: MakananApiService,
    private cacheManager: CacheManager,
    private networkStatus: NetworkStatus,
    private logger: ILogger
  ) {}

  async searchByNama(request: SearchMakananRequest): Promise<SearchMakananResponse> {
    try {
      // Validate request
      this.validateSearchRequest(request);

      // Try cache first
      const cacheKey = this.generateCacheKey('search', request);
      const cached = await this.cacheManager.get<SearchMakananResponse>(cacheKey);

      if (cached && !this.cacheManager.isExpired(cacheKey)) {
        this.logger.info('Cache hit for makanan search', { keyword: request.keyword });
        return cached;
      }

      // Try local database
      let localResults = await this.localDb.searchMakanan(request);

      // If online and need fresh data, try API
      if (await this.networkStatus.isOnline()) {
        try {
          const apiResults = await this.apiService.searchMakanan(request);

          // Merge and deduplicate results
          const mergedResults = this.mergeResults(localResults, apiResults.makanan);

          // Update local database
          await this.updateLocalDatabase(apiResults.makanan);

          // Update cache
          const response = {
            makanan: mergedResults,
            total: apiResults.total,
            hasMore: apiResults.hasMore
          };

          await this.cacheManager.set(cacheKey, response, 3600); // 1 hour cache

          return response;

        } catch (apiError) {
          this.logger.warn('API search failed, using local results', {
            error: apiError,
            keyword: request.keyword
          });
        }
      }

      // Return local results if API fails or offline
      return {
        makanan: localResults,
        total: localResults.length,
        hasMore: false
      };

    } catch (error) {
      this.logger.error('Search makanan failed', { error, request });
      throw new MakananError(
        'Gagal mencari makanan',
        undefined,
        { originalError: error }
      );
    }
  }

  private validateSearchRequest(request: SearchMakananRequest): void {
    if (!request.keyword || request.keyword.trim().length < 2) {
      throw new ValidationError(
        'Keyword pencarian minimal 2 karakter',
        'keyword',
        request.keyword
      );
    }

    if (request.limit && (request.limit < 1 || request.limit > 100)) {
      throw new ValidationError(
        'Limit harus antara 1-100',
        'limit',
        request.limit
      );
    }
  }

  private generateCacheKey(operation: string, request: any): string {
    const hash = btoa(JSON.stringify(request)).replace(/[^a-zA-Z0-9]/g, '');
    return `makanan:${operation}:${hash}`;
  }

  private mergeResults(local: MakananIndonesia[], api: MakananIndonesia[]): MakananIndonesia[] {
    const merged = new Map<string, MakananIndonesia>();

    // Add local results first
    local.forEach(m => merged.set(m.id, m));

    // Override/add API results (more fresh)
    api.forEach(m => merged.set(m.id, m));

    return Array.from(merged.values());
  }

  private async updateLocalDatabase(makananList: MakananIndonesia[]): Promise<void> {
    const operations = makananList.map(m =>
      this.localDb.saveMakanan(m).catch(error =>
        this.logger.error('Failed to save makanan locally', { makananId: m.id, error })
      )
    );

    await Promise.allSettled(operations);
  }
}
```

### 6. **Use Case Implementation**

#### src/core/domain/usecases/nutrition/AnalyzeMakananHarian.ts
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
  nutrisiRataRata: {
    protein: number;
    karbohidrat: number;
    lemak: number;
    serat: number;
    garam: number;
    gula: number;
  };
  makananDimakan: MakananLog[];
  status: 'kurang' | 'pas' | 'lebih';
  rekomendasi?: {
    makanan: MakananIndonesia[];
    tips: string[];
    targetHariBesok: number;
  };
  alerts: Alert[];
}

export class AnalyzeMakananHarian {
  constructor(
    private userRepo: IUserRepository,
    private makananRepo: IMakananRepository,
    private nutrisiAnalyzer: INutrisiAnalyzer,
    private alerter: IAlerter
  ) {}

  async execute(request: AnalyzeMakananHarianRequest): Promise<AnalyzeMakananHarianResponse> {
    const user = await this.userRepo.getById(request.userId);
    const makananHariIni = await this.getMakananHariIni(request.userId, request.tanggal);

    // Calculate total nutrition
    const totalNutrisi = await this.calculateTotalNutrisi(makananHariIni);
    const targetKalori = await this.nutrisiAnalyzer.getKaloriTarget(user);

    // Determine status
    const status = this.determineStatus(totalNutrisi.kalori, targetKalori);

    // Generate alerts
    const alerts = await this.generateAlerts(user, totalNutrisi, status);

    // Generate recommendations if requested
    let rekomendasi;
    if (request.includeRekomendasi) {
      rekomendasi = await this.generateRekomendasi(user, totalNutrisi, status);
    }

    return {
      tanggal: request.tanggal,
      totalKalori: totalNutrisi.kalori,
      targetKalori,
      persentaseTarget: Math.round((totalNutrisi.kalori / targetKalori) * 100),
      nutrisiRataRata: this.calculateRataRataNutrisi(totalNutrisi),
      makananDimakan: makananHariIni,
      status,
      rekomendasi,
      alerts
    };
  }

  private async getMakananHariIni(userId: string, tanggal: Date): Promise<MakananLog[]> {
    const startOfDay = new Date(tanggal);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(tanggal);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.makananRepo.getMakananLogByDateRange(
      userId,
      startOfDay,
      endOfDay
    );
  }

  private async calculateTotalNutrisi(makananLog: MakananLog[]): Promise<Nutrisi> {
    const totals = makananLog.reduce((acc, log) => {
      const nutrisiPorsi = log.makanan.getNutrisiForPorsi(log.porsiIndex);

      return {
        kalori: acc.kalori + nutrisiPorsi.kalori,
        protein: acc.protein + nutrisiPorsi.protein,
        karbohidrat: acc.karbohidrat + nutrisiPorsi.karbohidrat,
        lemak: acc.lemak + nutrisiPorsi.lemak,
        serat: acc.serat + nutrisiPorsi.serat,
        garam: acc.garam + nutrisiPorsi.garam,
        gula: acc.gula + nutrisiPorsi.gula,
        vitaminA: acc.vitaminA + nutrisiPorsi.vitaminA,
        vitaminC: acc.vitaminC + nutrisiPorsi.vitaminC,
        kalsium: acc.kalsium + nutrisiPorsi.kalsium,
        zatBesi: acc.zatBesi + nutrisiPorsi.zatBesi
      };
    }, this.getEmptyNutrisi());

    return totals;
  }

  private determineStatus(totalKalori: number, targetKalori: number): 'kurang' | 'pas' | 'lebih' {
    const persentase = (totalKalori / targetKalori) * 100;

    if (persentase < 80) return 'kurang';
    if (persentase <= 120) return 'pas';
    return 'lebih';
  }

  private async generateAlerts(user: User, nutrisi: Nutrisi, status: string): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // Salt alert (important for Indonesian diet)
    if (nutrisi.garam > 5000) { // WHO recommendation max 5g/day
      alerts.push(await this.alerter.createAlert(
        'GARAM_TERLALU_BANYAK',
        'Asupan garam Anda melebihi batas harian yang direkomendasikan',
        'warning'
      ));
    }

    // Sugar alert (important for diabetes prevention)
    if (nutrisi.gula > 50) { // WHO recommendation max 50g/day
      alerts.push(await this.alerter.createAlert(
        'GULA_TERLALU_BANYAK',
        'Asupan gula Anda melebihi batas harian yang direkomendasikan',
        'warning'
      ));
    }

    // Fiber alert
    if (nutrisi.serat < 25) {
      alerts.push(await this.alerter.createAlert(
        'SERAT_KURANG',
        'Asupan serat Anda kurang dari yang direkomendasikan',
        'info'
      ));
    }

    // Status-based alerts
    if (status === 'kurang') {
      alerts.push(await this.alerter.createAlert(
        'KALORI_KURANG',
        'Asupan kalori Anda kurang dari target harian',
        'warning'
      ));
    } else if (status === 'lebih') {
      alerts.push(await this.alerter.createAlert(
        'KALORI_LEBIH',
        'Asupan kalori Anda melebihi target harian',
        'warning'
      ));
    }

    return alerts;
  }

  private async generateRekomendasi(
    user: User,
    nutrisi: Nutrisi,
    status: string
  ): Promise<AnalyzeMakananHarianResponse['rekomendasi']> {
    let rekomendasiMakanan: MakananIndonesia[] = [];
    let tips: string[] = [];

    switch (status) {
      case 'kurang':
        rekomendasiMakanan = await this.makananRepo.getMakananTinggiKalori(user.preferences.lokasi);
        tips.push('Tambahkan porsi makanan secara bertahap');
        tips.push('Pilih makanan padat nutrisi seperti kacang-kacangan');
        break;

      case 'lebih':
        rekomendasiMakanan = await this.makananRepo.getMakananRendahKalori(user.preferences.lokasi);
        tips.push('Kurangi porsi makanan secara bertahap');
        tips.push('Pilih sayuran segar sebagai pengganti karbohidrat');
        break;

      default:
        tips.push('Lanjutkan pola makan sehat Anda');
        tips.push('Pastikan asupan air putih cukup');
    }

    // Specific recommendations based on nutrition deficiencies
    if (nutrisi.serat < 25) {
      const makananSeratTinggi = await this.makananRepo.getMakananTinggiSerat(user.preferences.lokasi);
      rekomendasiMakanan = [...rekomendasiMakanan, ...makananSeratTinggi];
      tips.push('Tambahkan sayuran dan buah untuk meningkatkan asupan serat');
    }

    return {
      makanan: rekomendasiMakanan,
      tips,
      targetHariBesok: await this.nutrisiAnalyzer.getKaloriTarget(user)
    };
  }
}
```

### 7. **Testing Setup**

#### tests/unit/core/domain/usecases/AnalyzeMakananHarian.test.ts
```typescript
describe('AnalyzeMakananHarian', () => {
  let useCase: AnalyzeMakananHarian;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockMakananRepo: jest.Mocked<IMakananRepository>;
  let mockNutrisiAnalyzer: jest.Mocked<INutrisiAnalyzer>;
  let mockAlerter: jest.Mocked<IAlerter>;

  beforeEach(() => {
    mockUserRepo = createMockUserRepository();
    mockMakananRepo = createMockMakananRepository();
    mockNutrisiAnalyzer = createMockNutrisiAnalyzer();
    mockAlerter = createMockAlerter();

    useCase = new AnalyzeMakananHarian(
      mockUserRepo,
      mockMakananRepo,
      mockNutrisiAnalyzer,
      mockAlerter
    );
  });

  it('should analyze daily nutrition correctly', async () => {
    // Arrange
    const userId = 'user-123';
    const tanggal = new Date('2024-01-15');
    const request: AnalyzeMakananHarianRequest = {
      userId,
      tanggal,
      includeRekomendasi: true
    };

    const mockUser = createMockUser();
    const mockMakananLog = createMockMakananLog();
    const mockTargetKalori = 2000;

    mockUserRepo.getById.mockResolvedValue(mockUser);
    mockMakananRepo.getMakananLogByDateRange.mockResolvedValue(mockMakananLog);
    mockNutrisiAnalyzer.getKaloriTarget.mockResolvedValue(mockTargetKalori);

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.tanggal).toEqual(tanggal);
    expect(result.targetKalori).toBe(mockTargetKalori);
    expect(result.status).toBe('pas');
    expect(result.rekomendasi).toBeDefined();
    expect(result.alerts).toHaveLength(0);
  });

  it('should generate alerts for high salt intake', async () => {
    // Test high salt scenario
    const request = createHighSaltRequest();
    const result = await useCase.execute(request);

    expect(result.alerts).toContainEqual(
      expect.objectContaining({
        code: 'GARAM_TERLALU_BANYAK',
        type: 'warning'
      })
    );
  });
});
```

## 🎯 Next Steps

1. **Implement Core Entities**: Complete all entity classes
2. **Setup Database**: Implement SQLite structure
3. **Build API Integration**: Connect to backend services
4. **Create UI Components**: Build feature screens
5. **Add Authentication**: Implement user auth flow
6. **Setup Monitoring**: Integrate error tracking
7. **Deploy**: Test and deploy to app stores

This foundation provides a robust, scalable architecture for your Indonesian health coaching app!
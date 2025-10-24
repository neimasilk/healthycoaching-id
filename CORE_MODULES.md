# Core Modules Design - HealthyCoaching Indonesia

## 🎯 Core Modules Overview

### 1. **Domain Layer (Business Logic)**

#### A. Entity Models
```typescript
// src/core/domain/entities/User.ts
export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public name: string,
    public profile: UserProfile,
    public goals: UserGoals[],
    public preferences: UserPreferences,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}

// src/core/domain/entities/MakananIndonesia.ts
export class MakananIndonesia {
  constructor(
    public readonly id: string,
    public nama: string,
    public namaLain: string[],      // Nasi uduk, Nasi kuning, dll
    public kategori: KategoriMakanan,
    public asal: string[],           // Jawa, Sumatera, Bali
    public nutrisiPer100g: Nutrisi,
    public porsiStandar: Porsi[],
    public gambar: string[],
    public bahanUtama: string[],
    public caraMasak: CaraMasak[],   // Goreng, Rebus, Kukus - FIXED TYPO
    public halalCertified: boolean,
    public isVegetarian: boolean,
    public alergen: string[]
  ) {}

// src/core/domain/entities/Nutrisi.ts
export class Nutrisi {
  constructor(
    public kalori: number,           // kcal
    public protein: number,           // gram
    public karbohidrat: number,       // gram
    public lemak: number,             // gram
    public serat: number,             // gram
    public garam: number,             // mg (penting untuk hipertensi)
    public gula: number,              // gram (penting untuk diabetes)
    public vitamin: VitaminInfo,
    public mineral: MineralInfo
  ) {}
}

// src/core/domain/entities/Workout.ts
export class Workout {
  constructor(
    public readonly id: string,
    public nama: string,              // "Senam Aerobik Indonesia"
    public deskripsi: string,
    public durasiMenit: number,
    public level: LevelKesulitan,     // Pemula, Menengah, Lanjutan
    public alat: AlatOlahraga[],      // Tidak perlu alat, Matras, Dumbbell
    public targetOtot: OtotTarget[],
    public kaloriTerbakar: number,
    public videoUrl?: string,
    public instruksi: LangkahInstruksi[],
    public adaptasiCuaca: AdaptasiCuaca // Indoor/Outdoor, Cuaca panas/hujan
  ) {}
}
```

#### B. Repository Interfaces
```typescript
// src/core/domain/repositories/IMakananRepository.ts
export interface IMakananRepository {
  searchByNama(keyword: string): Promise<MakananIndonesia[]>;
  getByKategori(kategori: KategoriMakanan): Promise<MakananIndonesia[]>;
  getByAsal(daerah: string): Promise<MakananIndonesia[]>;
  getDetail(id: string): Promise<MakananIndonesia>;
  getPopularMakanan(): Promise<MakananIndonesia[]>;
  getRekomendasiUntukDiet(tipeDiet: TipeDiet): Promise<MakananIndonesia[]>;
}

// src/core/domain/repositories/IWorkoutRepository.ts
export interface IWorkoutRepository {
  getWorkoutByGoal(goal: FitnessGoal): Promise<Workout[]>;
  getWorkoutByDuration(durasiMenit: number): Promise<Workout[]>;
  getWorkoutByAlat(alatTersedia: AlatOlahraga[]): Promise<Workout[]>;
  getWorkoutByLevel(level: LevelKesulitan): Promise<Workout[]>;
  getWorkoutIndoors(): Promise<Workout[]>;
}

// src/core/domain/repositories/INutrisiAnalyzer.ts
export interface INutrisiAnalyzer {
  analyzeDailyNutrisi(userId: string, tanggal: Date): Promise<NutrisiHarian>;
  calculateBMI(berat: number, tinggi: number): BMIResult;
  getKaloriTarget(user: User): Promise<number>;
  getDeficiencyReport(userId: string): Promise<NutrisiDeficiency>;
  suggestMenu(deficiencies: NutrisiDeficiency): Promise<MenuSuggestion>;
}
```

#### C. Use Cases (Business Logic)
```typescript
// src/core/domain/usecases/nutrition/AnalyzeMakanan.ts
export class AnalyzeMakanan {
  constructor(
    private makananRepo: IMakananRepository,
    private nutrisiAnalyzer: INutrisiAnalyzer
  ) {}

  async execute(request: AnalyzeMakananRequest): Promise<AnalyzeMakananResponse> {
    // 1. Cari makanan berdasarkan keyword
    const makananList = await this.makananRepo.searchByNama(request.keyword);

    // 2. Filter berdasarkan ketersediaan lokasi
    const filteredMakanan = this.filterByLokasi(makananList, request.lokasi);

    // 3. Analisis nutrisi untuk setiap makanan
    const analisis = await Promise.all(
      filteredMakanan.map(m => this.analyzeSingleMakanan(m, request))
    );

    return {
      makanan: analisis,
      totalKalori: analisis.reduce((sum, a) => sum + a.kalori, 0),
      rekomendasi: this.generateRekomendasi(analisis, request.userGoals)
    };
  }

  private filterByLokasi(makanan: MakananIndonesia[], lokasi: string): MakananIndonesia[] {
    // Logic untuk filter berdasarkan lokasi pengguna
    // Contoh: di Papua lebih mudah dapat ikan, di Jawa lebih banyak sayur
  }
}

// src/core/domain/usecases/workout/GenerateWorkout.ts
export class GenerateWorkout {
  constructor(
    private workoutRepo: IWorkoutRepository,
    private userRepo: IUserRepository
  ) {}

  async execute(userId: string): Promise<WorkoutPlan> {
    const user = await this.userRepo.getById(userId);
    const userGoals = user.goals;
    const fitnessLevel = this.determineLevel(user);

    const availableWorkouts = await this.workoutRepo.getWorkoutByGoal(
      userGoals.primaryGoal
    );

    return this.createWeeklyPlan(availableWorkouts, fitnessLevel, user.preferences);
  }
}
```

### 2. **Data Layer Implementation**

#### A. Local Database (SQLite)
```typescript
// src/core/data/local/database/AppDatabase.ts
export class AppDatabase {
  private db: SQLiteDatabase;

  constructor() {
    this.db = new SQLiteDatabase({
      name: 'health_coaching_id.db',
      version: 1,
      migrations: this.getMigrations()
    });
  }

  // Tables
  createTables() {
    this.db.execute(`
      CREATE TABLE makanan_indonesia (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        nama_lain TEXT,
        kategori TEXT NOT NULL,
        asal TEXT,
        nutrisi_per_100g TEXT, -- JSON
        porsi_standar TEXT,    -- JSON
        created_at INTEGER,
        updated_at INTEGER
      );
    `);

    this.db.execute(`
      CREATE TABLE user_makanan_log (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        makanan_id TEXT NOT NULL,
        porsi INTEGER NOT NULL,
        waktu_makan INTEGER NOT NULL,
        created_at INTEGER,
        FOREIGN KEY (makanan_id) REFERENCES makanan_indonesia(id)
      );
    `);

    this.db.execute(`
      CREATE TABLE workout_session (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        workout_id TEXT NOT NULL,
        durasi_actual INTEGER,
        kalori_burned INTEGER,
        selesai INTEGER DEFAULT 0,
        created_at INTEGER
      );
    `);
  }
}
```

#### B. Remote API Integration
```typescript
// src/core/data/remote/api/MakananApiService.ts
export class MakananApiService {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  async searchMakanan(keyword: string): Promise<MakananIndonesiaDTO[]> {
    const response = await this.httpClient.get('/makanan/search', {
      params: { q: keyword, limit: 20 }
    });
    return response.data.map(this.transformToMakanan);
  }

  async getNutrisiUpdates(): Promise<void> {
    // Sync latest nutrition data from server
    const lastSync = await this.getLastSyncTimestamp();
    const updates = await this.httpClient.get('/makanan/updates', {
      params: { since: lastSync }
    });

    await this.updateLocalDatabase(updates.data);
  }

  private transformToMakanan(dto: MakananDTO): MakananIndonesia {
    return new MakananIndonesia(
      dto.id,
      dto.nama,
      dto.namaLain || [],
      this.parseKategori(dto.kategori),
      dto.asal || [],
      this.parseNutrisi(dto.nutrisiPer100g),
      this.parsePorsi(dto.porsiStandar),
      dto.gambar || [],
      dto.bahanUtama || [],
      dto.caraMasak || []
    );
  }
}
```

### 3. **Presentation Layer Structure**

#### A. State Management Pattern
```typescript
// Using Provider/Context or Redux Toolkit
export interface NutritionState {
  makananHariIni: MakananLog[];
  totalKalori: number;
  targetKalori: number;
  nutrisiProgress: NutrisiProgress;
  isLoading: boolean;
  error: string | null;
}

export interface WorkoutState {
  workoutPlan: WorkoutPlan;
  currentSession: WorkoutSession | null;
  workoutHistory: WorkoutSession[];
  progress: ProgressStats;
  isLoading: boolean;
}
```

#### B. Component Architecture
```typescript
// Feature-based components with clear responsibilities
export const NutritionDashboard: React.FC = () => {
  // State management
  // Business logic integration
  // UI orchestration
};

export const MakananCard: React.FC<MakananCardProps> = ({ makanan, onTrack }) => {
  // Single responsibility: display food info
  // Reusable across features
};
```

## 🔗 Module Dependencies

```
┌─────────────────┐    ┌─────────────────┐
│  Presentation   │───▶│     Domain      │
│    (UI Layer)   │    │ (Business Logic)│
└─────────────────┘    └─────────────────┘
         ▲                       ▲
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│     Shared      │    │      Data       │
│   (Utilities)   │    │ (Repositories)  │
└─────────────────┘    └─────────────────┘
```

## 🎯 Key Benefits

1. **Scalability**: Mudah menambah fitur baru tanpa breaking existing code
2. **Testability**: Business logic terpisah, mudah di-unit test
3. **Maintainability**: Clear separation of concerns
4. **Performance**: Offline-first dengan smart caching
5. **Localization**: Built-in support for Indonesian context

Design ini siap untuk implementasi. Mana yang ingin kita detailkan lebih lanjut?
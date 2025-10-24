/**
 * Use Case: Analyze Makanan Harian
 * Location: Core Domain (Shared business logic)
 * Reason: Centralized nutrition analysis used by multiple features
 */

export interface AnalyzeMakananHarianRequest {
  userId: string;
  tanggal: Date;
  includeRekomendasi: boolean;
}

export interface MakananLog {
  id: string;
  makananId: string;
  nama: string;
  porsi: string;
  kalori: number;
  waktuMakan: Date;
  nutrisi?: Partial<NutrisiHarian>;
}

export interface NutrisiHarian {
  totalKalori: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  serat: number;
  garam: number; // mg
  gula: number;  // gram
}

export interface Alert {
  code: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  action?: {
    text: string;
    action: () => void;
  };
}

export interface AnalyzeMakananHarianResponse {
  tanggal: Date;
  totalKalori: number;
  targetKalori: number;
  persentaseTarget: number;
  nutrisiRataRata: NutrisiHarian;
  makananDimakan: MakananLog[];
  status: 'kurang' | 'pas' | 'lebih';
  rekomendasi?: {
    makanan: any[];
    tips: string[];
    targetHariBesok: number;
  };
  alerts: Alert[];
}

export class AnalyzeMakananHarian {
  constructor(
    private makananRepo: any,
    private userRepo: any,
    private nutrisiAnalyzer: any,
    private alerter: any
  ) {}

  async execute(request: AnalyzeMakananHarianRequest): Promise<AnalyzeMakananHarianResponse> {
    // 1. Get user data
    const user = await this.userRepo.getById(request.userId);

    // 2. Get food logs for date
    const makananHariIni = await this.getMakananHariIni(request.userId, request.tanggal);

    // 3. Calculate total nutrition
    const totalNutrisi = await this.calculateTotalNutrisi(makananHariIni);
    const targetKalori = await this.nutrisiAnalyzer.getKaloriTarget(user);

    // 4. Determine status
    const status = this.determineStatus(totalNutrisi.totalKalori, targetKalori);

    // 5. Generate alerts
    const alerts = await this.generateAlerts(user, totalNutrisi, status);

    // 6. Generate recommendations if requested
    let rekomendasi;
    if (request.includeRekomendasi) {
      rekomendasi = await this.generateRekomendasi(user, totalNutrisi, status);
    }

    return {
      tanggal: request.tanggal,
      totalKalori: totalNutrisi.totalKalori,
      targetKalori,
      persentaseTarget: Math.round((totalNutrisi.totalKalori / targetKalori) * 100),
      nutrisiRataRata: totalNutrisi,
      makananDimakan: makananHariIni,
      status,
      rekomendasi,
      alerts
    };
  }

  private async getMakananHariIni(userId: string, tanggal: Date): Promise<MakananLog[]> {
    if (!this.makananRepo) {
      return [];
    }

    const startOfDay = new Date(tanggal);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(tanggal);
    endOfDay.setHours(23, 59, 59, 999);

    if (typeof this.makananRepo.getLogsByDate === 'function') {
      return this.makananRepo.getLogsByDate(userId, startOfDay, endOfDay);
    }

    if (typeof this.makananRepo.findByUserAndRange === 'function') {
      return this.makananRepo.findByUserAndRange(userId, startOfDay, endOfDay);
    }

    if (typeof this.makananRepo.list === 'function') {
      const allLogs = await this.makananRepo.list(userId);
      return Array.isArray(allLogs)
        ? allLogs.filter(
            (log: MakananLog) =>
              new Date(log.waktuMakan).getTime() >= startOfDay.getTime() &&
              new Date(log.waktuMakan).getTime() <= endOfDay.getTime()
          )
        : [];
    }

    return [];
  }

  private async calculateTotalNutrisi(makananLog: MakananLog[]): Promise<NutrisiHarian> {
    return makananLog.reduce<NutrisiHarian>(
      (acc, log) => {
        acc.totalKalori += log.kalori;
        acc.protein += log.nutrisi?.protein ?? 0;
        acc.karbohidrat += log.nutrisi?.karbohidrat ?? 0;
        acc.lemak += log.nutrisi?.lemak ?? 0;
        acc.serat += log.nutrisi?.serat ?? 0;
        acc.garam += log.nutrisi?.garam ?? 0;
        acc.gula += log.nutrisi?.gula ?? 0;
        return acc;
      },
      {
        totalKalori: 0,
        protein: 0,
        karbohidrat: 0,
        lemak: 0,
        serat: 0,
        garam: 0,
        gula: 0,
      }
    );
  }

  private determineStatus(totalKalori: number, targetKalori: number): 'kurang' | 'pas' | 'lebih' {
    const persentase = (totalKalori / targetKalori) * 100;

    if (persentase < 80) return 'kurang';
    if (persentase <= 120) return 'pas';
    return 'lebih';
  }

  private async generateAlerts(user: any, nutrisi: NutrisiHarian, status: string): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // Salt alert (important for Indonesian diet)
    if (nutrisi.garam > 5000) { // WHO recommendation max 5g/day
      alerts.push({
        code: 'GARAM_TERLALU_BANYAK',
        type: 'warning',
        message: 'Asupan garam Anda melebihi batas harian yang direkomendasikan',
        action: {
          text: 'Lihat Tips',
          action: () => console.log('Navigate to tips')
        }
      });
    }

    // Sugar alert (important for diabetes prevention)
    if (nutrisi.gula > 50) { // WHO recommendation max 50g/day
      alerts.push({
        code: 'GULA_TERLALU_BANYAK',
        type: 'warning',
        message: 'Asupan gula Anda melebihi batas harian yang direkomendasikan'
      });
    }

    // Fiber alert
    if (nutrisi.serat < 25) {
      alerts.push({
        code: 'SERAT_KURANG',
        type: 'info',
        message: 'Asupan serat Anda kurang dari yang direkomendasikan'
      });
    }

    // Status-based alerts
    if (status === 'kurang') {
      alerts.push({
        code: 'KALORI_KURANG',
        type: 'warning',
        message: 'Asupan kalori Anda kurang dari target harian'
      });
    } else if (status === 'lebih') {
      alerts.push({
        code: 'KALORI_LEBIH',
        type: 'warning',
        message: 'Asupan kalori Anda melebihi target harian'
      });
    }

    return alerts;
  }

  private async generateRekomendasi(
    user: any,
    nutrisi: NutrisiHarian,
    status: string
  ): Promise<AnalyzeMakananHarianResponse['rekomendasi']> {
    let rekomendasiMakanan: any[] = [];
    const tips: string[] = [];

    switch (status) {
      case 'kurang':
        rekomendasiMakanan = await this.getRekomendasiMakananTinggiKalori(user.preferences?.lokasi);
        tips.push('Tambahkan porsi makanan secara bertahap');
        tips.push('Pilih makanan padat nutrisi seperti kacang-kacangan');
        break;

      case 'lebih':
        rekomendasiMakanan = await this.getRekomendasiMakananRendahKalori(user.preferences?.lokasi);
        tips.push('Kurangi porsi makanan secara bertahap');
        tips.push('Pilih sayuran segar sebagai pengganti karbohidrat');
        break;

      default:
        tips.push('Lanjutkan pola makan sehat Anda');
        tips.push('Pastikan asupan air putih cukup');
        break;
    }

    // Specific recommendations based on nutrition deficiencies
    if (nutrisi.serat < 25) {
      const makananSeratTinggi = await this.getRekomendasiMakananTinggiSerat(user.preferences?.lokasi);
      rekomendasiMakanan = [...rekomendasiMakanan, ...makananSeratTinggi];
      tips.push('Tambahkan sayuran dan buah untuk meningkatkan asupan serat');
    }

    return {
      makanan: rekomendasiMakanan,
      tips,
      targetHariBesok: await this.nutrisiAnalyzer.getKaloriTarget(user)
    };
  }

  // Private helper methods would be implemented here
  private async getRekomendasiMakananTinggiKalori(lokasi?: string): Promise<any[]> {
    if (this.makananRepo?.getHighCalorieRecommendations) {
      return this.makananRepo.getHighCalorieRecommendations(lokasi);
    }

    if (this.makananRepo?.findRecommendations) {
      return this.makananRepo.findRecommendations({ type: 'high_calorie', lokasi });
    }

    return [];
  }

  private async getRekomendasiMakananRendahKalori(lokasi?: string): Promise<any[]> {
    if (this.makananRepo?.getLowCalorieRecommendations) {
      return this.makananRepo.getLowCalorieRecommendations(lokasi);
    }

    if (this.makananRepo?.findRecommendations) {
      return this.makananRepo.findRecommendations({ type: 'low_calorie', lokasi });
    }

    return [];
  }

  private async getRekomendasiMakananTinggiSerat(lokasi?: string): Promise<any[]> {
    if (this.makananRepo?.getHighFiberRecommendations) {
      return this.makananRepo.getHighFiberRecommendations(lokasi);
    }

    if (this.makananRepo?.findRecommendations) {
      return this.makananRepo.findRecommendations({ type: 'high_fiber', lokasi });
    }

    return [];
  }
}

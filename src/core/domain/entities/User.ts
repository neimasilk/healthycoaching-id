/**
 * Domain Entity: User
 * Represents a user in the HealthyCoaching Indonesia system
 */

export interface UserProfile {
  id: string;
  userId: string;
  namaLengkap: string;
  namaPanggilan: string;
  email: string;
  noTelepon?: string;
  tanggalLahir: Date;
  jenisKelamin: 'pria' | 'wanita';
  tinggiBadan: number; // cm
  beratBadan: number; // kg
  targetBerat?: number; // kg
  aktivitasFisik: AktivitasFisikLevel;
  golKesehatan: GolKesehatan[];
  preferensi: UserPreferences;
  alergi: string[];
  kondisiKesehatan: KondisiKesehatan[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AktivitasFisikLevel {
  level: 'sangatJarang' | 'jarang' | 'cukup' | 'sering';
  targetMenitPerMinggu: number; // menit
}

export interface GolKesehatan {
  id: string;
  jenis: 'turun_berat' | 'naik_berat' | 'tahan_berat' | 'membentuk_otot' | 'menjaga_kesehatan';
  target: number; // kg
  targetTanggal?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface UserPreferences {
  preferensiBahasa: 'id' | 'en';
  notifikasi: {
    email: boolean;
    push: boolean;
    workoutReminder: boolean;
    mealReminder: boolean;
  };
  preferensiDiet: {
    tipe: 'none' | 'vegetarian' | 'vegan' | 'paleo' | 'keto';
    halalOnly: boolean;
    tidakSuka: string[];
  };
  preferensiPembayaran: {
    defaultMethod: 'gopay' | 'ovo' | 'dana' | 'kartu_kredit' | 'transfer_bank';
    tersimpan: {
      gopay: boolean;
      ovo: boolean;
      dana: boolean;
    };
  };
  preferensiUnit: {
    berat: 'kg' | 'lbs';
    tinggi: 'cm' | 'inch';
    suhu: 'celsius' | 'fahrenheit';
    jarak: 'km' | 'miles';
  };
}

export interface KondisiKesehatan {
  id: string;
  jenis: 'diabetes' | 'hipertensi' | 'jantung' | 'asma' | 'alergi' | 'lainnya';
  nama: string;
  keterangan?: string;
  obat: string[];
  isAktif: boolean;
  catatan?: string;
}

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public profile: UserProfile,
    public createdAt: Date,
    public updatedAt: Date = new Date()
  ) {}

  // Business logic methods
  getUmur(): number {
    const today = new Date();
    const birthDate = this.profile.tanggalLahir;
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  getBMI(): number {
    const heightInMeters = this.profile.tinggiBadan / 100;
    return this.profile.beratBadan / (heightInMeters * heightInMeters);
  }

  getBMICategory(): string {
    const bmi = this.getBMI();

    if (bmi < 18.5) return 'kurus';
    if (bmi < 23) return 'normal';
    if (bmi < 25) return 'kelebihan';
    if (bmi < 30) return 'obesitas_1';
    return 'obesitas_2';
  }

  hasTargetBerat(): boolean {
    return this.profile.targetBerat !== undefined;
  }

  isGoalAktif(): GolKesehatan | null {
    return this.profile.golKesehatan.find(gol =>
      gol.isActive &&
      (!gol.targetTanggal || new Date(gol.targetTanggal) > new Date())
    ) || null;
  }

  // Indonesian context methods
  isPuasa(): boolean {
    // Check if user has puasa preference active
    return this.profile.preferensi.tipeDiet === 'none'; // Simplified for now
  }

  needsHalalFood(): boolean {
    return this.profile.preferensi.preferensiDiet.halalOnly;
  }

  getAlergenList(): string[] {
    return this.profile.alergi;
  }

  // Validation methods
  validateProfile(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.profile.email || !this.validateEmail(this.profile.email)) {
      errors.push('Email tidak valid');
    }

    if (this.profile.tinggiBadan < 100 || this.profile.tinggiBadan > 250) {
      errors.push('Tinggi badan harus antara 100-250 cm');
    }

    if (this.profile.beratBadan < 30 || this.profile.beratBadan > 300) {
      errors.push('Berat badan harus antara 30-300 kg');
    }

    if (!this.profile.namaLengkap || this.profile.namaLengkap.trim().length < 2) {
      errors.push('Nama lengkap harus diisi minimal 2 karakter');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
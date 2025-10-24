/**
 * Domain Entity: MakananIndonesia
 * Represents Indonesian food with complete nutritional information
 */

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

export enum CaraMasak {
  GORENG = 'goreng',
  REBUS = 'rebus',
  KUKUS = 'kukus',
  BAKAR = 'bakar',
  TIM = 'tim',
  SAUTE = 'saute',
  DANDANG = 'dandang',
  PANGGANG = 'panggang'
}

export enum TingkatKepopuleran {
  TIDAK_POPULER = 1,
  KURANG_POPULER = 3,
  CUKUP_POPULER = 5,
  SANGAT_POPULER = 7,
  VERY_POPULER = 10
}

export interface Nutrisi {
  kalori: number;           // kcal per 100g
  protein: number;           // gram per 100g
  karbohidrat: number;       // gram per 100g
  lemak: number;             // gram per 100g
  serat: number;             // gram per 100g
  garam: number;             // mg per 100g (penting untuk hipertensi)
  gula: number;              // gram per 100g (penting untuk diabetes)
  vitaminA: number;           // IU per 100g
  vitaminC: number;           // mg per 100g
  kalsium: number;           // mg per 100g
  zatBesi: number;            // mg per 100g
  folat: number;             // mcg per 100g
}

export interface PorsiStandar {
  id: string;
  nama: string;              // "1 piring", "1 mangkok", "1 gelas", "100 gram"
  beratGram: number;         // berat dalam gram
  volumeML?: number;         // volume dalam ml (untuk minuman)
  deskripsi: string;
  gambar?: string;           // URL ke gambar porsi
}

export interface InformasiBahan {
  nama: string;
  persentase: number;      // persentase dari total berat
  kategori: string;         // 'sayuran', 'protein_hewani', 'karbohidrat', 'lemak', dll
}

export interface KetersediaanRegional {
  provinsi: string[];        // Jawa, Sumatera Barat, Bali, dll
  kota: string[];           // Jakarta, Surabaya, Bandung, dll
  musiman: ('hijau' | 'kemarau' | 'hujan' | 'penghujan')[];
}

export class MakananIndonesia {
  constructor(
    public readonly id: string,
    public nama: string,
    public namaLain: string[],      // Nasi uduk, Nasi kuning, dll
    public kategori: KategoriMakanan,
    public asal: string[],           // Jawa, Sumatera, Bali, Sulawesi, Kalimantan
    public daerah: KetersediaanRegional,
    public nutrisiPer100g: Nutrisi,
    public porsiStandar: PorsiStandar[],
    public gambar: string[],
    public informasiBahan: InformasiBahan[],
    public caraMasak: CaraMasak[],
    public halalCertified: boolean,
    public isVegetarian: boolean,
    public isVegan: boolean,
    public alergen: string[],
    popularitas: TingkatKepopuleran,
    public ketersediaan: 'seluruh_indonesia' | 'beberapa_wilayah' | 'jarang_tersedia',
    public musimanHijau: boolean,
    public perkiraanHarga: {
      minimal: number;
      maksimal: number;
      mataUang: number;
    },
    public lastUpdated: Date,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  // Business logic methods
  getNutrisiUntukPorsi(porsiIndex: number): Nutrisi {
    if (porsiIndex < 0 || porsiIndex >= this.porsiStandar.length) {
      throw new Error(`Porsi index ${porsiIndex} tidak valid`);
    }

    const porsi = this.porsiStandar[porsiIndex];
    const faktor = porsi.beratGram / 100;

    return {
      kalori: Math.round(this.nutrisiPer100g.kalori * faktor),
      protein: Math.round(this.nutrisiPer100g.protein * faktor * 10) / 10,
      karbohidrat: Math.round(this.nutrisiPer100g.karbohidrat * faktor * 10) / 10,
      lemak: Math.round(this.nutrisiPer100g.lemak * faktor * 10) / 10,
      serat: Math.round(this.nutrisiPer100g.serat * faktor * 10) / 10,
      garam: Math.round(this.nutrisiPer100g.garam * faktor),
      gula: Math.round(this.nutrisiPer100g.gula * faktor * 10) / 10,
      vitaminA: Math.round(this.nutrisiPer100g.vitaminA * faktor),
      vitaminC: Math.round(this.nutrisiPer100g.vitaminC * faktor),
      kalsium: Math.round(this.nutrisiPer100g.kalsium * faktor),
      zatBesi: Math.round(this.nutrisiPer100g.zatBesi * faktor),
      folat: Math.round(this.nutrisiPer100g.folat * faktor),
    };
  }

  // Indonesian specific methods
  isSehatUntukPengguna(penggunaAlergi: string[]): boolean {
    return !this.alergen.some(alergen =>
      penggunaAlergi.some(userAlergen =>
        this.alergen.toLowerCase().includes(userAlergen.toLowerCase())
      )
    );
  }

  isTersediaDiLokasi(provinsi: string, kota?: string): boolean {
    if (this.ketersediaan === 'seluruh_indonesia') {
      return true;
    }

    return this.daerah.provinsi.includes(provinsi) ||
           (kota && this.daerah.kota.includes(kota));
  }

  isTersediaDiMusim(musiman: 'hijau' | 'kemarau' | 'hujan' | 'penghujan'): boolean {
    if (this.musimanHijau && musiman === 'hijau') return false;
    return this.musiman === musiman;
  }

  isMakananKhasRamadan(): boolean {
    // Check if typical Ramadan food
    const makananRamadan = [
      'ketupat', 'kolak', 'dates', 'bubur kacang',
      'opor ayam', 'soto', 'gulai', 'es buah',
      'kurma', 'sayur lodeh', 'bubur sayur'
    ];

    return makananRamadan.some(ramadanFood =>
      this.nama.toLowerCase().includes(ramadanFood)
    );
  }

  // Health assessment methods
  adalahBergizi(): boolean {
    // Simple algorithm untuk menilai gizi
    const nutrisi = this.nutrisiPer100g;

    // High protein and fiber, low sugar and salt = good
    const skorProtein = Math.min(nutrisi.protein / 30, 1); // 30g+ protein per 100g
    const skorSerat = Math.min(nutrisi.serat / 15, 1);  // 15g+ fiber per 100g
    const skorGula = Math.max(1 - (nutrisi.gula / 15), 0); // Max 15g sugar per 100g
    const skorGaram = Math.max(1 - (nutrisi.garam / 600), 0); // Max 600mg salt per 100g

    const skorTotal = (skorProtein + skorSerat + skorGula + skorGaram) / 4;

    return skorTotal >= 0.7; // 70% threshold
  }

  dapatDimakanSelamaDiet(tipeDiet: string): boolean {
    switch (tipeDiet.toLowerCase()) {
      case 'vegetarian':
        return this.isVegetarian;
      case 'vegan':
        return this.isVegan;
      case 'paleo':
        return this.isPaleoFriendly;
      case 'keto':
        return this.isKetoFriendly;
      default:
        return true; // 'none' diet allows all
    }
  }

  // Helper methods
  private get isVegetarian(): boolean {
    const bahanHewani = this.informasiBahan.filter(b =>
      bahan.kategori === 'protein_hewani'
    );
    return bahanHewani.length === 0 && this.isVegetarian;
  }

  private get isVegan(): boolean {
    const bahanHewani = this.informasiBahan.filter(b =>
      bahan.kategori === 'protein_hewani'
    );
    const bahanHewaniLainnya = this.informasiBahan.filter(b =>
      bahan.kategori === 'susu' || bahan.kategori === 'telur'
    );
    return bahanHewani.length === 0 && bahanHewaniLainnya.length === 0;
  }

  private isPaleoFriendly(): boolean {
    const tidakPaleo = ['nasi', 'roti', 'gandum', 'kentang'];
    const bahanPaleo = this.informasiBahan.map(b => bahan.nama.toLowerCase());

    return !this.nama.toLowerCase().includes('gula') &&
           !tidakPaleo.some(nonPaleo =>
             bahanPaleo.some(bahanPalem =>
               this.nama.toLowerCase().includes(bahanPalem)
             )
           );
  }

  private isKetoFriendly(): boolean {
    const karbohidrat = this.nutrisiPer100g.karbohidrat;
    const gula = this.nutrisiPer100g.gula;

    // Keto friendly: <5g net carbs per 100g
    const karbohidratBersih = karbohidrat - (this.nutrisiPer100g.serat / 2); // Fiber half count
    return karbohidratBersih < 5 && gula < 2;
  }

  // Utility methods
  getPorsiRekomendasi(targetKalori: number): PorsiStandar {
    // Cari porsi yang paling dekat dengan target kalori
    let porsiTerdekat = 0;
    let selisih = Infinity;

    this.porsiStandar.forEach((porsi, index) => {
      const nutrisi = this.getNutrisiUntukPorsi(index);
      const selisihKalori = Math.abs(targetKalori - nutrisi.kalori);

      if (selisihKalori < selisih) {
        selisih = selisihKalori;
        porsiTerdekat = index;
      }
    });

    return this.porsiStandar[porsiTerdekat];
  }

  getInformasiNutrisiLengkap(): string {
    const nutrisi = this.nutrisiPer100g;
    return `Kalori: ${nutrisi.kalori} | ` +
           `Protein: ${nutrisi.protein}g | ` +
           `Karbohidrat: ${nutrisi.karbohidrat}g | ` +
           `Lemak: ${nutrisi.lemak}g | ` +
           `Serat: ${nutrisi.serat}g | ` +
           `Garam: ${nutrisi.garam}mg | ` +
           `Gula: ${nutrisi.gula}g`;
  }

  toJSON() {
    return {
      id: this.id,
      nama: this.nama,
      namaLain: this.namaLain,
      kategori: this.kategori,
      asal: this.asal,
      nutrisiPer100g: this.nutrisiPer100g,
      porsiStandar: this.porsiStandar,
      gambar: this.gambar,
      informasiBahan: this.informasiBahan,
      caraMasak: this.caraMasak,
      halalCertified: this.halalCertified,
      isVegetarian: this.isVegetarian,
      isVegan: this.isVegan,
      alergen: this.alergen,
      popularitas: this.popularitas,
      ketersediaan: this.ketersediaan,
      musimanHijau: this.musimanHijau,
      lastUpdated: this.lastUpdated,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
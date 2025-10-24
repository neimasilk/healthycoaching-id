/**
 * Unit Test: MakananIndonesia Entity
 * Location: src/core/domain/entities/__tests__/
 * Purpose: Test Indonesian food entity business logic
 */

import {
  MakananIndonesia,
  KategoriMakanan,
  CaraMasak,
  Nutrisi,
  TingkatKepopuleran
} from '../MakananIndonesia';

// Helper function to create valid MakananIndonesia instances for testing
function createTestMakanan(overrides: Partial<{
  id: string;
  nama: string;
  kategori: KategoriMakanan;
  halalCertified: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  alergen: string[];
  informasiBahan: any[];
  nutrisiPer100g: Nutrisi;
}> = {}): MakananIndonesia {
  const defaultNutrisi: Nutrisi = {
    kalori: 200,
    protein: 15,
    karbohidrat: 25,
    lemak: 8,
    serat: 3,
    garam: 400,
    gula: 5,
    vitaminA: 1000,
    vitaminC: 20,
    kalsium: 100,
    zatBesi: 3,
    folat: 25
  };

  return new MakananIndonesia(
    overrides.id || 'test-001',
    overrides.nama || 'Test Food',
    [],
    overrides.kategori || KategoriMakanan.LAUK_PAUK,
    [],
    { provinsi: ['Jawa'], kota: [], musiman: [] },
    overrides.nutrisiPer100g || defaultNutrisi,
    [{
      id: '1',
      nama: '1 porsi',
      beratGram: 100,
      deskripsi: 'Satu porsi standar'
    }],
    ['https://example.com/image.jpg'],
    overrides.informasiBahan || [{
      nama: 'Test Ingredient',
      persentase: 100,
      kategori: 'vegetable'
    }],
    [CaraMasak.GORENG],
    overrides.halalCertified !== undefined ? overrides.halalCertified : true,
    overrides.isVegetarian !== undefined ? overrides.isVegetarian : false,
    overrides.isVegan !== undefined ? overrides.isVegan : false,
    overrides.alergen !== undefined ? overrides.alergen : [],
    TingkatKepopuleran.CUKUP_POPULER,
    'seluruh_indonesia',
    false,
    { minimal: 10000, maksimal: 15000, mataUang: 360 }
  );
}

describe('MakananIndonesia Entity', () => {
  describe('Constructor', () => {
    it('should create makanan with valid data', () => {
      // Arrange
      const nutrisi: Nutrisi = {
        kalori: 165,
        protein: 7,
        karbohidrat: 30,
        lemak: 4,
        serat: 1,
        garam: 300,
        gula: 5,
        vitaminA: 200,
        vitaminC: 20,
        kalsium: 30,
        zatBesi: 2,
        folat: 6
      };

      const porsiStandar = [
        {
          id: '1-piring',
          nama: '1 piring',
          beratGram: 200,
          deskripsi: 'Porsi standar nasi dengan lauk pauk'
        }
      ];

      const informasiBahan = [
        { nama: 'Nasi', persentase: 60, kategori: 'karbohidrat' },
        { nama: 'Ayam', persentase: 30, kategori: 'protein_hewani' },
        { nama: 'Buncis', persentase: 5, kategori: 'sayuran' },
        { nama: 'Bawang Merah', persentase: 3, kategori: 'sayuran' },
        { nama: 'Kecap Manis', persentase: 1.5, kategori: 'rempah' },
        { nama: 'Minyak', persentase: 0.5, kategori: 'lemak' }
      ];

      // Act
      const makanan = new MakananIndonesia(
        'mkn-001',
        'Nasi Goreng Spesial',
        ['Nasi Goreng Jawa', 'Nasi Goreng Kecom', 'Fried Rice'],
        KategoriMakanan.MAKANAN_POKOK,
        ['Jawa', 'Sumatera', 'Bali'],
        {
          provinsi: ['Jawa', 'Sumatera Barat'],
          kota: ['Jakarta', 'Bandung', 'Surabaya'],
          musiman: ['hijau', 'kemarau']
        },
        nutrisi,
        porsiStandar,
        ['https://example.com/image1.jpg'],
        informasiBahan,
        [CaraMasak.GORENG, CaraMasak.TUMIS],
        true,  // halalCertified
        false, // isVegetarian
        false, // isVegan
        ['udang'],
        TingkatKepopuleran.SANGAT_POPULER,
        'seluruh_indonesia',
        true, // musiman hijau
        {
          minimal: 15000,
          maksimal: 25000,
          mataUang: 20000
        },
        new Date(),
        new Date()
      );

      // Assert
      expect(makanan.id).toBe('mkn-001');
      expect(makanan.nama).toBe('Nasi Goreng Spesial');
      expect(makanan.kategori).toBe(KategoriMakanan.MAKANAN_POKOK);
      expect(makanan.nutrisiPer100g.kalori).toBe(165);
      expect(makanan.halalCertified).toBe(true);
      expect(makanan.alergen).toEqual(['udang']);
      expect(makanan.popularitas).toBe(TingkatKepopuleran.SANGAT_POPULER);
    });

    it('should auto-set timestamps if not provided', async () => {
      // Arrange
      const beforeCreate = new Date();
      await new Promise(resolve => setTimeout(resolve, 1)); // Small delay
      const afterCreate = new Date();

      // Act
      const makanan = new MakananIndonesia(
        'test-001',
        'Test Food',
        [],
        KategoriMakanan.BUAH,
        [],
        {
          provinsi: ['Kalimantan'],
          kota: ['Balikpapan'],
          musiman: ['kemarau']
        },
        {
          kalori: 50,
          protein: 1,
          karbohidrat: 12,
          lemak: 0.5,
          serat: 2,
          garam: 10,
          gula: 8,
          vitaminA: 10,
          vitaminC: 5,
          kalsium: 2,
          zatBesi: 0.5,
          folat: 1
        },
        [],
        [],
        [],
        [],
        [],
        false,
        false,
        [],
        TingkatKepopuleran.KURANG_POPULER,
        'beberapa_wilayah',
        false,
        { minimal: 5000, maksimal: 8000, mataUang: 7000 }
      );

      // Assert
      expect(makanan.createdAt.getTime()).toBeGreaterThan(beforeCreate.getTime());
      expect(makanan.lastUpdated.getTime()).toBeGreaterThanOrEqual(makanan.createdAt.getTime());
    });
  });

  describe('getNutrisiUntukPorsi', () => {
    let makanan: MakananIndonesia;

    beforeEach(() => {
      makanan = new MakananIndonesia(
        'test-001',
        'Test Food',
        [],
        KategoriMakanan.MAKANAN_POKOK,
        [],
        {
          provinsi: ['Jawa'],
          kota: ['Jakarta']
        },
        {
          kalori: 200,
          protein: 8,
          karbohidrat: 40,
          lemak: 6,
          serat: 2,
          garam: 400,
          gula: 10,
          vitaminA: 100,
          vitaminC: 10,
          kalsium: 20,
          zatBesi: 3,
          folat: 8
        },
        [
          {
            id: '100g',
            nama: '100 gram',
            beratGram: 100
          },
          {
            id: '1-piring',
            nama: '1 piring',
            beratGram: 200
          }
        ],
        [],
        [],
        [],
        [],
        true,
        false,
        [],
        TingkatKepopuleran.CUKUP_POPULER,
        'seluruh_indonesia',
        false,
        { minimal: 10000, maksimal: 15000, mataUang: 12000 }
      );
    });

    it('should calculate nutrition for 100g portion', () => {
      const nutrisi = makanan.getNutrisiUntukPorsi(0);

      // Assert
      expect(nutrisi.kalori).toBe(200);
      expect(nutrisi.protein).toBe(8);
      expect(nutrisi.karbohidrat).toBe(40);
      expect(nutrisi.lemak).toBe(6);
      expect(nutrisi.serat).toBe(2);
      expect(nutrisi.garam).toBe(400);
      expect(nutrisi.gula).toBe(10);
    });

    it('should calculate nutrition for 200g portion', () => {
      const nutrisi = makanan.getNutrisiUntukPorsi(1);

      // Assert (2x 100g = 200g)
      expect(nutrisi.kalori).toBe(400);
      expect(nutrisi.protein).toBe(16);
      expect(nutrisi.karbohidrat).toBe(80);
      expect(nutrisi.lemak).toBe(12);
      expect(nutrisi.serat).toBe(4);
      expect(nutrisi.garam).toBe(800);
    });

    it('should throw error for invalid porsi index', () => {
      expect(() => makanan.getNutrisiUntukPorsi(-1))
        .toThrow('Porsi index -1 tidak valid');

      expect(() => makanan.getNutrisiUntukPorsi(999))
        .toThrow('Porsi index 999 tidak valid');
    });
  });

  describe('Indonesian Context Methods', () => {
    let makanan: MakananIndonesia;

    beforeEach(() => {
      makanan = new MakananIndonesia(
        'test-001',
        'Ketupat Opor',
        [],
        KategoriMakanan.LAUK_PAUK,
        [],
        { provinsi: ['Jawa'] },
        {
          kalori: 200,
          protein: 20,
          karbohidrat: 10,
          lemak: 8,
          serat: 2,
          garam: 500,
          gula: 3,
          vitaminA: 1000,
          vitaminC: 10,
          kalsium: 50,
          zatBesi: 2,
          folat: 20
        },
        [{
          id: '1',
          nama: '1 porsi',
          beratGram: 100,
          deskripsi: 'Satu porsi standar'
        }],
        ['https://example.com/image.jpg'],
        [{
          nama: 'Ayam',
          persentase: 100,
          kategori: 'protein_hewani'
        }],
        [CaraMasak.GORENG],
        true,
        true,
        ['susu', 'telur'],
        TingkatKepopuleran.CUKUP_POPULER,
        'seluruh_indonesia',
        true,
        { minimal: 10000, maksimal: 15000, mataUang: 360 }
      );
    });

    it('should check allergen correctly', () => {
      const makananAlergi = createTestMakanan({
        alergen: ['kacang', 'susu']
      });

      expect(makananAlergi.isSehatUntukPengguna(['kacang'])).toBe(false);
      expect(makananAlergi.isSehatUntukPengguna(['susu'])).toBe(false);
      expect(makananAlergi.isSehatUntukPengguna(['sayur'])).toBe(true);
    });

    it('should check regional availability', () => {
      expect(makanan.isTersediaDiLokasi('Jakarta')).toBe(true);
      expect(makanan.isTersediaDiLokasi('Bandung')).toBe(true);
      expect(makanan.isTersediaDiLokasi('Medan')).toBe(false);
    });

    it('should check Ramadan food', () => {
      expect(makanan.isMakananKhasRamadan()).toBe(true);
      expect(makanan.isMakananKhasRamadan()).toBe(true);

      // Non-Ramadan food
      const nonRamadan = new MakananIndonesia(
        'test-002',
        'Pizza Margherita',
        [],
        KategoriMakanan.JAJANAN,
        ['Jawa'],
        { provinsi: ['Jawa'] },
        [],
        [CaraMasak.BAKAR],
        false,
        true,
        [],
        TingkatKepopuleran.KURANG_POPULER,
        'seluruh_indonesia',
        false,
        { minimal: 10000, maksimal: 15000, mataUang: 12000 }
      );

      expect(nonRamadan.isMakananKhasRamadan()).toBe(false);
    });

    it('should identify vegetarian foods', () => {
      expect(makanan.dapatDimakanSebagai('vegetarian')).toBe(true);

      const nonVegetarian = createTestMakanan({
        id: 'test-003',
        nama: 'Rendang Padang',
        kategori: KategoriMakanan.LAUK_PAUK,
        isVegetarian: false,
        informasiBahan: [{
          nama: 'Daging',
          persentase: 100,
          kategori: 'protein_hewani'
        }]
      });

      expect(nonVegetarian.dapatDimakanSebagai('vegetarian')).toBe(false);
    });

    it('should check halal certification', () => {
      const halalFood = new MakananIndonesia(
        'test-004',
        'Soto Ayam Halal',
        [],
        KategoriMakanan.MAKANAN_POKOK,
        ['Jawa'],
        [],
        [],
        [CaraMasak.REBUS],
        true, // halal certified
        true,
        [],
        TingkatKepopuleran.CUKUP_POPULER,
        'seluruh_indonesia',
        false,
        { minimal: 10000, maksimal: 15000, mataUang: 12000 }
      );

      const nonHalalFood = new MakananIndonesia(
        'test-005',
        'Babi Kecap',
        [],
        KategoriMakanan.LAUK_PAUK,
        ['Bali'],
        [],
        [],
        [CaraMasak.BAKAR],
        false, // not halal certified
        true,
        [],
        TingkatKepopuleran.CUKUP_POPULER,
        'beberapa_wilayah',
        false,
        { minimal: 15000, maksimal: 25000, mataUang: 20000 }
      );

      expect(halalFood.halalCertified).toBe(true);
      expect(nonHalalFood.halalCertified).toBe(false);
    });
  });

  describe('Health Assessment', () => {
    it('should assess food as healthy', () => {
      const healthyFood = new MakananIndonesia(
        'test-006',
        'Sayur Hijau',
        [],
        KategoriMakanan.SAYURAN,
        ['Jawa'],
        [],
        [],
        [CaraMasak.REBUS],
        true,
        true,
        [],
        TingkatKepopuleran.SANGAT_POPULER,
        'seluruh_indonesia',
        true,
        {
          kalori: 25, protein: 2, karbohidrat: 4, lemak: 0.2,
          serat: 2.5, garam: 50, gula: 1,
          vitaminA: 200, vitaminC: 30, kalsium: 50,
          zatBesi: 1, folat: 60
        },
        [],
        [],
        [],
        [],
        false,
        false,
        [],
        TingkatKepopuleran.SANGAT_POPULER,
        'seluruh_indonesia',
        false,
        { minimal: 5000, maksimal: 8000, mataUang: 6000 }
      );

      expect(healthyFood.adalahBergizi()).toBe(true);
    });

    it('should assess food as unhealthy', () => {
      const unhealthyFood = new MakananIndonesia(
        'test-007',
        'Gorengan Lebih',
        [],
        KategoriMakanan.JAJANAN,
        [],
        [],
        [],
        [CaraMasak.GORENG],
        false,
        false,
        [],
        TingkatKepopuleran.KURANG_POPULER,
        'beberapa_wilayah',
        false,
        {
          kalori: 500, protein: 5, karbohidrat: 50, lemak: 25,
          serat: 0.5, garam: 1500, gula: 20,
          vitaminA: 0, vitaminC: 0, kalsium: 0,
          zatBesi: 0, folat: 0
        },
        [],
        [],
        [],
        false,
        false,
        [],
        TingkatKepopuleran.CUKUP_POPULER,
        'beberapa_wilayah',
        false,
        { minimal: 20000, maksimal: 30000, mataUang: 25000 }
      );

      expect(unhealthyFood.adalahBergizi()).toBe(false);
    });
  });

  describe('Diet Compatibility', () => {
    let vegetarianMakanan: MakananIndonesia;
    let veganMakanan: MakananIndonesia;
    let ketoMakanan: MakananIndonesia;

    beforeEach(() => {
      vegetarianMakanan = new MakananIndonesia(
        'veg-001',
        'Gado-Gado Vegetarian',
        [],
        KategoriMakanan.MAKANAN_POKOK,
        ['Jawa'],
        [],
        [],
        [],
        [CaraMasak.GORENG],
        true,
        true,
        [],
        TingkatKepopuleran.CUKUP_POPULER,
        'seluruh_indonesia',
        false,
        { minimal: 10000, maksimal: 15000, mataUang: 12000 }
      );

      veganMakanan = new MakananIndonesia(
        'vegan-001',
        'Tahu Goreng Tanpa Telur',
        [],
        KategoriMakanan.JAJANAN,
        ['Jawa'],
        [],
        [],
        [],
        [CaraMasak.GORENG],
        true,
        true,
        ['telur'], // Animal products
        TingkatKepopuleran.CUKUP_POPULER,
        'seluruh_indonesia',
        false,
        { minimal: 10000, maksimal: 15000, mataUang: 12000 }
      );

      ketoMakanan = new MakananIndonesia(
        'keto-001',
        'Ayam Goreng Keto',
        [],
        KategoriMakanan.MAKANAN_POKOK,
        [],
        [],
        [],
        [],
        [CaraMasak.GORENG],
        true,
        false,
        [],
        TingkatKepopuleran.CUKUP_POPULER,
        'seluruh_indonesia',
        false,
        {
          kalori: 400, protein: 35, karbohidrat: 5, lemak: 25,
          serat: 0, garam: 100, gula: 2,
          vitaminA: 50, vitaminC: 10, kalsium: 20,
          zatBesi: 3, folat: 2
        },
        [],
        [],
        [],
        false,
        false,
        [],
        TingkatKepopuleran.CUKUP_POPULER,
        'beberapa_wilayah',
        false,
        { minimal: 20000, maksimal: 30000, mataUang: 25000 }
      );
    });

    it('should detect vegetarian food', () => {
      expect(vegetarianMakanan.dapatDimakanSebagai('vegetarian')).toBe(true);
      expect(vegetarianMakanan.dapatDimakanSebagai('vegan')).toBe(true);
    });

    it('should detect non-vegetarian food', () => {
      const nonVegetarian = new MakananIndonesia(
        'non-veg-001',
        'Rendang Sapi',
        [],
        KategoriMakanan.LAUK_PAUK,
        ['Sumatera'],
        [],
        [],
        [],
        [CaraMasak.BAKAR],
        false,
        false,
        [],
        TingkatKepopuleran.SANGAT_POPULER,
        'beberapa_wilayah',
        false,
        { minimal: 15000, maksimal: 25000, mataUang: 20000 }
      );

      expect(nonVegetarian.dapatDimakanSebagai('vegetarian')).toBe(false);
    });

    it('should detect vegan-friendly food', () => {
      expect(veganMakanan.dapatDimakanSebagai('vegan')).toBe(true);
    });

    it('should detect non-vegan food', () => {
      expect(ketoMakanan.dapatDimakanSebagai('vegan')).toBe(false);
    });

    it('should check diet compatibility correctly', () => {
      expect(vegetarianMakanan.dapatDimakanSebagai('vegetarian')).toBe(true);
      expect(vegetarianMakanan.dapatDimakanSebagai('paleo')).toBe(true);
      expect(vegetarianMakanan.dapatDimakanSebagai('keto')).toBe(false);

      expect(ketoMakanan.dapatDimakanSebagai('keto')).toBe(true);
      expect(ketoMakanan.dapatDimakanSebagai('vegetarian')).toBe(false);
    });
  });

  describe('toJSON method', () => {
    it('should serialize to JSON correctly', () => {
      const makanan = new MakananIndonesia(
        'mkn-test-001',
        'Nasi Uduk',
        ['Nasi Kuning'],
        KategoriMakanan.MAKANAN_POKOK,
        ['Jawa'],
        [],
        {},
        {},
        [],
        [],
        [CaraMasak.KUKUS],
        true,
        true,
        ['kacang'],
        TingkatKepopuleran.CUKUP_POPULER,
        'seluruh_indonesia',
        true,
        { minimal: 10000, maksimal: 15000, mataUang: 12000 }
      );

      const json = makanan.toJSON();

      expect(json.id).toBe('mkn-test-001');
      expect(json.nama).toBe('Nasi Uduk');
      expect(json.kategori).toBe('makanan_pokok');
      expect(json.namaLain).toEqual(['Nasi Kuning']);
      expect(json.halalCertified).toBe(true);
      expect(json.isVegetarian).toBe(true);
      expect(json.alergen).toEqual(['kacang']);
    });
  });
});

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
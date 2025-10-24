/**
 * Indonesian Food Data Migration
 * Populates the makanan_indonesia table with common Indonesian foods
 * Location: src/core/data/local/migrations/002_indonesian_food_data.ts
 */

import { Migration, DatabaseTransaction } from './Migration';

export class IndonesianFoodDataMigration extends Migration {
  constructor() {
    super('1.1.0', 'Populate Indonesian food database with common foods');
  }

  async up(transaction: DatabaseTransaction): Promise<void> {
    const currentTime = Date.now();

    const indonesianFoods = [
      // Makanan Pokok
      {
        id: 'mk-001',
        nama: 'Nasi Putih',
        kategori: 'makanan_pokok',
        asal: '["Jawa", "Sumatera", "Bali", "Sulawesi"]',
        daerah: '{"provinsi": ["Jawa", "Sumatera Barat", "Bali"], "kota": ["Jakarta", "Bandung", "Surabaya"], "musiman": ["hijau", "kemarau"]}',
        nutrisi_per_100g: '{"kalori": 130, "protein": 2.7, "karbohidrat": 28, "lemak": 0.3, "serat": 0.4, "garam": 1, "gula": 0.1, "vitaminA": 0, "vitaminC": 0, "kalsium": 10, "zatBesi": 0.5, "folat": 8}',
        porsi_standar: '[{"id": "1-sendok", "nama": "1 sendok makan", "beratGram": 15, "deskripsi": "Nasi putih standar"}, {"id": "1-piring", "nama": "1 piring", "beratGram": 200, "deskripsi": "Porsi nasi standar"}]',
        informasi_bahan: '[{"nama": "Beras", "persentase": 100, "kategori": "karbohidrat"}]',
        cara_masak: '["rebus"]',
        halal_certified: 1,
        is_vegetarian: 1,
        is_vegan: 1,
        alergen: '[]',
        popularitas: 10,
        ketersediaan: 'seluruh_indonesia',
        musiman_hijau: 0,
        perkiraan_harga: '{"minimal": 8000, "maksimal": 15000, "mataUang": 12000}'
      },
      {
        id: 'mk-002',
        nama: 'Nasi Goreng',
        kategori: 'makanan_pokok',
        asal: '["Jawa", "Sumatera"]',
        daerah: '{"provinsi": ["Jawa", "Sumatera Barat"], "kota": ["Jakarta", "Bandung", "Surabaya"], "musiman": ["hijau", "kemarau"]}',
        nutrisi_per_100g: '{"kalori": 165, "protein": 7, "karbohidrat": 30, "lemak": 4, "serat": 1, "garam": 300, "gula": 5, "vitaminA": 200, "vitaminC": 20, "kalsium": 30, "zatBesi": 2, "folat": 6}',
        porsi_standar: '[{"id": "1-piring", "nama": "1 piring", "beratGram": 300, "deskripsi": "Nasi goreng dengan telur dan sayuran"}]',
        informasi_bahan: '[{"nama": "Nasi", "persentase": 60, "kategori": "karbohidrat"}, {"nama": "Telur", "persentase": 20, "kategori": "protein_hewani"}, {"nama": "Sayuran", "persentase": 15, "kategori": "sayuran"}, {"nama": "Kecap", "persentase": 5, "kategori": "rempah"}]',
        cara_masak: '["goreng"]',
        halal_certified: 1,
        is_vegetarian: 0,
        is_vegan: 0,
        alergen: '["telur", "kecap"]',
        popularitas: 10,
        ketersediaan: 'seluruh_indonesia',
        musiman_hijau: 0,
        perkiraan_harga: '{"minimal": 15000, "maksimal": 25000, "mataUang": 20000}'
      },
      // Lauk Pauk
      {
        id: 'mk-003',
        nama: 'Ayam Bakar',
        kategori: 'lauk_pauk',
        asal: '["Jawa", "Sumatera"]',
        daerah: '{"provinsi": ["Jawa", "Sumatera Barat"], "kota": ["Jakarta", "Bandung", "Yogyakarta"], "musiman": ["hijau", "kemarau"]}',
        nutrisi_per_100g: '{"kalori": 190, "protein": 25, "karbohidrat": 3, "lemak": 8, "serat": 0.5, "garam": 400, "gula": 8, "vitaminA": 100, "vitaminC": 5, "kalsium": 15, "zatBesi": 2, "folat": 5}',
        porsi_standar: '[{"id": "1-potong", "nama": "1 potong", "beratGram": 150, "deskripsi": "Ayam bakar dengan bumbu kecap"}]',
        informasi_bahan: '[{"nama": "Ayam", "persentase": 85, "kategori": "protein_hewani"}, {"nama": "Kecap", "persentase": 10, "kategori": "rempah"}, {"nama": "Bumbu", "persentase": 5, "kategori": "rempah"}]',
        cara_masak: '["bakar"]',
        halal_certified: 1,
        is_vegetarian: 0,
        is_vegan: 0,
        alergen: '["kedelai"]',
        popularitas: 9,
        ketersediaan: 'seluruh_indonesia',
        musiman_hijau: 0,
        perkiraan_harga: '{"minimal": 20000, "maksimal": 35000, "mataUang": 25000}'
      },
      {
        id: 'mk-004',
        nama: 'Rendang Padang',
        kategori: 'lauk_pauk',
        asal: '["Sumatera Barat"]',
        daerah: '{"provinsi": ["Sumatera Barat"], "kota": ["Padang", "Bukittinggi", "Payakumbuh"], "musiman": ["hijau", "kemarau"]}',
        nutrisi_per_100g: '{"kalori": 220, "protein": 28, "karbohidrat": 5, "lemak": 12, "serat": 1, "garam": 600, "gula": 10, "vitaminA": 150, "vitaminC": 8, "kalsium": 20, "zatBesi": 3, "folat": 7}',
        porsi_standar: '[{"id": "1-potong", "nama": "1 potong", "beratGram": 100, "deskripsi": "Rendang daging sapi pedas"}]',
        informasi_bahan: '[{"nama": "Daging Sapi", "persentase": 70, "kategori": "protein_hewani"}, {"nama": "Santan", "persentase": 25, "kategori": "lemak"}, {"nama": "Cabai", "persentase": 5, "kategori": "rempah"}]',
        cara_masak: '["rebus", "goreng"]',
        halal_certified: 1,
        is_vegetarian: 0,
        is_vegan: 0,
        alergen: '["santan"]',
        popularitas: 10,
        ketersediaan: 'seluruh_indonesia',
        musiman_hijau: 0,
        perkiraan_harga: '{"minimal": 30000, "maksimal": 50000, "mataUang": 40000}'
      },
      // Sayuran
      {
        id: 'mk-005',
        nama: 'Sayur Sop',
        kategori: 'sayuran',
        asal: '["Jawa"]',
        daerah: '{"provinsi": ["Jawa", "Sumatera Barat"], "kota": ["Jakarta", "Bandung", "Surabaya"], "musiman": ["hijau", "kemarau"]}',
        nutrisi_per_100g: '{"kalori": 35, "protein": 2, "karbohidrat": 6, "lemak": 1, "serat": 2, "garam": 200, "gula": 3, "vitaminA": 300, "vitaminC": 25, "kalsium": 40, "zatBesi": 1, "folat": 30}',
        porsi_standar: '[{"id": "1-mangkok", "nama": "1 mangkok", "beratGram": 250, "deskripsi": "Sayur sop campuran sayuran segar"}]',
        informasi_bahan: '[{"nama": "Wortel", "persentase": 25, "kategori": "sayuran"}, {"nama": "Kubis", "persentase": 25, "kategori": "sayuran"}, {"nama": "Kacang Polong", "persentase": 20, "kategori": "sayuran"}, {"nama": "Kentang", "persentase": 30, "kategori": "karbohidrat"}]',
        cara_masak: '["rebus"]',
        halal_certified: 1,
        is_vegetarian: 1,
        is_vegan: 1,
        alergen: '[]',
        popularitas: 8,
        ketersediaan: 'seluruh_indonesia',
        musiman_hijau: 0,
        perkiraan_harga: '{"minimal": 10000, "maksimal": 15000, "mataUang": 12000}'
      },
      {
        id: 'mk-006',
        nama: 'Gado-Gado',
        kategori: 'sayuran',
        asal: '["Jawa"]',
        daerah: '{"provinsi": ["Jawa"], "kota": ["Jakarta", "Bandung", "Yogyakarta"], "musiman": ["hijau", "kemarau"]}',
        nutrisi_per_100g: '{"kalori": 120, "protein": 6, "karbohidrat": 15, "lemak": 5, "serat": 3, "garam": 250, "gula": 8, "vitaminA": 400, "vitaminC": 35, "kalsium": 80, "zatBesi": 2, "folat": 40}',
        porsi_standar: '[{"id": "1-piring", "nama": "1 piring", "beratGram": 300, "deskripsi": "Gado-gado dengan bumbu kacang"}]',
        informasi_bahan: '[{"nama": "Sayuran Rebus", "persentase": 60, "kategori": "sayuran"}, {"nama": "Tahu", "persentase": 15, "kategori": "protein_nabati"}, {"nama": "Telur", "persentase": 10, "kategori": "protein_hewani"}, {"nama": "Bumbu Kacang", "persentase": 15, "kategori": "lemak"}]',
        cara_masak: '["rebus"]',
        halal_certified: 1,
        is_vegetarian: 1,
        is_vegan: 0,
        alergen: '["kacang", "telur"]',
        popularitas: 9,
        ketersediaan: 'seluruh_indonesia',
        musiman_hijau: 0,
        perkiraan_harga: '{"minimal": 15000, "maksimal": 25000, "mataUang": 20000}'
      },
      // Jajanan
      {
        id: 'mk-007',
        nama: 'Sate Ayam',
        kategori: 'jajanan',
        asal: '["Jawa", "Madura"]',
        daerah: '{"provinsi": ["Jawa Timur", "Jawa Tengah"], "kota": ["Surabaya", "Malang", "Solo"], "musiman": ["hijau", "kemarau"]}',
        nutrisi_per_100g: '{"kalori": 180, "protein": 22, "karbohidrat": 8, "lemak": 7, "serat": 0.5, "garam": 350, "gula": 12, "vitaminA": 120, "vitaminC": 10, "kalsium": 18, "zatBesi": 2.5, "folat": 8}',
        porsi_standar: '[{"id": "10-tusuk", "nama": "10 tusuk", "beratGram": 200, "deskripsi": "Sate ayam dengan bumbu kacang"}]',
        informasi_bahan: '[{"nama": "Ayam", "persentase": 75, "kategori": "protein_hewani"}, {"nama": "Kecap", "persentase": 15, "kategori": "rempah"}, {"nama": "Bumbu Kacang", "persentase": 10, "kategori": "lemak"}]',
        cara_masak: '["bakar", "panggang"]',
        halal_certified: 1,
        is_vegetarian: 0,
        is_vegan: 0,
        alergen: '["kacang", "kedelai"]',
        popularitas: 10,
        ketersediaan: 'seluruh_indonesia',
        musiman_hijau: 0,
        perkiraan_harga: '{"minimal": 25000, "maksimal": 40000, "mataUang": 30000}'
      },
      {
        id: 'mk-008',
        nama: 'Bakso',
        kategori: 'jajanan',
        asal: '["Jawa"]',
        daerah: '{"provinsi": ["Jawa"], "kota": ["Jakarta", "Bandung", "Malang"], "musiman": ["hijau", "kemarau"]}',
        nutrisi_per_100g: '{"kalori": 160, "protein": 18, "karbohidrat": 10, "lemak": 6, "serat": 0.8, "garam": 400, "gula": 3, "vitaminA": 80, "vitaminC": 5, "kalsium": 25, "zatBesi": 2, "folat": 15}',
        porsi_standar: '[{"id": "1-mangkok", "nama": "1 mangkok", "beratGram": 350, "deskripsi": "Bakso dengan kuah dan mie"}]',
        informasi_bahan: '[{"nama": "Daging Sapi", "persentase": 60, "kategori": "protein_hewani"}, {"nama": "Tepung", "persentase": 25, "kategori": "karbohidrat"}, {"nama": "Bumbu", "persentase": 15, "kategori": "rempah"}]',
        cara_masak: '["rebus"]',
        halal_certified: 1,
        is_vegetarian: 0,
        is_vegan: 0,
        alergen: '["garam"]',
        popularitas: 10,
        ketersediaan: 'seluruh_indonesia',
        musiman_hijau: 0,
        perkiraan_harga: '{"minimal": 15000, "maksimal": 25000, "mataUang": 20000}'
      },
      // Buah-buahan
      {
        id: 'mk-009',
        nama: 'Pisang',
        kategori: 'buah',
        asal: '["Indonesia"]',
        daerah: '{"provinsi": ["Sumatera", "Jawa", "Kalimantan", "Sulawesi"], "kota": [], "musiman": ["hijau", "kemarau"]}',
        nutrisi_per_100g: '{"kalori": 89, "protein": 1.1, "karbohidrat": 23, "lemak": 0.3, "serat": 2.6, "garam": 1, "gula": 12, "vitaminA": 64, "vitaminC": 8.7, "kalsium": 5, "zatBesi": 0.3, "folat": 20}',
        porsi_standar: '[{"id": "1-buah", "nama": "1 buah", "beratGram": 120, "deskripsi": "Pisang ambon atau raja"}]',
        informasi_bahan: '[{"nama": "Pisang", "persentase": 100, "kategori": "buah"}]',
        cara_masak: '["mentah"]',
        halal_certified: 1,
        is_vegetarian: 1,
        is_vegan: 1,
        alergen: '[]',
        popularitas: 9,
        ketersediaan: 'seluruh_indonesia',
        musiman_hijau: 0,
        perkiraan_harga: '{"minimal": 2000, "maksimal": 5000, "mataUang": 3000}'
      },
      {
        id: 'mk-010',
        nama: 'Jeruk',
        kategori: 'buah',
        asal: '["Indonesia"]',
        daerah: '{"provinsi": ["Sumatera", "Jawa", "Kalimantan"], "kota": [], "musiman": ["hijau", "kemarau"]}',
        nutrisi_per_100g: '{"kalori": 47, "protein": 0.9, "karbohidrat": 12, "lemak": 0.1, "serat": 2.4, "garam": 0, "gula": 9, "vitaminA": 225, "vitaminC": 53.2, "kalsium": 40, "zatBesi": 0.1, "folat": 30}',
        porsi_standar: '[{"id": "1-buah", "nama": "1 buah", "beratGram": 200, "deskripsi": "Jeruk manis atau keprok"}]',
        informasi_bahan: '[{"nama": "Jeruk", "persentase": 100, "kategori": "buah"}]',
        cara_masak: '["mentah"]',
        halal_certified: 1,
        is_vegetarian: 1,
        is_vegan: 1,
        alergen: '[]',
        popularitas: 8,
        ketersediaan: 'seluruh_indonesia',
        musiman_hijau: 0,
        perkiraan_harga: '{"minimal": 3000, "maksimal": 8000, "mataUang": 5000}'
      }
    ];

    for (const food of indonesianFoods) {
      await transaction.execute(`
        INSERT INTO makanan_indonesia (
          id, nama, kategori, asal, daerah, nutrisi_per_100g, porsi_standar,
          informasi_bahan, cara_masak, halal_certified, is_vegetarian, is_vegan,
          alergen, popularitas, ketersediaan, musiman_hijau, perkiraan_harga,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        food.id, food.nama, food.kategori, food.asal, food.daerah,
        food.nutrisi_per_100g, food.porsi_standar, food.informasi_bahan,
        food.cara_masak, food.halal_certified, food.is_vegetarian,
        food.is_vegan, food.alergen, food.popularitas, food.ketersediaan,
        food.musiman_hijau, food.perkiraan_harga, currentTime, currentTime
      ]);
    }

    console.log(`[Migration] Inserted ${indonesianFoods.length} Indonesian foods`);
  }

  async down(transaction: DatabaseTransaction): Promise<void> {
    // Remove all Indonesian food data
    await transaction.execute('DELETE FROM makanan_indonesia WHERE id LIKE "mk-%"');
    console.log('[Migration] Removed Indonesian food data');
  }
}
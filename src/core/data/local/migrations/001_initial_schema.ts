/**
 * Initial Schema Migration
 * Creates the base database schema for HealthyCoaching Indonesia
 * Location: src/core/data/local/migrations/001_initial_schema.ts
 */

import { Migration, DatabaseTransaction } from './Migration';

export class InitialSchemaMigration extends Migration {
  constructor() {
    super('1.0.0', 'Initial schema - users, makanan_indonesia, and basic tracking');
  }

  async up(transaction: DatabaseTransaction): Promise<void> {
    // Users table
    await transaction.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        profile_data TEXT NOT NULL,
        preferences TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Indonesian food database
    await transaction.execute(`
      CREATE TABLE IF NOT EXISTS makanan_indonesia (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        nama_lain TEXT,
        kategori TEXT NOT NULL,
        asal TEXT,
        daerah TEXT NOT NULL,
        nutrisi_per_100g TEXT NOT NULL,
        porsi_standar TEXT NOT NULL,
        gambar TEXT,
        informasi_bahan TEXT NOT NULL,
        cara_masak TEXT NOT NULL,
        halal_certified INTEGER NOT NULL,
        is_vegetarian INTEGER NOT NULL,
        is_vegan INTEGER NOT NULL,
        alergen TEXT,
        popularitas INTEGER NOT NULL,
        ketersediaan TEXT NOT NULL,
        musiman_hijau INTEGER NOT NULL,
        perkiraan_harga TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Food tracking logs
    await transaction.execute(`
      CREATE TABLE IF NOT EXISTS makanan_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        makanan_id TEXT NOT NULL,
        porsi_index INTEGER NOT NULL,
        waktu_makan TEXT NOT NULL,
        catatan TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (makanan_id) REFERENCES makanan_indonesia(id) ON DELETE RESTRICT
      )
    `);

    // User goals and health data
    await transaction.execute(`
      CREATE TABLE IF NOT EXISTS user_goals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        jenis TEXT NOT NULL,
        target REAL,
        target_tanggal INTEGER,
        is_active INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Workout data
    await transaction.execute(`
      CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        deskripsi TEXT,
        tipe TEXT NOT NULL,
        durasi_menit INTEGER NOT NULL,
        kalori_per_menit REAL,
        tingkat_kesulitan TEXT NOT NULL,
        peralatan TEXT,
        instruksi TEXT,
        gambar TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Workout logs
    await transaction.execute(`
      CREATE TABLE IF NOT EXISTS workout_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        workout_id TEXT NOT NULL,
        durasi_menit INTEGER NOT NULL,
        kalori_terbakar REAL,
        catatan TEXT,
        selesai INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE RESTRICT
      )
    `);

    // Water intake tracking
    await transaction.execute(`
      CREATE TABLE IF NOT EXISTS air_intake_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        jumlah_ml INTEGER NOT NULL,
        waktu_minum INTEGER NOT NULL,
        catatan TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // User health metrics
    await transaction.execute(`
      CREATE TABLE IF NOT EXISTS health_metrics (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        tanggal INTEGER NOT NULL,
        berat_badan REAL,
        tinggi_badan REAL,
        tekanan_darah_sistolik INTEGER,
        tekanan_darah_diastolik INTEGER,
        detak_jantung INTEGER,
        catatan TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, tanggal)
      )
    `);

    // Nutrition goals
    await transaction.execute(`
      CREATE TABLE IF NOT EXISTS nutrition_goals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        tanggal DATE NOT NULL,
        target_kalori REAL NOT NULL,
        target_protein REAL,
        target_karbohidrat REAL,
        target_lemak REAL,
        target_serat REAL,
        target_garam INTEGER,
        target_gula REAL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, tanggal)
      )
    `);

    // Create indexes for better performance
    await transaction.execute('CREATE INDEX IF NOT EXISTS idx_makanan_logs_user_id ON makanan_logs(user_id)');
    await transaction.execute('CREATE INDEX IF NOT EXISTS idx_makanan_logs_created_at ON makanan_logs(created_at)');
    await transaction.execute('CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON workout_logs(user_id)');
    await transaction.execute('CREATE INDEX IF NOT EXISTS idx_workout_logs_created_at ON workout_logs(created_at)');
    await transaction.execute('CREATE INDEX IF NOT EXISTS idx_air_intake_logs_user_id ON air_intake_logs(user_id)');
    await transaction.execute('CREATE INDEX IF NOT EXISTS idx_makanan_indonesia_kategori ON makanan_indonesia(kategori)');
    await transaction.execute('CREATE INDEX IF NOT EXISTS idx_makanan_indonesia_popularitas ON makanan_indonesia(popularitas)');
  }

  async down(transaction: DatabaseTransaction): Promise<void> {
    // Drop indexes first
    await transaction.execute('DROP INDEX IF EXISTS idx_air_intake_logs_user_id');
    await transaction.execute('DROP INDEX IF EXISTS idx_workout_logs_created_at');
    await transaction.execute('DROP INDEX IF EXISTS idx_workout_logs_user_id');
    await transaction.execute('DROP INDEX IF EXISTS idx_makanan_logs_created_at');
    await transaction.execute('DROP INDEX IF EXISTS idx_makanan_logs_user_id');
    await transaction.execute('DROP INDEX IF EXISTS idx_makanan_indonesia_popularitas');
    await transaction.execute('DROP INDEX IF EXISTS idx_makanan_indonesia_kategori');

    // Drop tables in reverse order (due to foreign keys)
    await transaction.execute('DROP TABLE IF EXISTS nutrition_goals');
    await transaction.execute('DROP TABLE IF EXISTS health_metrics');
    await transaction.execute('DROP TABLE IF EXISTS air_intake_logs');
    await transaction.execute('DROP TABLE IF EXISTS workout_logs');
    await transaction.execute('DROP TABLE IF EXISTS workouts');
    await transaction.execute('DROP TABLE IF EXISTS user_goals');
    await transaction.execute('DROP TABLE IF EXISTS makanan_logs');
    await transaction.execute('DROP TABLE IF EXISTS makanan_indonesia');
    await transaction.execute('DROP TABLE IF EXISTS users');
  }
}
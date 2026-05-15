-- UPDATE DATABASE PAIBP ASSESSMENT
-- Pastikan tidak menghapus data yang sudah ada

-- 1. Buat tabel app_data jika belum ada (untuk sinkronisasi JSON)
CREATE TABLE IF NOT EXISTS app_data (
  key_name TEXT PRIMARY KEY,
  data_json TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Pastikan tabel users ada
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'guru'
);

-- 3. Tabel pendukung relasional (jika belum ada)
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(50) PRIMARY KEY,
    nis VARCHAR(20) UNIQUE NOT NULL,
    nisn VARCHAR(20),
    name VARCHAR(150) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

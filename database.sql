-- Tabel Tahun Ajaran & Kelas
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Siswa
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(50) PRIMARY KEY,
    nis VARCHAR(20) UNIQUE NOT NULL,
    nisn VARCHAR(20),
    name VARCHAR(150) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Tabel Nilai Mingguan
CREATE TABLE IF NOT EXISTS weekly_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    semester INT NOT NULL,
    week_number INT NOT NULL,
    score DECIMAL(5,2),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_weekly_score (student_id, class_id, semester, week_number)
);

-- Tabel Nilai Sumatif Akhir Semester (SAS)
CREATE TABLE IF NOT EXISTS sas_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    score DECIMAL(5,2),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_sas_score (student_id, class_id)
);

-- Tabel Nilai Praktik (JSON atau Relasional, di sini disederhanakan dengan JSON agar fleksibel seperti State)
CREATE TABLE IF NOT EXISTS practice_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    wudhu_data JSON,
    quran_data JSON,
    sholat_p_data JSON,
    sholat_k_data JSON,
    tayamum_data JSON,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_practice_score (student_id, class_id)
);

-- Tabel Nilai Asesmen Sumatif Akhir Jenjang (ASAJ) - Khusus Kelas 6
CREATE TABLE IF NOT EXISTS asaj_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    pg_score DECIMAL(5,2),
    essay_score DECIMAL(5,2),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_asaj_score (student_id)
);

-- ==========================================
-- DATA AWAL (Kelas & Siswa Kelas 1)
-- ==========================================

INSERT INTO classes (id, name, academic_year) VALUES
('c1', 'Kelas 1', '2025/2026'),
('c2', 'Kelas 2', '2025/2026'),
('c3', 'Kelas 3', '2025/2026'),
('c4', 'Kelas 4', '2025/2026'),
('c5', 'Kelas 5', '2025/2026'),
('c6', 'Kelas 6', '2025/2026');

-- Insert 32 Siswa Kelas 1
INSERT INTO students (id, nis, nisn, name, class_id) VALUES
('s000', '4644', '3181571403', 'ADFIN LOIN PRATAMA', 'c1'),
('s001', '4645', '3194913376', 'AFSHI MAULA AZAHRA', 'c1'),
('s002', '4646', '3183123462', 'AHMAD UMAY REZA SAPUTRA', 'c1'),
('s003', '4647', '3193485376', 'AINUN SHAKILA FEBRIANI', 'c1'),
('s004', '4648', '3199688695', 'AISYAH NUSAIBAH ABDULLAH', 'c1'),
('s005', '4649', '3191364451', 'AISYAH SHIDQIA RAMADHANI', 'c1'),
('s006', '4650', '3192441611', 'AKHTAR ZIDANE PRADITA', 'c1'),
('s007', '4651', '3187778549', 'AKIFA NAILA', 'c1'),
('s008', '4652', '3193470146', 'ALZAN ATHAR HAMIZAN', 'c1'),
('s009', '4653', '3189473148', 'ARSY OKTAVIANI', 'c1'),
('s010', '4654', '3195743164', 'DEA LESTARI', 'c1'),
('s011', '4655', '3188879475', 'HILDA APRILIANI', 'c1'),
('s012', '4656', '3195743164', 'KAHYANG OKTA ANGGRAINI', 'c1'),
('s013', '4657', '3196053053', 'KANAYATUL MARYAM', 'c1'),
('s014', '4658', '3192681581', 'KHAERUL MIZWAN', 'c1'),
('s015', '4659', '3185968058', 'M. HAFIDZ ARIANSYAH', 'c1'),
('s016', '4660', '3185807810', 'M.NAZRIL MAULANA YUSUP', 'c1'),
('s017', '4662', '3192681581', 'MEDINA HADI SHAFIRA', 'c1'),
('s018', '4663', '3194465408', 'MOHAMAD JAKA BILAL IBRAHIM', 'c1'),
('s019', '4664', '3180041343', 'MOH. ERWIN AL KHASBI', 'c1'),
('s020', '4665', '3172914312', 'MUHAMAD ARSA MAULANA', 'c1'),
('s021', '4666', '3179560296', 'MUHAMAD ARYA MAOLANA', 'c1'),
('s022', '4667', '3195441369', 'MUHAMMAD FAQIH SYAPUTRA', 'c1'),
('s023', '4668', '3185032825', 'MUHAMAD AL AQSO', 'c1'),
('s024', '4669', '3182870970', 'MUHAMMAD ABDUL MUIZ', 'c1'),
('s025', '4670', '3181635758', 'MUHAMMAD KEANU', 'c1'),
('s026', '4671', '3187418273', 'NESYA KARTIKA DEWI', 'c1'),
('s027', '4672', '3183741719', 'RANIA NOVA PUTRI', 'c1'),
('s028', '4673', '3194294239', 'RANIA RAMADANI', 'c1'),
('s029', '4674', '3180161004', 'SITI ALIFAH NAZIRA', 'c1'),
('s030', '4675', '3194373627', 'SITI AYU SALU', 'c1'),
('s031', '4676', '3197646592', 'WAFI ILHAM MULYONO', 'c1');

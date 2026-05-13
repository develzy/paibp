CREATE TABLE IF NOT EXISTS app_data (
    key_name TEXT PRIMARY KEY,
    data_json TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initialize users table in D1
CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    name TEXT
);

INSERT OR IGNORE INTO users (username, password, name) VALUES ('guru', 'paibp123', 'Guru PAIBP');

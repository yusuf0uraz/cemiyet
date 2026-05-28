-- Firebase + R2 migrasyonu
-- Mevcut veritabanında çalıştır: psql $DATABASE_URL -f src/db/migrate_firebase.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- Artık kullanılmayan SMS kodları tablosunu sil (isteğe bağlı)
-- DROP TABLE IF EXISTS sms_codes;

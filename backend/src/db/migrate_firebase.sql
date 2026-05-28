-- Firebase + R2 + eksik tablo migrasyonu
-- Mevcut veritabanında çalıştır: psql $DATABASE_URL -f src/db/migrate_firebase.sql

-- Kullanıcı tablosu güncellemeleri
ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- Kullanıcı ilgi alanları tablosu
CREATE TABLE IF NOT EXISTS user_interests (
  user_id   UUID        REFERENCES users(id) ON DELETE CASCADE,
  category  VARCHAR(30) NOT NULL,
  PRIMARY KEY (user_id, category)
);

-- Cemiyet üyelik modeli
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS membership_model VARCHAR(10) DEFAULT 'acik';
UPDATE clubs SET membership_model = 'acik' WHERE membership_model IS NULL;

-- Cemiyet katılım talepleri
CREATE TABLE IF NOT EXISTS club_join_requests (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID        REFERENCES users(id) ON DELETE CASCADE,
  club_id          UUID        REFERENCES clubs(id) ON DELETE CASCADE,
  status           VARCHAR(10) DEFAULT 'bekliyor',
  application_note TEXT        DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, club_id)
);
ALTER TABLE club_join_requests ADD COLUMN IF NOT EXISTS application_note TEXT DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_join_requests_club ON club_join_requests(club_id, status);

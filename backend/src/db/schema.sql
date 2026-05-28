-- CemiApp Veritabanı Şeması

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Kullanıcılar
CREATE TABLE IF NOT EXISTS users (
  id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone        VARCHAR(20)  UNIQUE NOT NULL,
  firebase_uid VARCHAR(128) UNIQUE,
  name         VARCHAR(100) NOT NULL,
  username     VARCHAR(50)  UNIQUE NOT NULL,
  bio          TEXT         DEFAULT '',
  city         VARCHAR(100) DEFAULT 'Elazığ',
  avatar_tone  CHAR(1)      DEFAULT '1' CHECK (avatar_tone IN ('1','2','3','4','5')),
  avatar_url   TEXT,
  verified     BOOLEAN      DEFAULT false,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- Cemiyetler
CREATE TABLE IF NOT EXISTS clubs (
  id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(100) NOT NULL,
  cat          VARCHAR(30)  NOT NULL,
  photo        TEXT,
  description  TEXT         DEFAULT '',
  city         VARCHAR(100) DEFAULT 'Elazığ',
  member_count INT          DEFAULT 1,
  created_by   UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

-- Cemiyet üyelikleri
CREATE TABLE IF NOT EXISTS club_members (
  user_id    UUID        REFERENCES users(id) ON DELETE CASCADE,
  club_id    UUID        REFERENCES clubs(id) ON DELETE CASCADE,
  role       VARCHAR(20) DEFAULT 'aza' CHECK (role IN ('reis','yardimci','aza')),
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, club_id)
);
CREATE INDEX IF NOT EXISTS idx_club_members_club ON club_members(club_id);

-- Etkinlikler
CREATE TABLE IF NOT EXISTS events (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(200) NOT NULL,
  cat         VARCHAR(30)  NOT NULL,
  club_id     UUID         REFERENCES clubs(id) ON DELETE SET NULL,
  club_name   VARCHAR(100) NOT NULL,
  date        VARCHAR(50)  NOT NULL,
  time        VARCHAR(10)  NOT NULL,
  place       VARCHAR(200) NOT NULL,
  capacity    INT,
  count       INT          DEFAULT 0,
  photo       TEXT,
  is_live     BOOLEAN      DEFAULT false,
  free        BOOLEAN      DEFAULT true,
  created_by  UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_cat ON events(cat);
CREATE INDEX IF NOT EXISTS idx_events_club ON events(club_id);

-- Etkinlik katılımcıları
CREATE TABLE IF NOT EXISTS event_participants (
  user_id    UUID        REFERENCES users(id) ON DELETE CASCADE,
  event_id   UUID        REFERENCES events(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, event_id)
);

-- Etkinlik yer imleri
CREATE TABLE IF NOT EXISTS event_bookmarks (
  user_id     UUID        REFERENCES users(id) ON DELETE CASCADE,
  event_id    UUID        REFERENCES events(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, event_id)
);

-- Duvar gönderileri
CREATE TABLE IF NOT EXISTS wall_posts (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id          UUID        REFERENCES clubs(id) ON DELETE CASCADE,
  author_id        UUID        REFERENCES users(id) ON DELETE SET NULL,
  text             TEXT        NOT NULL,
  is_announcement  BOOLEAN     DEFAULT false,
  has_photo        BOOLEAN     DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wall_posts_club ON wall_posts(club_id);

-- Duvar reaksiyonları
CREATE TABLE IF NOT EXISTS wall_reactions (
  post_id     UUID        REFERENCES wall_posts(id) ON DELETE CASCADE,
  user_id     UUID        REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(20) NOT NULL CHECK (type IN ('bravo','geliyorum','super','tebrik')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id, type)
);

-- Takip sistemi
CREATE TABLE IF NOT EXISTS follows (
  follower_id  UUID        REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID        REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

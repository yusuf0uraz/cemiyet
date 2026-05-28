ALTER TABLE clubs ADD COLUMN IF NOT EXISTS membership_model VARCHAR(10) DEFAULT 'acik' CHECK (membership_model IN ('acik','onay','kapali'));

CREATE TABLE IF NOT EXISTS club_join_requests (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        REFERENCES users(id) ON DELETE CASCADE,
  club_id    UUID        REFERENCES clubs(id) ON DELETE CASCADE,
  status     VARCHAR(10) DEFAULT 'bekliyor' CHECK (status IN ('bekliyor','onaylandi','reddedildi')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, club_id)
);

CREATE INDEX IF NOT EXISTS idx_join_requests_club ON club_join_requests(club_id, status);

UPDATE clubs SET membership_model = 'acik' WHERE membership_model IS NULL;

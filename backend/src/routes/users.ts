import { Router } from 'express';
import { pool } from '../db/pool';
import { requireAuth } from '../middleware/auth';

const router = Router();

// POST /users/interests — ilgi alanlarını kaydet (ÖNCE spesifik route'lar)
router.post('/interests', requireAuth, async (req, res) => {
  const { categories } = req.body as { categories: string[] };
  if (!Array.isArray(categories) || categories.length === 0) {
    res.status(400).json({ error: 'Kategori listesi gerekli' }); return;
  }
  await pool.query('DELETE FROM user_interests WHERE user_id = $1', [req.userId]);
  for (const cat of categories) {
    await pool.query(
      'INSERT INTO user_interests (user_id, category) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.userId, cat]
    );
  }
  res.json({ saved: true, categories });
});

// GET /users/interests — ilgi alanlarını getir
router.get('/interests', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT category FROM user_interests WHERE user_id = $1',
    [req.userId]
  );
  res.json(rows.map((r: { category: string }) => r.category));
});

// GET /users/me — kendi profili (kısayol)
router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, name, username, bio, city, avatar_tone, avatar_url, verified FROM users WHERE id = $1',
    [req.userId]
  );
  if (rows.length === 0) { res.status(404).json({ error: 'Kullanıcı bulunamadı' }); return; }
  res.json(rows[0]);
});

// GET /users/:id — açık profil (SONRA parametrik route)
router.get('/:id', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT
       u.id, u.name, u.username, u.bio, u.city, u.avatar_tone, u.avatar_url, u.verified,
       (SELECT COUNT(*) FROM follows WHERE following_id = u.id)::int AS follower_count,
       (SELECT COUNT(*) FROM follows WHERE follower_id  = u.id)::int AS following_count,
       (SELECT COUNT(*) FROM event_participants WHERE user_id = u.id)::int  AS event_count,
       (SELECT COUNT(*) FROM club_members  WHERE user_id = u.id)::int  AS club_count
     FROM users u
     WHERE u.id = $1`,
    [req.params.id]
  );
  if (rows.length === 0) {
    res.status(404).json({ error: 'Kullanıcı bulunamadı' }); return;
  }
  res.json(rows[0]);
});

// GET /users/:id/events — katıldığı etkinlikler
router.get('/:id/events', async (req, res) => {
  const { limit = '10', offset = '0' } = req.query as Record<string, string>;
  const { rows } = await pool.query(
    `SELECT e.id, e.title, e.cat, e.date, e.time, e.place, e.club_name
     FROM events e
     JOIN event_participants ep ON ep.event_id = e.id
     WHERE ep.user_id = $1
     ORDER BY ep.joined_at DESC
     LIMIT $2 OFFSET $3`,
    [req.params.id, Number(limit), Number(offset)]
  );
  res.json(rows);
});

export default router;

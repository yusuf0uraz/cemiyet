import { Router } from 'express';
import { body } from 'express-validator';
import { pool } from '../db/pool';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/errorHandler';

const router = Router();

// GET /events/me/bookmarks — ÖNCE tanımlanmalı, /:id ile çakışmasın
router.get('/me/bookmarks', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT e.*,
       (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id)::int AS count
     FROM events e
     JOIN event_bookmarks b ON b.event_id = e.id
     WHERE b.user_id = $1 ORDER BY b.created_at DESC`,
    [req.userId]
  );
  res.json(rows);
});

// GET /events/me/joined — katıldığım etkinlikler
router.get('/me/joined', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT e.*,
       (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id)::int AS count
     FROM events e
     JOIN event_participants ep ON ep.event_id = e.id
     WHERE ep.user_id = $1 ORDER BY ep.joined_at DESC`,
    [req.userId]
  );
  res.json(rows);
});

// GET /events — liste (isteğe bağlı: ?cat=tenis&live=true&club_id=...&q=ara)
router.get('/', optionalAuth, async (req, res) => {
  const { cat, live, limit = '20', offset = '0', club_id, q } = req.query as Record<string, string>;

  // Giriş yapmışsa ilgi alanlarını al
  let userInterests: string[] = [];
  if (req.userId) {
    const { rows } = await pool.query(
      'SELECT category FROM user_interests WHERE user_id = $1',
      [req.userId]
    );
    userInterests = rows.map((r: { category: string }) => r.category);
  }

  const hasInterests = userInterests.length > 0;
  let sql = `
    SELECT e.*,
      (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id)::int AS count
      ${hasInterests ? `, CASE WHEN e.cat = ANY($1::text[]) THEN 1 ELSE 0 END AS interest_score` : ''}
    FROM events e
    WHERE 1=1
  `;
  const params: unknown[] = [];
  let i = hasInterests ? 2 : 1;
  if (hasInterests) params.push(userInterests);

  if (cat)          { sql += ` AND e.cat = $${i++}`;                                          params.push(cat); }
  if (club_id)      { sql += ` AND e.club_id = $${i++}`;                                      params.push(club_id); }
  if (live === 'true') { sql += ` AND e.is_live = true`; }
  if (q)            { sql += ` AND (e.title ILIKE $${i} OR e.place ILIKE $${i} OR e.club_name ILIKE $${i})`; params.push(`%${q}%`); i++; }

  sql += hasInterests
    ? ` ORDER BY e.is_live DESC, interest_score DESC, e.created_at DESC LIMIT $${i++} OFFSET $${i++}`
    : ` ORDER BY e.is_live DESC, e.created_at DESC LIMIT $${i++} OFFSET $${i++}`;
  params.push(Number(limit), Number(offset));

  const { rows } = await pool.query(sql, params);
  res.json(rows);
});

// GET /events/:id
router.get('/:id', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT e.*,
      (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id)::int AS count
     FROM events e WHERE e.id = $1`,
    [req.params.id]
  );
  if (rows.length === 0) {
    res.status(404).json({ error: 'Etkinlik bulunamadı' });
    return;
  }
  res.json(rows[0]);
});

// POST /events — etkinlik oluştur
router.post('/',
  requireAuth,
  body('title').notEmpty().isLength({ max: 200 }),
  body('cat').notEmpty(),
  body('club_name').notEmpty(),
  body('date').notEmpty(),
  body('time').notEmpty(),
  body('place').notEmpty(),
  validateRequest,
  async (req, res) => {
    const { title, cat, club_id, club_name, date, time, place, capacity, photo, free = true } = req.body as {
      title: string; cat: string; club_id?: string; club_name: string;
      date: string; time: string; place: string; capacity?: number;
      photo?: string; free?: boolean;
    };

    const { rows } = await pool.query(
      `INSERT INTO events (title, cat, club_id, club_name, date, time, place, capacity, photo, free, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [title, cat, club_id ?? null, club_name, date, time, place, capacity ?? null, photo ?? null, free, req.userId]
    );
    res.status(201).json(rows[0]);
  }
);

// POST /events/:id/join
router.post('/:id/join', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      'INSERT INTO event_participants (user_id, event_id) VALUES ($1, $2) ON CONFLICT (user_id, event_id) DO NOTHING',
      [req.userId, id]
    );
    const { rows } = await pool.query(
      'SELECT COUNT(*)::int AS count FROM event_participants WHERE event_id = $1',
      [id]
    );
    res.json({ joined: true, count: rows[0].count });
  } catch {
    res.status(400).json({ error: 'Katılım başarısız' });
  }
});

// DELETE /events/:id/join (ayrıl)
router.delete('/:id/join', requireAuth, async (req, res) => {
  await pool.query(
    'DELETE FROM event_participants WHERE user_id = $1 AND event_id = $2',
    [req.userId, req.params.id]
  );
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM event_participants WHERE event_id = $1',
    [req.params.id]
  );
  res.json({ joined: false, count: rows[0].count });
});

// POST /events/:id/bookmark
router.post('/:id/bookmark', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT 1 FROM event_bookmarks WHERE user_id = $1 AND event_id = $2',
    [req.userId, req.params.id]
  );
  if (rows.length > 0) {
    await pool.query(
      'DELETE FROM event_bookmarks WHERE user_id = $1 AND event_id = $2',
      [req.userId, req.params.id]
    );
    res.json({ bookmarked: false });
  } else {
    await pool.query(
      'INSERT INTO event_bookmarks (user_id, event_id) VALUES ($1, $2)',
      [req.userId, req.params.id]
    );
    res.json({ bookmarked: true });
  }
});

export default router;

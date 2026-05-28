import { Router } from 'express';
import { body } from 'express-validator';
import { pool } from '../db/pool';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/errorHandler';

const router = Router();

// GET /clubs
router.get('/', async (req, res) => {
  const { cat, limit = '20', offset = '0' } = req.query as Record<string, string>;
  let sql = 'SELECT * FROM clubs WHERE 1=1';
  const params: unknown[] = [];
  let i = 1;
  if (cat) { sql += ` AND cat = $${i++}`; params.push(cat); }
  sql += ` ORDER BY member_count DESC LIMIT $${i++} OFFSET $${i++}`;
  params.push(Number(limit), Number(offset));
  const { rows } = await pool.query(sql, params);
  res.json(rows);
});

// GET /clubs/:id
router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM clubs WHERE id = $1', [req.params.id]);
  if (rows.length === 0) { res.status(404).json({ error: 'Cemiyet bulunamadı' }); return; }
  res.json(rows[0]);
});

// POST /clubs — cemiyet kur
router.post('/',
  requireAuth,
  body('name').notEmpty().isLength({ min: 2, max: 100 }),
  body('cat').notEmpty(),
  validateRequest,
  async (req, res) => {
    const { name, cat, photo, description = '', city = 'Elazığ', membership_model = 'acik' } = req.body as {
      name: string; cat: string; photo?: string; description?: string;
      city?: string; membership_model?: string;
    };
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO clubs (name, cat, photo, description, city, membership_model, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, cat, photo ?? null, description, city, membership_model, req.userId]
      );
      await client.query(
        'INSERT INTO club_members (user_id, club_id, role) VALUES ($1, $2, $3)',
        [req.userId, rows[0].id, 'reis']
      );
      await client.query('COMMIT');
      res.status(201).json(rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
);

// POST /clubs/:id/join — membership_model'e göre doğrudan üye veya bekleyen
router.post('/:id/join', requireAuth, async (req, res) => {
  const { id } = req.params;

  // Zaten üye mi?
  const { rows: existing } = await pool.query(
    'SELECT role FROM club_members WHERE user_id = $1 AND club_id = $2',
    [req.userId, id]
  );
  if (existing.length > 0) {
    res.status(409).json({ error: 'Zaten üyesiniz', status: 'uye' });
    return;
  }

  // Bekleyen başvuru var mı?
  const { rows: pending } = await pool.query(
    "SELECT id FROM club_join_requests WHERE user_id = $1 AND club_id = $2 AND status = 'bekliyor'",
    [req.userId, id]
  );
  if (pending.length > 0) {
    res.status(409).json({ error: 'Başvurunuz zaten beklemede', status: 'bekliyor' });
    return;
  }

  // Üyelik modeline bak
  const { rows: club } = await pool.query(
    'SELECT membership_model FROM clubs WHERE id = $1',
    [id]
  );
  if (club.length === 0) { res.status(404).json({ error: 'Cemiyet bulunamadı' }); return; }

  const model = club[0].membership_model ?? 'acik';

  if (model === 'kapali') {
    res.status(403).json({ error: 'Bu cemiyet sadece davet ile katılıma açıktır', status: 'kapali' });
    return;
  }

  if (model === 'onay') {
    // Başvuru oluştur (application_note isteğe bağlı)
    const { application_note = '' } = req.body as { application_note?: string };
    await pool.query(
      'INSERT INTO club_join_requests (user_id, club_id, application_note) VALUES ($1, $2, $3) ON CONFLICT (user_id, club_id) DO UPDATE SET status = $4, application_note = $3',
      [req.userId, id, application_note, 'bekliyor']
    );
    res.json({ joined: false, status: 'bekliyor', message: 'Başvurunuz alındı. Yönetici onayı bekleniyor.' });
    return;
  }

  // Açık — doğrudan üye yap
  await pool.query(
    'INSERT INTO club_members (user_id, club_id, role) VALUES ($1, $2, $3)',
    [req.userId, id, 'aza']
  );
  await pool.query('UPDATE clubs SET member_count = member_count + 1 WHERE id = $1', [id]);
  res.json({ joined: true, status: 'uye' });
});

// DELETE /clubs/:id/join (ayrıl)
router.delete('/:id/join', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    'SELECT role FROM club_members WHERE user_id = $1 AND club_id = $2',
    [req.userId, id]
  );
  if (rows[0]?.role === 'reis') {
    res.status(403).json({ error: 'Reis cemiyetten ayrılamaz' }); return;
  }
  await pool.query('DELETE FROM club_members WHERE user_id = $1 AND club_id = $2', [req.userId, id]);
  await pool.query('UPDATE clubs SET member_count = GREATEST(member_count - 1, 0) WHERE id = $1', [id]);
  // Bekleyen başvuruyu da iptal et
  await pool.query("DELETE FROM club_join_requests WHERE user_id = $1 AND club_id = $2", [req.userId, id]);
  res.json({ joined: false });
});

// GET /clubs/:id/join-requests — bekleyen başvurular (yönetici)
router.get('/:id/join-requests', requireAuth, async (req, res) => {
  const { rows: role } = await pool.query(
    "SELECT role FROM club_members WHERE user_id = $1 AND club_id = $2 AND role IN ('reis','yardimci')",
    [req.userId, req.params.id]
  );
  if (role.length === 0) { res.status(403).json({ error: 'Yönetici değilsiniz' }); return; }

  const { rows } = await pool.query(
    `SELECT jr.id, jr.created_at, jr.application_note, u.id AS user_id, u.name, u.username, u.avatar_tone
     FROM club_join_requests jr
     JOIN users u ON u.id = jr.user_id
     WHERE jr.club_id = $1 AND jr.status = 'bekliyor'
     ORDER BY jr.created_at ASC`,
    [req.params.id]
  );
  res.json(rows);
});

// POST /clubs/:id/join-requests/:reqId/approve — başvuru onayla
router.post('/:id/join-requests/:reqId/approve', requireAuth, async (req, res) => {
  const { id, reqId } = req.params;
  const { rows: role } = await pool.query(
    "SELECT role FROM club_members WHERE user_id = $1 AND club_id = $2 AND role IN ('reis','yardimci')",
    [req.userId, id]
  );
  if (role.length === 0) { res.status(403).json({ error: 'Yönetici değilsiniz' }); return; }

  const { rows: req_ } = await pool.query(
    "SELECT * FROM club_join_requests WHERE id = $1 AND club_id = $2 AND status = 'bekliyor'",
    [reqId, id]
  );
  if (req_.length === 0) { res.status(404).json({ error: 'Başvuru bulunamadı' }); return; }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("UPDATE club_join_requests SET status = 'onaylandi' WHERE id = $1", [reqId]);
    await client.query(
      'INSERT INTO club_members (user_id, club_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [req_[0].user_id, id, 'aza']
    );
    await client.query('UPDATE clubs SET member_count = member_count + 1 WHERE id = $1', [id]);
    await client.query('COMMIT');
    res.json({ approved: true });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// POST /clubs/:id/join-requests/:reqId/reject — başvuru reddet
router.post('/:id/join-requests/:reqId/reject', requireAuth, async (req, res) => {
  const { id, reqId } = req.params;
  await pool.query(
    "UPDATE club_join_requests SET status = 'reddedildi' WHERE id = $1 AND club_id = $2",
    [reqId, id]
  );
  res.json({ rejected: true });
});

// GET /clubs/:id/members
router.get('/:id/members', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.username, u.avatar_tone, u.verified, cm.role, cm.joined_at
     FROM club_members cm
     JOIN users u ON u.id = cm.user_id
     WHERE cm.club_id = $1
     ORDER BY CASE cm.role WHEN 'reis' THEN 1 WHEN 'yardimci' THEN 2 ELSE 3 END, cm.joined_at`,
    [req.params.id]
  );
  res.json(rows);
});

// GET /clubs/:id/wall
router.get('/:id/wall', async (req, res) => {
  const { limit = '20', offset = '0' } = req.query as Record<string, string>;
  const { rows } = await pool.query(
    `SELECT wp.*,
      u.name AS author_name, u.username AS author_username, u.avatar_tone AS author_tone,
      json_build_object(
        'bravo',     COALESCE(SUM(CASE WHEN wr.type='bravo'     THEN 1 END),0),
        'geliyorum', COALESCE(SUM(CASE WHEN wr.type='geliyorum' THEN 1 END),0),
        'super',     COALESCE(SUM(CASE WHEN wr.type='super'     THEN 1 END),0),
        'tebrik',    COALESCE(SUM(CASE WHEN wr.type='tebrik'    THEN 1 END),0)
      ) AS reactions
     FROM wall_posts wp
     JOIN users u ON u.id = wp.author_id
     LEFT JOIN wall_reactions wr ON wr.post_id = wp.id
     WHERE wp.club_id = $1
     GROUP BY wp.id, u.id
     ORDER BY wp.created_at DESC
     LIMIT $2 OFFSET $3`,
    [req.params.id, Number(limit), Number(offset)]
  );
  res.json(rows);
});

// POST /clubs/:id/wall
router.post('/:id/wall',
  requireAuth,
  body('text').notEmpty().isLength({ max: 2000 }),
  validateRequest,
  async (req, res) => {
    const { text, is_announcement = false } = req.body as { text: string; is_announcement?: boolean };
    if (is_announcement) {
      const { rows } = await pool.query(
        'SELECT role FROM club_members WHERE user_id = $1 AND club_id = $2',
        [req.userId, req.params.id]
      );
      if (!['reis', 'yardimci'].includes(rows[0]?.role)) {
        res.status(403).json({ error: 'Sadece yöneticiler duyuru yapabilir' }); return;
      }
    }
    const { rows } = await pool.query(
      `INSERT INTO wall_posts (club_id, author_id, text, is_announcement) VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.params.id, req.userId, text, is_announcement]
    );
    // Author bilgisini ekle
    const { rows: user } = await pool.query(
      'SELECT name AS author_name, username AS author_username, avatar_tone AS author_tone FROM users WHERE id = $1',
      [req.userId]
    );
    res.status(201).json({
      ...rows[0],
      ...user[0],
      reactions: { bravo: 0, geliyorum: 0, super: 0, tebrik: 0 },
    });
  }
);

// POST /clubs/:id/wall/:postId/react
router.post('/:id/wall/:postId/react',
  requireAuth,
  body('type').isIn(['bravo', 'geliyorum', 'super', 'tebrik']),
  validateRequest,
  async (req, res) => {
    const { postId } = req.params;
    const { type } = req.body as { type: string };
    const { rows } = await pool.query(
      'SELECT 1 FROM wall_reactions WHERE post_id=$1 AND user_id=$2 AND type=$3',
      [postId, req.userId, type]
    );
    if (rows.length > 0) {
      await pool.query('DELETE FROM wall_reactions WHERE post_id=$1 AND user_id=$2 AND type=$3', [postId, req.userId, type]);
      res.json({ reacted: false, type });
    } else {
      await pool.query('INSERT INTO wall_reactions (post_id, user_id, type) VALUES ($1,$2,$3)', [postId, req.userId, type]);
      res.json({ reacted: true, type });
    }
  }
);

export default router;

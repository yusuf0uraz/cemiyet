import { Router } from 'express';
import { pool } from '../db/pool';
import { requireAuth } from '../middleware/auth';

const router = Router();

// POST /follows/:userId — takip et / çıkar (toggle)
router.post('/:userId', requireAuth, async (req, res) => {
  const targetId = req.params.userId;
  if (targetId === req.userId) {
    res.status(400).json({ error: 'Kendini takip edemezsin' });
    return;
  }

  const { rows } = await pool.query(
    'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
    [req.userId, targetId]
  );

  if (rows.length > 0) {
    await pool.query(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
      [req.userId, targetId]
    );
    res.json({ following: false });
  } else {
    await pool.query(
      'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT (follower_id, following_id) DO NOTHING',
      [req.userId, targetId]
    );
    res.json({ following: true });
  }
});

// GET /follows/:userId/status — takip durumu
router.get('/:userId/status', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
    [req.userId, req.params.userId]
  );
  res.json({ following: rows.length > 0 });
});

// GET /follows/:userId/counts — takipçi / takip sayıları
router.get('/:userId/counts', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT
      (SELECT COUNT(*) FROM follows WHERE following_id = $1)::int AS followers,
      (SELECT COUNT(*) FROM follows WHERE follower_id  = $1)::int AS following`,
    [req.params.userId]
  );
  res.json(rows[0]);
});

export default router;

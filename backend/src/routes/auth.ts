import { Router } from 'express';
import { body } from 'express-validator';
import { pool } from '../db/pool';
import { signToken, requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/errorHandler';
import admin from '../firebase-admin';

const router = Router();

// POST /auth/firebase-verify — Firebase ID token'ı doğrula, kullanıcı döndür
router.post('/firebase-verify',
  body('idToken').notEmpty().withMessage('Firebase ID token gerekli'),
  validateRequest,
  async (req, res) => {
    const { idToken } = req.body as { idToken: string };

    if (!admin.apps.length) {
      res.status(503).json({ error: 'Firebase yapılandırılmamış. Sunucu yöneticisiyle iletişime geçin.' });
      return;
    }

    let decoded: admin.auth.DecodedIdToken;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
      res.status(401).json({ error: 'Geçersiz Firebase token' });
      return;
    }

    const phone = decoded.phone_number;
    if (!phone) {
      res.status(400).json({ error: 'Token üzerinde telefon numarası bulunamadı' });
      return;
    }

    const { rows } = await pool.query<{ id: string }>(
      'SELECT id FROM users WHERE phone = $1 OR firebase_uid = $2',
      [phone, decoded.uid]
    );

    if (rows.length > 0) {
      // Mevcut kullanıcı — firebase_uid'yi güncelle (ilk kez bağlanıyorsa)
      await pool.query(
        'UPDATE users SET firebase_uid = $1 WHERE id = $2',
        [decoded.uid, rows[0].id]
      );
      const token = signToken(rows[0].id);
      const { rows: full } = await pool.query(
        'SELECT id, name, username, bio, city, avatar_tone, verified FROM users WHERE id = $1',
        [rows[0].id]
      );
      res.json({ token, user: full[0], isNew: false, phone });
    } else {
      // Yeni kullanıcı — profil oluşturma bekleniyor
      res.json({ token: null, user: null, isNew: true, phone, firebaseUid: decoded.uid });
    }
  }
);

// POST /auth/register — Yeni kullanıcı profili oluştur (Firebase UID ile)
router.post('/register',
  body('firebaseUid').notEmpty().withMessage('Firebase UID gerekli'),
  body('phone').notEmpty(),
  body('name').isLength({ min: 2 }).withMessage('Ad en az 2 karakter olmalı'),
  body('username').matches(/^[a-z0-9_.]{3,30}$/).withMessage('Geçersiz kullanıcı adı'),
  validateRequest,
  async (req, res) => {
    const {
      firebaseUid, phone, name, username, bio = '', city = 'Elazığ',
    } = req.body as {
      firebaseUid: string; phone: string; name: string;
      username: string; bio?: string; city?: string;
    };

    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR phone = $2 OR firebase_uid = $3',
      [username, phone, firebaseUid]
    );
    if (existing.length > 0) {
      res.status(409).json({ error: 'Kullanıcı adı veya telefon zaten kayıtlı' });
      return;
    }

    const tones = ['1', '2', '3', '4', '5'] as const;
    const avatarTone = tones[Math.floor(Math.random() * tones.length)];

    const { rows } = await pool.query<{ id: string }>(
      `INSERT INTO users (phone, firebase_uid, name, username, bio, city, avatar_tone)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [phone, firebaseUid, name, username, bio, city, avatarTone]
    );

    const token = signToken(rows[0].id);
    const { rows: user } = await pool.query(
      'SELECT id, name, username, bio, city, avatar_tone, verified FROM users WHERE id = $1',
      [rows[0].id]
    );
    res.status(201).json({ token, user: user[0] });
  }
);

// GET /auth/me
router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, name, username, bio, city, avatar_tone, avatar_url, verified FROM users WHERE id = $1',
    [req.userId]
  );
  if (rows.length === 0) {
    res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    return;
  }
  res.json(rows[0]);
});

// PATCH /auth/me
router.patch('/me', requireAuth,
  body('name').optional().isLength({ min: 2 }),
  body('username').optional().matches(/^[a-z0-9_.]{3,30}$/),
  body('bio').optional().isLength({ max: 140 }),
  validateRequest,
  async (req, res) => {
    const { name, username, bio, city, avatar_url } = req.body as {
      name?: string; username?: string; bio?: string; city?: string; avatar_url?: string;
    };

    if (username) {
      const { rows } = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, req.userId]
      );
      if (rows.length > 0) {
        res.status(409).json({ error: 'Kullanıcı adı alınmış' });
        return;
      }
    }

    const { rows } = await pool.query(
      `UPDATE users SET
        name        = COALESCE($1, name),
        username    = COALESCE($2, username),
        bio         = COALESCE($3, bio),
        city        = COALESCE($4, city),
        avatar_url  = COALESCE($5, avatar_url)
       WHERE id = $6
       RETURNING id, name, username, bio, city, avatar_tone, avatar_url, verified`,
      [name, username, bio, city, avatar_url, req.userId]
    );
    res.json(rows[0]);
  }
);

// GET /auth/check-username/:username
router.get('/check-username/:username', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id FROM users WHERE username = $1',
    [req.params.username]
  );
  res.json({ available: rows.length === 0 });
});

// POST /auth/logout
router.post('/logout', requireAuth, (_req, res) => {
  res.json({ message: 'Çıkış yapıldı' });
});

export default router;

import { Router } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../middleware/auth';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 10;

function buildR2Client(): S3Client | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    console.warn('[R2] Env değişkenleri eksik. Upload endpoint devre dışı.');
    return null;
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

const r2 = buildR2Client();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Desteklenmeyen dosya türü. JPEG, PNG, WebP veya GIF gönderin.'));
    }
  },
});

const router = Router();

async function uploadToR2(
  buffer: Buffer,
  mimeType: string,
  folder: string
): Promise<string> {
  if (!r2) throw new Error('R2 yapılandırılmamış');

  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!bucket || !publicUrl) throw new Error('R2_BUCKET_NAME veya R2_PUBLIC_URL eksik');

  const ext = mimeType.split('/')[1] || 'jpg';
  const key = `${folder}/${uuidv4()}.${ext}`;

  await r2.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  }));

  return `${publicUrl}/${key}`;
}

// POST /api/upload/avatar — profil fotoğrafı
router.post('/avatar', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Dosya gerekli' });
    return;
  }
  const url = await uploadToR2(req.file.buffer, req.file.mimetype, `avatars/${req.userId}`);
  res.json({ url });
});

// POST /api/upload/event — etkinlik görseli
router.post('/event', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Dosya gerekli' });
    return;
  }
  const url = await uploadToR2(req.file.buffer, req.file.mimetype, 'events');
  res.json({ url });
});

// POST /api/upload/club — cemiyet görseli
router.post('/club', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Dosya gerekli' });
    return;
  }
  const url = await uploadToR2(req.file.buffer, req.file.mimetype, 'clubs');
  res.json({ url });
});

export default router;

import 'express-async-errors'; // async route handler hatalarını otomatik yakala
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import clubRoutes from './routes/clubs';
import followRoutes from './routes/follows';
import userRoutes from './routes/users';
import uploadRoutes from './routes/upload';
import { errorHandler, notFound } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());

// Sağlık kontrolü
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV });
});

// Rotalar
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// 404 + hata işleyici
app.use(notFound);
app.use(errorHandler);

// Unhandled promise rejection — süreci öldürmesin
process.on('unhandledRejection', (reason: unknown) => {
  const err = reason as Error & { code?: string };
  // UUID format hatası gibi beklenen DB hataları için sessiz geç
  if (err?.code === '22P02' || err?.code === '23503' || err?.code === '23505') {
    console.warn('[WARN] DB hata (unhandled):', err.message);
    return;
  }
  console.error('[UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

const server = app.listen(PORT, () => {
  console.log(`CemiApp Backend → http://localhost:${PORT}`);
});

export default app;

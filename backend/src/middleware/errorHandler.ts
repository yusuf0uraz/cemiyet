import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
}

export function errorHandler(
  err: Error & { code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // PostgreSQL UUID format hatası → 400 döndür (crash değil)
  if (err.code === '22P02') {
    res.status(400).json({ error: 'Geçersiz ID formatı' });
    return;
  }
  // PostgreSQL FK ihlali → 400
  if (err.code === '23503') {
    res.status(400).json({ error: 'İlgili kayıt bulunamadı' });
    return;
  }
  // PostgreSQL unique ihlali → 409
  if (err.code === '23505') {
    res.status(409).json({ error: 'Bu kayıt zaten mevcut' });
    return;
  }
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Sunucu hatası' });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Bulunamadı' });
}

import { Request, Response, NextFunction, RequestHandler } from 'express';

// Express 4'te async route handler'ları otomatik wrap eder
// Unhandled rejection yerine express error handler'a yönlendirir
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

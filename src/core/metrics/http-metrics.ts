import { NextFunction, Request, Response } from 'express';
import { metrics } from './metrics';

export function httpMetricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    const tags = {
      method: req.method,
      path: req.route?.path ?? req.path,
      status_code: res.statusCode
    };

    metrics.increment('api.http.requests.count', tags);
    metrics.timing('api.http.requests.duration_ms', durationMs, tags);

    if (res.statusCode >= 400) {
      metrics.increment('api.http.requests.error.count', tags);
    }
  });

  next();
}

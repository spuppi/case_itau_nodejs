import pinoHttp from 'pino-http';
import { logger } from './logger';
import { Request } from 'express';

export const httpLogger = pinoHttp({
  logger,
  customProps: (req: Request, res) => {
    return {
      logType: 'http' as const,
      correlationId: req.correlationId,
      'http.method': req.method,
      'http.path': req.path,
      'http.statusCode': res.statusCode,
      'http.clientIp': req.ip,
      'http.userAgent': req.headers['user-agent']
    };
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  }
});

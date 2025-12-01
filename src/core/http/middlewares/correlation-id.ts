import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../http-error';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';

declare module 'express-serve-static-core' {
  interface Request {
    correlationId?: string;
  }
}

function isValidUuidV4(value: string): boolean {
  return uuidValidate(value) && uuidVersion(value) === 4;
}

export function correlationIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {

  if (req.method === 'OPTIONS') {
    return next();
  }
  
  const headerName = 'x-correlation-id';
  const correlationId = req.headers[headerName] as string | undefined;

  if (!correlationId) {
    throw HttpError.badRequest('Header X-Correlation-Id é obrigatório');
  }

  if (!isValidUuidV4(correlationId)) {
    throw HttpError.badRequest('Header X-Correlation-Id deve ser um UUID v4 válido');
  }

  req.correlationId = correlationId;
  res.setHeader('X-Correlation-Id', correlationId);

  return next();
}

import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../http-error';
import { Prisma } from '@prisma/client';
import { logger } from '../../logging/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const correlationId = req.correlationId;

  logger.error(
    {
      logType: 'error',
      correlationId,
      errorName: err?.name,
      errorMessage: err?.message,
      path: req.path,
      method: req.method
    },
    'Unhandled error'
  );

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Recurso em conflito' });
    }

    return res.status(400).json({ message: 'Erro ao acessar os dados' });
  }

  return res.status(500).json({ message: 'Erro interno do servidor' });
}

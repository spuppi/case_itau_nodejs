import pino from 'pino';
import { env } from '../../config/env';

const level = process.env.LOG_LEVEL ?? 'info';

export const logger = pino({
  level,
  base: {
    service: env.serviceName,
    env: env.ddEnv,
    version: env.serviceVersion
  },
  timestamp: pino.stdTimeFunctions.isoTime
});

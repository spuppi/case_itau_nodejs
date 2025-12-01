import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
  serviceName: process.env.SERVICE_NAME ?? 'conta-corrente-api',
  serviceVersion: process.env.SERVICE_VERSION ?? '1.0.0',
  metricsEnabled: process.env.METRICS_ENABLED === 'true',
  statsdHost: process.env.DD_AGENT_HOST ?? '127.0.0.1',
  statsdPort: process.env.DD_DOGSTATSD_PORT
    ? Number(process.env.DD_DOGSTATSD_PORT)
    : 8125,
  ddEnv: process.env.DD_ENV ?? process.env.NODE_ENV ?? 'development'
};

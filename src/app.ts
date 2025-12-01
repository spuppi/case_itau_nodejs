import express from 'express';
import helmet from 'helmet';

import { clientesRoutes } from './modules/clientes/http/clientes.routes';
import { errorHandler } from './core/http/middlewares/error-handler';
import { notFoundHandler } from './core/http/middlewares/not-found';
import { globalRateLimiter } from './core/http/middlewares/rate-limit';
import { correlationIdMiddleware } from './core/http/middlewares/correlation-id';
import { httpLogger } from './core/logging/http-logger';
import { httpMetricsMiddleware } from './core/metrics/http-metrics';

export const app = express();

app.use(helmet());
app.disable('x-powered-by');
app.use(httpLogger);
app.use(globalRateLimiter);
app.use(httpMetricsMiddleware);
app.use(correlationIdMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(clientesRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
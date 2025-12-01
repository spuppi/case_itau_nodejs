import StatsD from 'hot-shots';
import { env } from '../../config/env';

type Tags = Record<string, string | number | undefined>;

function toTagArray(tags?: Tags): string[] | undefined {
  if (!tags) return undefined;
  return Object.entries(tags)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}:${v}`);
}

let client: StatsD | null = null;

if (env.metricsEnabled) {
  client = new StatsD({
    host: env.statsdHost,
    port: env.statsdPort,
    globalTags: {
      service: env.serviceName,
      env: env.ddEnv,
      version: env.serviceVersion
    },
    errorHandler: (error) => {
      // eslint-disable-next-line no-console
      console.error('StatsD error', error);
    }
  });
  // eslint-disable-next-line no-console
  console.log(`📊 Métricas habilitadas. Enviando para ${env.statsdHost}:${env.statsdPort}`);
} else {
  // eslint-disable-next-line no-console
  console.log('📊 Métricas DESABILITADAS (METRICS_ENABLED != true)');
}

export const metrics = {
  increment(name: string, tags?: Tags) {
    if (!client) return;
    client.increment(name, 1, toTagArray(tags));
  },
  timing(name: string, ms: number, tags?: Tags) {
    if (!client) return;
    client.timing(name, ms, toTagArray(tags));
  },
  histogram(name: string, value: number, tags?: Tags) {
    if (!client) return;
    (client as any).histogram(name, value, toTagArray(tags));
  }
};

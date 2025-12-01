# Conta Corrente API (Observability Edition)

Projeto completo com:
- Node + TypeScript + Express
- Prisma + SQLite
- CRUD de clientes + depósito/saque com transação
- Idempotência via Idempotency-Key
- CorrelationId obrigatório
- Logs estruturados (Pino)
- Métricas para Datadog (DogStatsD via hot-shots)
- Testes com Jest
- Dockerfile + docker-compose

## Rodando local

```bash
npm install

cp .env.example .env

npx prisma migrate dev --name init
npx prisma generate

npm run dev
```

Requisições precisam do header `X-Correlation-Id` com UUID v4.
Para depósito/saque também é obrigatório `Idempotency-Key`.

## Docker

```bash
docker compose build
docker compose up
```

API: http://localhost:3000

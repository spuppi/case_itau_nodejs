FROM node:20-alpine

WORKDIR /usr/src/app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

RUN npm install
RUN npx prisma generate

COPY src ./src

RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production
ENV DATABASE_URL="file:./prisma/dev.db"

USER appuser

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]

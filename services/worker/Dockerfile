FROM node:20-alpine AS builder

# pnpm via corepack
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY shared/ ./shared/
COPY services/worker/ ./services/worker/
RUN pnpm install --frozen-lockfile --filter @surr/worker... --filter @surr/shared
RUN pnpm --filter @surr/worker run build

FROM node:20-alpine
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/worker ./services/worker
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./

ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "services/worker/lib/services/worker/src/server.js"]

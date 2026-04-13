FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

WORKDIR /app

# Workspace manifests — copied first for layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY server/package.json ./server/

RUN pnpm install --filter=chartdb-server --frozen-lockfile

# Source
COPY server/tsconfig.json ./server/
COPY server/src ./server/src

RUN pnpm --filter=chartdb-server run build

# ---

FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY server/package.json ./server/

RUN pnpm install --filter=chartdb-server --prod --frozen-lockfile

COPY --from=builder /app/server/dist ./server/dist

EXPOSE 3001

CMD ["node", "server/dist/index.js"]

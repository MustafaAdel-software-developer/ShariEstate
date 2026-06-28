# ShariEstate API — production image (Railway / Docker)
FROM node:20-bookworm-slim

RUN apt-get update -y \
  && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app

# Monorepo manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

# Source needed for build
COPY packages/shared packages/shared
COPY apps/api/prisma apps/api/prisma
COPY apps/api/src apps/api/src
COPY apps/api/tsconfig.json apps/api/tsconfig.build.json apps/api/nest-cli.json apps/api/

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @real-estate/shared build \
  && pnpm --filter @real-estate/api exec prisma generate \
  && pnpm --filter @real-estate/api run build

WORKDIR /app/apps/api

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/main.js"]

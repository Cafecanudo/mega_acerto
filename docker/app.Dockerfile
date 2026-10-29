FROM node:24-bookworm-slim AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/domain/package.json packages/domain/
COPY packages/analises/package.json packages/analises/

FROM base AS build-web
RUN pnpm install --frozen-lockfile --ignore-scripts --filter "@mega/web..."
COPY tsconfig.base.json ./
COPY packages/domain/src packages/domain/src
COPY packages/analises/src packages/analises/src
COPY apps/web apps/web
RUN pnpm --filter @mega/web build

FROM base AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    WEB_DIST_DIR=/app/apps/web/dist
RUN pnpm install --frozen-lockfile --prod --ignore-scripts --filter "@mega/api..."
COPY packages/domain/src packages/domain/src
COPY packages/analises/src packages/analises/src
COPY apps/api/src apps/api/src
COPY --from=build-web /app/apps/web/dist apps/web/dist
USER node
EXPOSE 3000
CMD ["node", "apps/api/src/main.ts"]

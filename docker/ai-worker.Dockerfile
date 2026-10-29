FROM node:24-bookworm-slim
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NODE_ENV=production \
    DISABLE_AUTOUPDATER=1 \
    ANALISE_DIRETORIO_TRABALHO=/home/node/analises
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates python3 python3-numpy python3-scipy python3-pandas python3-statsmodels \
  && rm -rf /var/lib/apt/lists/* \
  && npm install -g @anthropic-ai/claude-code@2.1.312 \
  && corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/domain/package.json packages/domain/
COPY packages/analises/package.json packages/analises/
RUN pnpm install --frozen-lockfile --prod --ignore-scripts --filter "@mega/api..."
COPY packages/domain/src packages/domain/src
COPY packages/analises/src packages/analises/src
COPY apps/api/src apps/api/src
USER node
RUN mkdir -p /home/node/analises
CMD ["node", "apps/api/src/worker.ts"]

# Build this image with --platform linux/arm64 for an ARM64 Coolify host.
# Build native assets on the builder architecture; the runtime image follows the
# requested target platform (linux/arm64 in Coolify).
FROM --platform=$BUILDPLATFORM node:24-bookworm-slim AS build

WORKDIR /workspace
COPY . .

# npm@11 is installed first as required; pnpm is the workspace package manager.
RUN npm install -g npm@11 \
    && corepack enable \
    && corepack prepare pnpm@10.26.1 --activate \
    && pnpm install --frozen-lockfile \
    && pnpm --filter @workspace/oauth-url-generator run build

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=5000 \
    STATIC_DIR=/app/public

WORKDIR /app
COPY --from=build --chown=node:node /workspace/artifacts/oauth-url-generator/server.mjs ./server.mjs
COPY --from=build --chown=node:node /workspace/artifacts/oauth-url-generator/dist/public ./public

EXPOSE 5000
USER node

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 5000) + '/healthz').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.mjs"]

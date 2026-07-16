# syntax=docker/dockerfile:1.7
# Slim Next.js image: alpine + node binary only (no npm/yarn).
# Listens on container port 80 (Compose 80:80, k8s containerPort 80).
#
# BuildKit SBOM (attestation):  docker buildx build --sbom=true ...
# Embedded SPDX:                /sbom/sbom.spdx.json

ARG BUILDKIT_SBOM_SCAN_CONTEXT=true
ARG BUILDKIT_SBOM_SCAN_STAGE=true

# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# ---------------------------------------------------------------------------
# Build (standalone output)
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build \
    && rm -rf .next/cache node_modules

# ---------------------------------------------------------------------------
# Runtime — musl alpine + node binary only (~half of node:alpine)
# ---------------------------------------------------------------------------
FROM alpine:3.21 AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=80 \
    HOSTNAME=0.0.0.0

RUN apk add --no-cache \
        ca-certificates \
        libstdc++ \
        libgcc \
        libcap \
    && addgroup -S -g 1001 nodejs \
    && adduser -S -u 1001 -G nodejs nextjs \
    && rm -rf /var/cache/apk/*

# Node only (skip npm / yarn / corepack from the full node image)
COPY --from=deps /usr/local/bin/node /usr/local/bin/node
# Allow non-root user to bind privileged port 80
RUN setcap 'cap_net_bind_service=+ep' /usr/local/bin/node

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD ["node", "-e", "require('http').get('http://127.0.0.1:80/',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"]

CMD ["node", "server.js"]

# ---------------------------------------------------------------------------
# SBOM (SPDX JSON embedded in final image)
# ---------------------------------------------------------------------------
FROM alpine:3.21 AS sbom

COPY --from=anchore/syft:v1.19.0 /syft /usr/local/bin/syft
COPY --from=runner / /rootfs
RUN syft dir:/rootfs -o spdx-json=/sbom.spdx.json

FROM runner AS final

USER root
COPY --from=sbom --chown=nextjs:nodejs /sbom.spdx.json /sbom/sbom.spdx.json
USER nextjs

LABEL org.opencontainers.image.title="ielts-ai-frontend" \
      org.opencontainers.image.description="IELTS AI Next.js frontend (slim)" \
      org.opencontainers.image.sbom.path="/sbom/sbom.spdx.json"

# syntax=docker/dockerfile:1

# Build on Debian so native deps (e.g. sharp) match the distroless runtime.
FROM node:22-bookworm-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
RUN pnpm build

# Distroless has almost no OS packages — much smaller than node:*-slim.
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS production

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV ALLOW_INSECURE_TOKEN_ROUTE=true
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /app/public ./public
COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/.next/static ./.next/static

USER nonroot

EXPOSE 3000

# Distroless node image entrypoint is already `node`.
CMD ["server.js"]

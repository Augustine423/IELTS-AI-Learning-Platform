# syntax=docker/dockerfile:1

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

RUN pnpm exec next lint --fix
RUN pnpm build

FROM node:22-bookworm-slim AS production

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV ALLOW_INSECURE_TOKEN_ROUTE=true

ARG UID=10001
RUN addgroup \
    --gid "${UID}" \
    appgroup \
  && adduser \
    --disabled-password \
    --gecos "" \
    --home "/app" \
    --ingroup appgroup \
    --no-create-home \
    --uid "${UID}" \
    nextjs

WORKDIR /app

COPY --from=builder --chown=nextjs:appgroup /app/public ./public
COPY --from=builder --chown=nextjs:appgroup /app/.next/standalone ./
COPY --from=builder --chown=nextjs:appgroup /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

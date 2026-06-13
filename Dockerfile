# syntax=docker/dockerfile:1
# Deterministic build for Railway (bypasses Nixpacks cache mounts).

FROM node:20-slim AS base
WORKDIR /app
# Prisma needs openssl at build and runtime.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ---- deps: install node_modules (honors .npmrc legacy-peer-deps) ----
FROM base AS deps
COPY package.json package-lock.json .npmrc ./
# Schema is needed because postinstall runs `prisma generate`.
COPY prisma ./prisma
# --include=dev so the build keeps TypeScript/types even if NODE_ENV=production.
RUN npm ci --include=dev

# ---- builder: compile the Next.js app ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time.
# Railway passes service variables as build args; declare the ones we need.
ARG NEXT_PUBLIC_PRIVY_APP_ID
ENV NEXT_PUBLIC_PRIVY_APP_ID=$NEXT_PUBLIC_PRIVY_APP_ID
RUN npm run build

# ---- runner: run the production server ----
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 3000
# Syncs the DB schema (needs DATABASE_URL at runtime) then starts Next.
CMD ["npm", "run", "start"]

FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@9.12.3

WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json ./
RUN pnpm install

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

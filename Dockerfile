FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# Build stage
FROM base AS builder
WORKDIR /app
COPY my-app/package.json my-app/package-lock.json* ./
# Skip postinstall (prisma generate) — schema not copied yet
RUN npm ci --ignore-scripts
COPY my-app/ .
RUN npx prisma generate
RUN npm run build
# Copy static assets into standalone folder (required for standalone output)
RUN cp -r .next/static .next/standalone/.next/static
RUN if [ -d "public" ]; then cp -r public .next/standalone/public; fi

# Production runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]

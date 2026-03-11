# ============================================================
# Stage 1: Dependencies
# Install only production deps to keep runtime image lean
# ============================================================
FROM node:22-alpine3.21 AS deps

# Install security updates for Alpine packages
RUN apk update && apk upgrade --no-cache

WORKDIR /app

# Copy lockfile and manifest first for better layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev


# ============================================================
# Stage 2: Builder
# Build the Next.js app
# ============================================================
FROM node:22-alpine3.21 AS builder

RUN apk update && apk upgrade --no-cache

WORKDIR /app

# Copy all deps (including devDeps for build)
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build


# ============================================================
# Stage 3: Runner (final, smallest possible image)
# Only contains the built output + production deps
# ============================================================
FROM node:22-alpine3.21 AS runner

# Install security patches on the final image
RUN apk update && apk upgrade --no-cache

WORKDIR /app

# Set Node to production mode - disables devtools, enables optimizations
ENV NODE_ENV=production

# Create a non-root user to run the app (security best practice)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only what's needed from builder - not the full source
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use the standalone server output (much smaller than npm start)
CMD ["node", "server.js"]

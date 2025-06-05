# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Create user and group with specific GIDs/UIDs to match potential build environment if needed, or standard values.
# Using standard values here for simplicity, assuming 1001 is available.
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Explicitly set ownership for the app directory and its contents *before* copying
RUN chown -R nextjs:nodejs /app

# Copy production dependencies with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy build output and public files with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./next.config.js

# Set user to non-root for security
USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]

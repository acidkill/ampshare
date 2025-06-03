# Stage 1: Build the application
FROM docker.io/library/node:20-alpine AS builder
WORKDIR /app

# Ensure the latest package files are copied
COPY package.json package-lock.json ./

# Clear npm cache (optional, but good practice)
RUN npm cache clean --force

# Install dependencies with legacy peer deps to handle subpath exports
RUN npm install --legacy-peer-deps

# Copy application files
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# You can set the PORT environment variable here if you want to change the default port (3000)
# ENV PORT 3000

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create data directory with correct permissions
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Copy built application from the builder stage
# Correctly copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set permissions for the app directory
RUN chown -R nextjs:nodejs /app

USER nextjs

# Ensure data directory exists with correct permissions
RUN mkdir -p /app/data

EXPOSE 3000

# Command to run the application
# The standalone output includes a server.js file
CMD ["node", "server.js"]

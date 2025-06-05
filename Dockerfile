# Dockerfile

# 1. Builder stage: Builds the Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only package.json to ensure fresh resolution based on it
COPY package.json ./

# Remove any existing lock file and node_modules to ensure clean install from package.json
RUN rm -f package-lock.json* && rm -rf node_modules

# Install dependencies based purely on package.json
RUN npm install --legacy-peer-deps

# Copy the rest of the application source code
# The .dockerignore file will prevent unnecessary files from being copied
COPY . .

# Set environment variable to disable Next.js telemetry during the build
ENV NEXT_TELEMETRY_DISABLED 1

# Build the Next.js application
RUN npm run build

# 2. Runner stage: Runs the built Next.js application
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line to disable telemetry during runtime if desired.
# ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user and group for security best practices
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets from the builder stage
# These include the .next folder (production build), public assets, and node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# If you have a next.config.js, ensure it's copied as well:
# COPY --from=builder /app/next.config.js ./next.config.js

# Set the user to the non-root user created above
USER nextjs

# Expose the port the Next.js application runs on (default is 3000)
EXPOSE 3000

# Set the PORT environment variable (Next.js will respect this)
ENV PORT 3000

# Command to start the Next.js production server
CMD ["npm", "run", "start"]

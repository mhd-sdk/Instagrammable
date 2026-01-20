# Multi-stage Dockerfile for automaker-starter-kit
# Stage 1: Development
# Stage 2: Build
# Stage 3: Production

# ============================================
# Stage 1: Base image with dependencies
# ============================================
FROM node:22-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# ============================================
# Stage 2: Development
# ============================================
FROM base AS development

# Install all dependencies (including devDependencies)
RUN npm install

# Copy source code
COPY . .

# Expose development port
EXPOSE 3000

# Development command with hot-reload
CMD ["npm", "run", "dev:app"]

# ============================================
# Stage 3: Builder
# ============================================
FROM base AS builder

# Copy source code first
COPY . .

# Clean install to avoid npm optional dependencies bug with Rollup
RUN rm -rf node_modules package-lock.json && npm install

# Build the application
RUN npm run build

# ============================================
# Stage 4: Production
# ============================================
FROM node:22-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy built application
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

# Install only production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Set ownership
RUN chown -R appuser:nodejs /app

# Switch to non-root user
USER appuser

# Expose production port
EXPOSE 3000

# Production command
CMD ["npm", "run", "start"]

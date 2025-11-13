# Use Node.js 22 LTS as base image
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
FROM base AS builder
RUN npm ci
RUN npm run db:generate
RUN npm run build
RUN npm run db:migrate

# Production stage
FROM node:22-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for Prisma generation)
RUN npm ci

# Copy built application and Prisma client from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Expose port
EXPOSE 3333

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Health check
# HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:${PORT}', (r) => { if (r.statusCode !== 200) throw new Error('Health check failed') }).on('error', (e) => { console.error(e.message); process.exit(1); })"

# Start the application
CMD ["node", "dist/src/main.js"]
# ==========================================
# WEBSCANNER - Production Multi-Stage Dockerfile
# ==========================================

# Stage 1: Build Frontend Assets
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json* ./

# Install all dependencies including devDependencies for build
RUN npm install

# Copy application source code
COPY . .

# Build Vite frontend distribution
RUN npm run build

# Stage 2: Minimal Production Image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install production dependencies + tsx runtime
COPY package.json package-lock.json* ./
RUN npm install --omit=dev && npm install tsx

# Copy compiled frontend from builder
COPY --from=builder /app/dist ./dist

# Copy backend server code and TypeScript interfaces
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src/types ./src/types

# Expose web server port
EXPOSE 3000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the full-stack server
CMD ["npx", "tsx", "server.ts"]

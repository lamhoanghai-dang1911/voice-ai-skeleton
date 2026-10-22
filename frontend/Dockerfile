# ==============================================================================
# INTEGRIX IX.VOICE - FRONTEND DOCKERFILE (MULTI-STAGE BUILD)
# ==============================================================================

# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY frontend/package*.json ./
RUN npm ci

# Copy contracts (for fallback mock imports) and frontend code
COPY contracts /contracts
COPY frontend/ ./

# Build production bundle
RUN npm run build

# Stage 2: Serve with lean Nginx Alpine
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

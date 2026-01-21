# Multi-stage build for React frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# Backend with served frontend
FROM node:18-alpine AS backend
WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3001

CMD ["npm", "start"]
### Multi-stage Dockerfile to build frontend and backend and serve in one container
FROM node:18-alpine as builder
WORKDIR /app

# Build frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Build backend
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm install
COPY backend/ .

# Copy built frontend into backend public folder
RUN mkdir -p dist/public
RUN cp -R /app/frontend/dist/* dist/public/ || true

# Compile backend
RUN npm run build

### Final image
FROM node:18-alpine as runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/backend/dist ./dist
EXPOSE 4000
CMD ["node", "dist/index.js"]

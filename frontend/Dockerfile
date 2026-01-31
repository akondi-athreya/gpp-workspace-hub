# Frontend Dockerfile - Development Mode for Dynamic API URL
FROM node:20-bookworm-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Run development server (allows dynamic env vars)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

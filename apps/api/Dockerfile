FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package.json package-lock.json ./
COPY tsconfig.json ./

# Copy packages
COPY packages ./packages

# Copy api app
COPY apps/api ./apps/api

# Install all dependencies across workspaces
RUN npm install

# Generate Prisma Client
RUN npm run prisma:generate

# Build API
RUN npm run build:api

# Use smaller image for production
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api

WORKDIR /app/apps/api
EXPOSE 3000

# We need to run the start command
CMD ["npm", "run", "start"]

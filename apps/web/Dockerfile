FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package.json package-lock.json ./
COPY tsconfig.json ./

# Copy packages
COPY packages ./packages

# Copy web app
COPY apps/web ./apps/web

# Install all dependencies
RUN npm install

# Build Web (Vite)
RUN npm run build:web

# Production Nginx image
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy custom nginx config if you have one, or just use default.
# For SPA routing, you typically need to redirect all requests to index.html.
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

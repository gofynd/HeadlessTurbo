# Build stage
FROM node:20-alpine AS builder

# Install git and openssh-client (required for git dependencies)
RUN apk add --no-cache git openssh-client

WORKDIR /Headless-turbo

# Copy package files
COPY package*.json ./

# Install dependencies
RUN if [ -s package.json ]; then \
        npm install; \
    else \
        echo "No package.json found, continuing with default settings"; \
        npm init --yes; \
        npm pkg set type="module"; \
        npm pkg set main="autogen_index.js"; \
    fi

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Runtime stage
FROM gcr.io/distroless/nodejs20-debian11:debug

WORKDIR /Headless-turbo

# Copy built files, server, and runtime dependencies from builder
COPY --from=builder /Headless-turbo/dist ./dist
COPY --from=builder /Headless-turbo/server.js ./
COPY --from=builder /Headless-turbo/handler.js ./
COPY --from=builder /Headless-turbo/package.json ./
COPY --from=builder /Headless-turbo/node_modules ./node_modules
COPY --from=builder /Headless-turbo/.env ./.env

EXPOSE 8080

CMD ["server.js"]

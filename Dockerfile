FROM node:20-alpine AS builder

RUN apk add --no-cache git openssh-client

WORKDIR /app

COPY package*.json ./
RUN if [ -s package.json ]; then npm ci; else npm init --yes; npm pkg set type="module"; npm pkg set main="autogen_index.js"; fi

COPY . .
RUN npm run build && npm prune --omit=dev

FROM gcr.io/distroless/nodejs20-debian11:debug

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080
CMD ["server.js"]

FROM node:20-alpine AS builder

RUN apk add --no-cache git openssh-client

WORKDIR /app

COPY package*.json ./
# `npm ci` requires a committed package-lock.json (security report FND-19).
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

# SECURITY (report FND-20): non-debug distroless image — no shell, no busybox,
# no apt. Smaller attack surface for any post-exploitation step.
FROM gcr.io/distroless/nodejs20-debian11

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/copilot ./copilot
COPY --from=builder /app/server.js ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# SECURITY (report FND-20): run as the non-root user that the distroless
# image ships (uid 65532). Combined with --read-only/--cap-drop=ALL at the
# orchestrator level this gets us a hardened runtime baseline.
USER nonroot:nonroot

EXPOSE 8080
CMD ["server.js"]

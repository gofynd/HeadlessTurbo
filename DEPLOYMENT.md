# Deployment Guide

This guide covers deploying the Turbo theme to three platforms: **Boltic**, **AWS EC2**, and **Cloudflare Workers**.

All deployments serve the same production build — a static SPA bundle with a Fastify server that handles API proxying, credential injection, and SPA fallback routing.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build for Production](#build-for-production)
- [1. Boltic Deployment](#1-boltic-deployment)
- [2. AWS EC2 Deployment](#2-aws-ec2-deployment)
- [3. Cloudflare Workers Deployment](#3-cloudflare-workers-deployment)
- [Environment Variables Reference](#environment-variables-reference)
- [Health Checks](#health-checks)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** v16.19+
- **Docker** installed (for Boltic and EC2 container deployments)
- **Git** installed
- Fynd Platform credentials: `APPLICATION_ID` and `APPLICATION_TOKEN`

> ### ⚠️ `APPLICATION_TOKEN` must be PUBLIC-scope only (security finding F-04)
>
> The server injects `APPLICATION_TOKEN` into the storefront HTML at request time
> via `window.__APP_CREDENTIALS__` so the FPI client can initialise in the
> browser. This means the token is **readable by every script the CSP allows**
> (e.g. `cdn.fynd.com`, `cdn.copilot.live`, `accounts.google.com`) and by anyone
> who opens DevTools. This exposure is an **accepted risk** *only* because the
> token is public-scope.
>
> - **Never** place a partner-level, private, or otherwise privileged token in
>   `APPLICATION_TOKEN`. If the token scope ever expands, this becomes a
>   high-severity credential-exposure issue.
> - A CDN supply-chain compromise of any allowed script origin can read the
>   token; keep the CSP `scriptSrc` allowlist as small as possible.
> - CI enforces acknowledgement of this constraint: set the repository variable
>   `APP_TOKEN_PUBLIC_SCOPE=true` to confirm the configured token is public-scope
>   before deploys to `main`/`master` (see `.github/workflows/ci.yml`).

## Build for Production

Before deploying to any platform, create a production build:

```bash
npm run build
```

This runs `webpack --mode production`, outputting optimized assets to `dist/`.

To verify the build locally:

```bash
npm start
# Server starts on http://localhost:8080
```

---

## 1. Boltic Deployment

Boltic is Fynd's container hosting platform. It builds and deploys your app using the `Dockerfile` and `boltic.yaml` configuration.

### Configuration File

The `boltic.yaml` at the project root defines the deployment:

```yaml
app: "headless-react-starter"
region: "asia-south1"

build:
  dockerfile: Dockerfile
  ignorefile: .gitignore

env:
  PROXY_TARGET: "https://api.fynd.com"
  DOMAIN: "api.fynd.com"
  BUILD_ID: "turbo-proxy-v7-container-20260312"
  USE_PROXY: "true"
  PORT: "8080"
```

### Dockerfile

The project uses a multi-stage Docker build for minimal image size:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

# Stage 2: Production (distroless)
FROM gcr.io/distroless/nodejs20-debian11:debug
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 8080
CMD ["server.js"]
```

### Steps

1. **Update `boltic.yaml`** with your app name and environment variables:

   ```yaml
   app: "your-store-name"

   env:
     PROXY_TARGET: "https://api.fynd.com"
     DOMAIN: "api.fynd.com"
     APPLICATION_ID: "your_application_id"
     APPLICATION_TOKEN: "your_application_token"
     BUILD_ID: "your-build-id"
     USE_PROXY: "true"
     PORT: "8080"
   ```

2. **Push to your repository.** Boltic will detect the `boltic.yaml` and trigger a build.

3. **Monitor deployment** via the Boltic dashboard. The container will:
   - Build from the `Dockerfile`
   - Set environment variables from `boltic.yaml`
   - Expose port `8080`

4. **Verify** once deployed:

   ```bash
   curl https://your-app.boltic.app/__health
   # {"status":"ok"}

   curl https://your-app.boltic.app/__version
   # {"build":"your-build-id","proxy":"https://api.fynd.com"}
   ```

### Custom Domain

Configure your custom domain in the Boltic dashboard under your app's settings. Point your domain's DNS (CNAME) to the Boltic-provided URL.

---

## 2. AWS EC2 Deployment

Deploy Turbo on an EC2 instance either as a **Docker container** or directly with **Node.js**.

### Option A: Docker on EC2

#### 1. Launch an EC2 Instance

- **AMI**: Amazon Linux 2023 or Ubuntu 22.04
- **Instance type**: `t3.small` or larger (2 vCPU, 2 GB RAM minimum)
- **Security group**: Open ports `80` (HTTP), `443` (HTTPS), and `22` (SSH)
- **Storage**: 20 GB gp3

#### 2. Install Docker

```bash
# Amazon Linux 2023
sudo yum update -y
sudo yum install -y docker git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

```bash
# Ubuntu 22.04
sudo apt update
sudo apt install -y docker.io git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

Log out and back in for group changes to take effect.

#### 3. Clone and Build

```bash
git clone https://github.com/your-org/turbo-theme.git
cd turbo-theme

docker build -t turbo-theme .
```

#### 4. Run the Container

```bash
docker run -d \
  --name turbo \
  --restart unless-stopped \
  -p 80:8080 \
  -e PROXY_TARGET="https://api.fynd.com" \
  -e DOMAIN="api.fynd.com" \
  -e APPLICATION_ID="your_application_id" \
  -e APPLICATION_TOKEN="your_application_token" \
  -e BUILD_ID="turbo-ec2-v1" \
  -e USE_PROXY="true" \
  -e PORT="8080" \
  turbo-theme
```

#### 5. Verify

```bash
curl http://localhost/__health
# {"status":"ok"}
```

### Option B: Direct Node.js on EC2

#### 1. Install Node.js

```bash
# Using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
```

#### 2. Clone, Build, and Run

```bash
git clone https://github.com/your-org/turbo-theme.git
cd turbo-theme

npm ci
npm run build
```

#### 3. Create Environment File

```bash
cat > .env << 'EOF'
PROXY_TARGET=https://api.fynd.com
DOMAIN=api.fynd.com
APPLICATION_ID=your_application_id
APPLICATION_TOKEN=your_application_token
BUILD_ID=turbo-ec2-v1
USE_PROXY=true
PORT=8080
EOF
```

#### 4. Run with PM2 (Process Manager)

```bash
npm install -g pm2

pm2 start server.js --name turbo
pm2 save
pm2 startup  # Follow the printed command to enable auto-start on reboot
```

#### 5. Monitor

```bash
pm2 status
pm2 logs turbo
```

### Setting Up Nginx Reverse Proxy (Recommended for EC2)

Use Nginx to handle SSL termination and forward traffic to the Node/Docker app:

```bash
sudo apt install -y nginx   # or: sudo yum install -y nginx
```

Create `/etc/nginx/sites-available/turbo`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and start:

```bash
sudo ln -s /etc/nginx/sites-available/turbo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL with Let's Encrypt (EC2)

```bash
sudo apt install -y certbot python3-certbot-nginx  # Ubuntu
# or: sudo yum install -y certbot python3-certbot-nginx  # Amazon Linux

sudo certbot --nginx -d your-domain.com
```

Certbot will auto-configure Nginx for HTTPS and set up certificate renewal.

---

## 3. Cloudflare Workers Deployment

Cloudflare Workers run at the edge, providing low-latency responses globally. Since Workers don't support Node.js natively, this deployment uses **Cloudflare Workers with static assets** and an edge-side API proxy.

### Architecture

```
User → Cloudflare Worker (edge)
         ├── Static assets (dist/) → served from Workers KV / Assets
         ├── /service, /ext, /graphql → proxied to Fynd API
         └── All other routes → index.html (SPA fallback)
```

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 2. Create `wrangler.toml`

Create a `wrangler.toml` in the project root:

```toml
name = "turbo-theme"
main = "worker/index.js"
compatibility_date = "2024-01-01"

[assets]
directory = "./dist"

[vars]
PROXY_TARGET = "https://api.fynd.com"
APPLICATION_ID = "your_application_id"
APPLICATION_TOKEN = "your_application_token"
```

### 3. Create the Worker Script

Create `worker/index.js`:

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // API proxy: forward /service, /ext, /graphql to Fynd API
    if (
      path.startsWith("/service") ||
      path.startsWith("/ext") ||
      path.startsWith("/graphql")
    ) {
      const proxyUrl = new URL(path + url.search, env.PROXY_TARGET);
      // SECURITY (report FND-12 / FND-13): strip Origin/Referer/Host before
      // forwarding so the upstream cannot echo them into
      // Access-Control-Allow-Origin and weaken cross-origin protections.
      const upstreamHeaders = new Headers(request.headers);
      upstreamHeaders.delete("origin");
      upstreamHeaders.delete("referer");
      upstreamHeaders.delete("host");
      const proxyRequest = new Request(proxyUrl.toString(), {
        method: request.method,
        headers: upstreamHeaders,
        body: request.method !== "GET" ? request.body : undefined,
      });
      const response = await fetch(proxyRequest);

      // Strip domain from set-cookie headers and add Secure / SameSite=Lax
      // (matches the production Fastify hardenSetCookie behavior).
      const newHeaders = new Headers(response.headers);
      const setCookie = newHeaders.get("set-cookie");
      if (setCookie) {
        let hardened = setCookie.replace(/;\s*[Dd]omain=[^;]+/g, "");
        if (!/;\s*Secure(?:\s*;|\s*$)/i.test(hardened)) {
          hardened = `${hardened}; Secure`;
        }
        if (!/;\s*SameSite=/i.test(hardened)) {
          hardened = `${hardened}; SameSite=Lax`;
        }
        newHeaders.set("set-cookie", hardened);
      }
      return new Response(response.body, {
        status: response.status,
        headers: newHeaders,
      });
    }

    // Health check
    if (path === "/__health") {
      return Response.json({ status: "ok" });
    }

    // SECURITY (report FND-23): /__version returns only the build id; never
    // leak the upstream PROXY_TARGET hostname.
    if (path === "/__version") {
      return Response.json({ build: "turbo-cf-worker-v1" });
    }

    // Static assets: if the path has a file extension, let Cloudflare Assets handle it
    if (/\.\w{2,}$/.test(path)) {
      // Cloudflare Assets binding serves files from the dist/ directory automatically
      return env.ASSETS.fetch(request);
    }

    // SPA fallback: serve index.html with injected credentials
    const indexResponse = await env.ASSETS.fetch(
      new Request(new URL("/index.html", request.url))
    );
    let html = await indexResponse.text();

    // SECURITY (report FND-12): JSON.stringify alone does NOT escape `<`, `>`,
    // or `&`, so a credential value containing the literal substring
    // `</script>` would close the inline script tag and HTML-inject. The
    // Fastify implementation in server.js performs these replacements via the
    // escapeForInlineScript helper; the worker MUST mirror that behavior.
    const credsLiteral = JSON.stringify({
      applicationID: env.APPLICATION_ID || "",
      applicationToken: env.APPLICATION_TOKEN || "",
    })
      .replace(/</g, "\\u003c")
      .replace(/>/g, "\\u003e")
      .replace(/&/g, "\\u0026");
    const credentialsScript =
      `<script>window.__APP_CREDENTIALS__=${credsLiteral};</script>`;

    html = html.replace("</head>", `${credentialsScript}</head>`);

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=utf-8",
        "cache-control": "no-cache",
      },
    });
  },
};
```

### Subresource Integrity for third-party scripts

> **Security note (report FND-22):** any external `<script src="...">` injected
> into the storefront — for example the Fynd platform's `cdn.copilot.live`
> bootstrap — should pin a versioned URL and include
> `integrity="sha384-..." crossorigin="anonymous"`. A CDN compromise without
> SRI gives the attacker arbitrary JS execution with full storefront-origin
> trust (credential exfiltration, payment data, session cookies). Update the
> SRI hash whenever you roll the pinned version.

### 4. Build and Deploy

```bash
# Build the production assets
npm run build

# Deploy to Cloudflare Workers
wrangler deploy
```

### 5. Verify

```bash
curl https://turbo-theme.<your-subdomain>.workers.dev/__health
# {"status":"ok"}
```

### Custom Domain on Cloudflare

1. Go to **Cloudflare Dashboard > Workers & Pages > your worker > Settings > Triggers**
2. Add a **Custom Domain** (your domain must be on Cloudflare DNS)
3. Cloudflare auto-provisions SSL

### Secrets Management

Store sensitive values as encrypted secrets instead of plain-text vars:

```bash
wrangler secret put APPLICATION_ID
# Enter your application ID when prompted

wrangler secret put APPLICATION_TOKEN
# Enter your application token when prompted
```

Then remove `APPLICATION_ID` and `APPLICATION_TOKEN` from the `[vars]` section in `wrangler.toml`.

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `PROXY_TARGET` | Yes | `https://api.fynd.com` | Backend API URL for proxy |
| `DOMAIN` | No | `api.fynd.com` | API domain (used if `PROXY_TARGET` not set) |
| `APPLICATION_ID` | Yes | — | Fynd application ID |
| `APPLICATION_TOKEN` | Yes | — | Fynd application token |
| `PORT` | No | `8080` | Server port (Boltic/EC2 only) |
| `BUILD_ID` | No | `turbo-fastify-v1` | Build identifier for `/__version` |
| `USE_PROXY` | No | `true` | Force client to use proxy for same-origin API calls |
| `DEV` | No | — | Set to `1` to enable dev mode (proxy to Webpack Dev Server) |
| `TURBO_DEV_PORT` | No | `5001` | Webpack Dev Server port (dev only) |

## Health Checks

All deployment methods expose the same health check endpoints:

| Endpoint | Response | Purpose |
|---|---|---|
| `/__health` | `{"status":"ok"}` | Liveness check for load balancers |
| `/__version` | `{"build":"...","proxy":"..."}` | Build info and proxy target verification |

Use these for load balancer health checks, uptime monitoring, and deployment verification.

## Troubleshooting

| Issue | Solution |
|---|---|
| **Container fails to start** | Check logs: `docker logs turbo`. Verify all required env vars are set. |
| **API calls return 502** | Verify `PROXY_TARGET` is reachable from the deployment environment. |
| **Blank page after deploy** | Ensure `npm run build` completed successfully and `dist/` contains `index.html`. |
| **Credentials not injected** | Check `APPLICATION_ID` and `APPLICATION_TOKEN` are set in the environment. |
| **Cloudflare Worker 500 errors** | Check worker logs: `wrangler tail`. Verify `wrangler.toml` assets directory points to `dist/`. |
| **EC2 port not accessible** | Verify EC2 security group allows inbound traffic on ports 80/443. |
| **PM2 not restarting on reboot** | Run `pm2 startup` and follow the printed command, then `pm2 save`. |
| **SSL certificate issues** | Run `sudo certbot renew --dry-run` to test renewal. |

---

For general theme documentation, see [README.md](./README.md).

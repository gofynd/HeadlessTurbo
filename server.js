import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyCompress from "@fastify/compress";
import fastifyHelmet from "@fastify/helmet";
import fastifyHttpProxy from "@fastify/http-proxy";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function readEnvFromFile(filePath) {
  try {
    const content = readFileSync(filePath, { encoding: "utf-8" });
    return content.split("\n").reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return acc;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) return acc;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

const envFromFile = readEnvFromFile(resolve(__dirname, ".env"));
const env = { ...process.env, ...envFromFile };

function getProxyTarget(domain) {
  if (!domain || typeof domain !== "string") return null;
  const d = domain.trim();
  if (/^https?:\/\//i.test(d)) return d;
  return `https://${d}`;
}

const isDev = env.DEV === "1" || env.DEV === "true";
const PORT = Number(env.PORT) || 8080;
const PROXY_TARGET =
  env.PROXY_TARGET || getProxyTarget(env.DOMAIN) || "https://api.fynd.com";
const WDS_PORT = Number(env.TURBO_DEV_PORT) || 5002;
const WDS_URL = env.WDS_URL || `http://localhost:${WDS_PORT}`;
const distPath = resolve(join(__dirname, "dist"));
const indexHtmlPath = resolve(join(distPath, "index.html"));

const BUILD_ID = env.BUILD_ID || "turbo-fastify-v1";
const APP_CREDENTIAL_KEYS = ["APPLICATION_ID", "APPLICATION_TOKEN"];

const app = Fastify({ logger: true });

// --- Plugins ---
app.register(fastifyCompress);
app.register(fastifyHelmet, {
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});

// --- Helpers ---
function getRuntimeAppCredentials() {
  return {
    applicationID: env.APPLICATION_ID || "",
    applicationToken: env.APPLICATION_TOKEN || "",
  };
}

let cachedIndexHtml = null;

function renderIndexHtml() {
  if (cachedIndexHtml) return cachedIndexHtml;

  const rawIndexHtml = readFileSync(indexHtmlPath, "utf-8");
  const { applicationID, applicationToken } = getRuntimeAppCredentials();
  const inlineCredentialsScript =
    "<script>" +
    `window.__APP_CREDENTIALS__=${JSON.stringify({
      applicationID,
      applicationToken,
    })
      .replace(/</g, "\\u003c")
      .replace(/>/g, "\\u003e")
      .replace(/&/g, "\\u0026")};` +
    "</script>";

  const html = rawIndexHtml.includes("</head>")
    ? rawIndexHtml.replace("</head>", `${inlineCredentialsScript}</head>`)
    : `${inlineCredentialsScript}${rawIndexHtml}`;

  if (!isDev) cachedIndexHtml = html;
  return html;
}

for (const key of APP_CREDENTIAL_KEYS) {
  if (!env[key]) {
    app.log.warn(`${key} is not set. Client bootstrap will fail without it.`);
  }
}

// --- Routes ---
app.get("/__health", async () => ({ status: "ok" }));
app.get("/__version", async () => ({
  build: BUILD_ID,
  proxy: PROXY_TARGET || "not configured",
}));

// --- API Proxy: /service, /ext, /graphql -> Fynd API ---
if (PROXY_TARGET) {
  const proxyReplyOptions = {
    rewriteHeaders: (headers) => {
      const setCookie = headers["set-cookie"];
      if (!setCookie) return headers;
      const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
      return {
        ...headers,
        "set-cookie": cookies.map((h) =>
          h.replace(/;\s*[Dd]omain=[^;]+/g, ""),
        ),
      };
    },
  };

  for (const prefix of ["/service", "/ext", "/graphql"]) {
    app.register(fastifyHttpProxy, {
      upstream: PROXY_TARGET,
      prefix,
      rewritePrefix: prefix,
      http2: false,
      replyOptions: proxyReplyOptions,
    });
  }

  app.log.info(`Proxy: /service, /ext, /graphql -> ${PROXY_TARGET}`);
} else {
  app.log.warn(
    "PROXY_TARGET (or DOMAIN) not set. API proxy disabled for /service, /ext, /graphql.",
  );
}

// --- Dev: forward all other traffic to webpack-dev-server ---
if (isDev) {
  app.register(fastifyHttpProxy, {
    upstream: WDS_URL,
    prefix: "/",
    websocket: true,
  });
  app.log.info(`Dev mode: app traffic -> ${WDS_URL}`);
} else {
  // --- Prod: serve static files + SPA fallback ---
  app.register(fastifyStatic, {
    root: distPath,
    wildcard: false,
  });

  app.setNotFoundHandler((request, reply) => {
    const urlPath = request.url.split("?")[0];
    // Requests with a file extension: try serving the static file
    if (/\.\w{2,}$/.test(urlPath)) {
      reply.header("Cache-Control", "public, max-age=31536000, immutable");
      return reply.sendFile(urlPath);
    }
    // SPA fallback: serve index.html for all route paths
    return reply
      .header("Cache-Control", "no-cache")
      .type("text/html")
      .send(renderIndexHtml());
  });
}

// --- Graceful shutdown ---
const shutdown = async (signal) => {
  app.log.info(`${signal} received, shutting down`);
  await app.close();
  process.exit(0);
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// --- Start ---
try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

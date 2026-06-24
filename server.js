import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyCompress from "@fastify/compress";
import fastifyHelmet from "@fastify/helmet";
import fastifyHttpProxy from "@fastify/http-proxy";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { randomBytes } from "crypto";

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
// SECURITY (report FND-08): runtime/platform env wins over a checked-in .env
// so a stale local file cannot silently override production configuration.
const env = { ...envFromFile, ...process.env };

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

const CSRF_COOKIE_NAME = "__csrf";
const CSRF_HEADER_NAME = "x-csrf-token";
// Endpoints proxied to Fynd platform — never set CSP/HSTS on these because
// the responses are JSON consumed by app code, not browser-rendered HTML.
const PROXY_PREFIXES = ["/service", "/ext", "/graphql"];

const app = Fastify({ logger: true });

// --- Helpers ---
function getRuntimeAppCredentials() {
  return {
    applicationID: env.APPLICATION_ID || "",
    applicationToken: env.APPLICATION_TOKEN || "",
  };
}

function escapeForInlineScript(value) {
  // Matches the Cloudflare Worker example in DEPLOYMENT.md (report FND-12).
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

// SECURITY (report FND-15): CSRF double-submit. Token is set as a non-HttpOnly
// cookie (so the SPA can read it) and as a window global on first paint.
// Mutating requests proxied to /service|/ext|/graphql must echo the value back
// in the x-csrf-token header. We only enforce on non-GET/HEAD/OPTIONS in
// production; dev allows pass-through to keep curl/Postman workflows usable.
function generateCsrfToken() {
  return randomBytes(24).toString("hex");
}

function parseCookie(header, name) {
  if (!header) return null;
  const parts = String(header).split(/;\s*/);
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) {
      return decodeURIComponent(part.slice(eq + 1));
    }
  }
  return null;
}

// SECURITY (report FND-14): cookies coming back from upstream are augmented
// with the hardening flags the upstream may have omitted.
function hardenSetCookie(cookieStr) {
  if (typeof cookieStr !== "string") return cookieStr;
  let out = cookieStr.replace(/;\s*[Dd]omain=[^;]+/g, "");
  if (!isDev && !/;\s*Secure(?:\s*;|\s*$)/i.test(out)) {
    out = `${out}; Secure`;
  }
  if (!/;\s*SameSite=/i.test(out)) {
    out = `${out}; SameSite=Lax`;
  }
  if (/auth|session|sid|token/i.test(cookieStr) && !/;\s*HttpOnly/i.test(out)) {
    app.log.warn(
      "Upstream Set-Cookie for a session-shaped name is missing HttpOnly: %s",
      cookieStr.split(";")[0],
    );
  }
  return out;
}

// SECURITY (report FND-04 / FND-18): Helmet provides CSP + COEP + COOP + CORP.
// CSP is shipped report-only first; flip to enforced via the
// FLIP_CSP_TO_ENFORCED env var after a release cycle of zero violation noise.
const flipCspToEnforced = env.FLIP_CSP_TO_ENFORCED === "1";
const cspDirectives = {
  defaultSrc: ["'self'"],
  // SECURITY (report F-02): Google Tag Manager removed from scriptSrc. GTM is a
  // tag-execution engine — whitelisting it lets any GTM container tag load
  // arbitrary JS on the storefront origin, fully bypassing this script policy.
  // It is not used anywhere in the codebase, so the entry is simply dropped.
  scriptSrc: [
    "'self'",
    "https://cdn.fynd.com",
    "https://cdn.copilot.live",
    "https://accounts.google.com",
  ],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  fontSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'", "https://*.fynd.com", "https://api.fynd.com"],
  frameSrc: [
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com",
    "https://player.vimeo.com",
    "https://accounts.google.com",
  ],
  objectSrc: ["'none'"],
  frameAncestors: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
};

// --- Plugins ---
app.register(fastifyCompress);

// SECURITY (report FND-33): HSTS must not be set on the JSON proxy responses
// (different upstream chain) and must not break clients that hit non-HTTPS
// origins during local development. Helmet is scoped to skip the proxy paths.
app.register(fastifyHelmet, {
  // SECURITY (report F-01): generate a per-request CSP nonce. Without this, the
  // inline boot <script> (and the inline loader <style>) are blocked the moment
  // CSP is enforced (FLIP_CSP_TO_ENFORCED=1), leaving window.__APP_CREDENTIALS__
  // and window.__CSRF_TOKEN__ undefined — a full storefront outage. Helmet
  // appends 'nonce-<value>' to script-src/style-src per response; we stamp the
  // matching nonce onto the inline tags at render time (see renderIndexHtml and
  // the dev injector). reply.cspNonce.{script,style} carries the raw values.
  enableCSPNonces: true,
  contentSecurityPolicy: {
    directives: cspDirectives,
    reportOnly: !flipCspToEnforced,
  },
  crossOriginEmbedderPolicy: { policy: "credentialless" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-site" },
  hsts: isDev
    ? false
    : {
        maxAge: 15552000, // 180 days — long enough to be useful, short enough to recover from a misconfig.
        includeSubDomains: true,
        preload: false,
      },
  // Skip Helmet entirely on proxied API paths; those responses are JSON
  // consumed by the SPA and CSP/HSTS on them is unnecessary at best.
  skip: (req) => PROXY_PREFIXES.some((p) => req.url.startsWith(p)),
});

let cachedIndexHtml = null;

// SECURITY (report F-01): stamp the per-request CSP nonce onto every inline tag
// so it survives CSP enforcement. The boot <script> gets the script nonce; the
// loader <style> in the template gets the style nonce (once style-src carries a
// nonce, 'unsafe-inline' is ignored by CSP3 browsers, so the inline style needs
// the nonce too). Nonces are spliced per request and never cached.
function renderIndexHtml(csrfToken, cspNonce = { script: "", style: "" }) {
  // Cache only the static portion of the HTML. CSRF token and CSP nonces are
  // rotated per response so we splice them in at render time via placeholders.
  if (!cachedIndexHtml) {
    const rawIndexHtml = readFileSync(indexHtmlPath, "utf-8");
    const { applicationID, applicationToken } = getRuntimeAppCredentials();
    const credsLiteral = escapeForInlineScript({
      applicationID,
      applicationToken,
    });
    const inlineBoot =
      `<script nonce="__SCRIPT_NONCE__">window.__APP_CREDENTIALS__=${credsLiteral};` +
      `window.__CSRF_TOKEN__=__CSRF_TOKEN_PLACEHOLDER__;</script>`;
    const withNoncedStyle = rawIndexHtml.replace(
      "<style>",
      '<style nonce="__STYLE_NONCE__">',
    );
    cachedIndexHtml = withNoncedStyle.includes("</head>")
      ? withNoncedStyle.replace("</head>", `${inlineBoot}</head>`)
      : `${inlineBoot}${withNoncedStyle}`;
    if (isDev) cachedIndexHtml = null; // do not cache in dev
  }
  // Re-render on each request in dev; in prod splice the per-request values in.
  const base = cachedIndexHtml || readFileSync(indexHtmlPath, "utf-8");
  return base
    .replace("__CSRF_TOKEN_PLACEHOLDER__", JSON.stringify(csrfToken))
    .replace("__SCRIPT_NONCE__", cspNonce.script || "")
    .replace("__STYLE_NONCE__", cspNonce.style || "");
}

for (const key of APP_CREDENTIAL_KEYS) {
  if (!env[key]) {
    app.log.warn(`${key} is not set. Client bootstrap will fail without it.`);
  }
}

// --- Routes ---
app.get("/__health", async () => ({ status: "ok" }));
// SECURITY (report FND-23): the previous /__version response disclosed the
// PROXY_TARGET hostname, which mapped internal infrastructure for any
// reconnaissance scan. Return only the build id.
app.get("/__version", async () => ({ build: BUILD_ID }));

// --- API Proxy: /service, /ext, /graphql -> Fynd API ---
if (PROXY_TARGET) {
  const proxyReplyOptions = {
    rewriteHeaders: (headers) => {
      const setCookie = headers["set-cookie"];
      if (!setCookie) return headers;
      const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
      return {
        ...headers,
        "set-cookie": cookies.map(hardenSetCookie),
      };
    },
  };

  // SECURITY (FND-13 / FND-15): preHandler strips Origin/Referer headers so
  // the upstream cannot echo them into Access-Control-Allow-Origin, and
  // verifies the CSRF double-submit for state-changing requests.
  const proxyPreHandler = async (req, reply) => {
    if (req.headers) {
      delete req.headers.origin;
      delete req.headers.referer;
      delete req.headers.referrer;
    }
    if (isDev) return; // dev: skip CSRF to keep curl/Postman flows usable
    const method = (req.method || "GET").toUpperCase();
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;
    const cookieToken = parseCookie(req.headers.cookie, CSRF_COOKIE_NAME);
    const headerToken = req.headers[CSRF_HEADER_NAME];
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      reply.code(403).send({ error: "csrf_validation_failed" });
      return reply;
    }
  };

  for (const prefix of PROXY_PREFIXES) {
    app.register(fastifyHttpProxy, {
      upstream: PROXY_TARGET,
      prefix,
      rewritePrefix: prefix,
      http2: false,
      replyOptions: proxyReplyOptions,
      preHandler: proxyPreHandler,
    });
  }

  app.log.info(`Proxy: ${PROXY_PREFIXES.join(", ")} -> ${PROXY_TARGET}`);
} else {
  app.log.warn(
    "PROXY_TARGET (or DOMAIN) not set. API proxy disabled for /service, /ext, /graphql.",
  );
}

// --- Dev: forward all other traffic to webpack-dev-server ---
if (isDev) {
  // SECURITY (report FND-01 / FND-08): credentials must never be baked into the
  // bundle that WDS serves. So for top-level HTML navigations we fetch the
  // document from WDS and splice in window.__APP_CREDENTIALS__ + CSRF at request
  // time, mirroring the prod renderIndexHtml() path. Assets, HMR and websocket
  // traffic fall through to the proxy untouched.
  const injectDevCredentials = async (req, reply) => {
    const method = (req.method || "GET").toUpperCase();
    const accept = req.headers.accept || "";
    if (method !== "GET" || !accept.includes("text/html")) return;

    let html;
    try {
      const upstream = await fetch(`${WDS_URL}${req.url}`, {
        headers: { accept: "text/html" },
      });
      const contentType = upstream.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) return; // real asset: let proxy handle
      html = await upstream.text();
    } catch {
      return; // WDS unreachable: let the proxy surface the error
    }

    const csrfToken = generateCsrfToken();
    // SECURITY (report F-01): stamp the per-request CSP nonce onto the injected
    // boot <script> and the loader <style> so they survive CSP enforcement,
    // mirroring the prod renderIndexHtml() path.
    const nonce = reply.cspNonce || { script: "", style: "" };
    const { applicationID, applicationToken } = getRuntimeAppCredentials();
    const credsLiteral = escapeForInlineScript({ applicationID, applicationToken });
    const inlineBoot =
      `<script nonce="${nonce.script || ""}">window.__APP_CREDENTIALS__=${credsLiteral};` +
      `window.__CSRF_TOKEN__=${JSON.stringify(csrfToken)};</script>`;
    const withNoncedStyle = html.replace(
      "<style>",
      `<style nonce="${nonce.style || ""}">`,
    );
    const injected = withNoncedStyle.includes("</head>")
      ? withNoncedStyle.replace("</head>", `${inlineBoot}</head>`)
      : `${inlineBoot}${withNoncedStyle}`;

    reply
      .header("Cache-Control", "no-cache")
      .header(
        "Set-Cookie",
        `${CSRF_COOKIE_NAME}=${csrfToken}; Path=/; SameSite=Lax`,
      )
      .type("text/html")
      .send(injected);
    return reply;
  };

  app.register(fastifyHttpProxy, {
    upstream: WDS_URL,
    prefix: "/",
    websocket: true,
    preHandler: injectDevCredentials,
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
    // Requests with a file extension: try serving the static file.
    if (/\.\w{2,}$/.test(urlPath)) {
      // SECURITY (report FND-33): /index.html must not be served with the
      // immutable 1-year cache header, otherwise SPA shell updates can take
      // up to a year to reach returning visitors.
      if (urlPath === "/index.html" || urlPath.endsWith("/index.html")) {
        reply.header("Cache-Control", "no-cache");
      } else {
        reply.header("Cache-Control", "public, max-age=31536000, immutable");
      }
      return reply.sendFile(urlPath);
    }
    // SPA fallback: serve index.html for all route paths
    const csrfToken = generateCsrfToken();
    const cookieAttrs = [
      `${CSRF_COOKIE_NAME}=${csrfToken}`,
      "Path=/",
      "SameSite=Lax",
    ];
    if (!isDev) cookieAttrs.push("Secure");
    return reply
      .header("Cache-Control", "no-cache")
      .header("Set-Cookie", cookieAttrs.join("; "))
      .type("text/html")
      .send(renderIndexHtml(csrfToken, reply.cspNonce));
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

// handler.js — Boltic serverless handler: static files + API proxy
import { readFileSync, existsSync } from "fs";
import { join, extname, resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------------------------------------------------------
// Environment: read .env (baked into container at build) + process.env
// ---------------------------------------------------------------------------
function readEnvFromFile(filePath) {
  try {
    const content = readFileSync(filePath, { encoding: "utf-8" });
    return content.split("\n").reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return acc;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) return acc;
      acc[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
      return acc;
    }, {});
  } catch {
    return {};
  }
}

const envFromFile = readEnvFromFile(resolve(__dirname, ".env"));
const env = { ...envFromFile, ...process.env };
const BUILD_ID = env.BUILD_ID || "turbo-proxy-v5-20260304";

function toProxyTarget(domain) {
  if (!domain || typeof domain !== "string") return null;
  const d = domain.trim();
  if (/^https?:\/\//i.test(d)) return d;
  return `https://${d}`;
}

const PROXY_TARGET = env.PROXY_TARGET || toProxyTarget(env.DOMAIN);

// ---------------------------------------------------------------------------
// CORS / preflight (defensive for serverless + browser clients)
// ---------------------------------------------------------------------------
function getRequestHeader(headers, key) {
  if (!headers) return undefined;
  const target = String(key).toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (String(k).toLowerCase() === target) return v;
  }
  return undefined;
}

function addCorsHeaders(event, res) {
  const origin = getRequestHeader(event?.headers, "origin");
  if (!origin) return;

  const allowedOriginsRaw = env.ALLOWED_ORIGINS || "";
  const allowed = allowedOriginsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const host = getRequestHeader(event?.headers, "host");
  const selfOrigins = host ? [`https://${host}`, `http://${host}`] : [];

  const isAllowed =
    allowed.length === 0
      ? selfOrigins.includes(origin) ||
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1")
      : allowed.includes(origin);

  if (!isAllowed) return;

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Vary", "Origin");
}

// ---------------------------------------------------------------------------
// Static file serving
// ---------------------------------------------------------------------------
const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase();
  return mimeTypes[ext] || "application/octet-stream";
}

// ---------------------------------------------------------------------------
// API proxy: forward /service, /ext and /graphql to Fynd API with cookie rewriting
// ---------------------------------------------------------------------------
function collectBody(req) {
  // Prefer streaming body (raw bytes), but some serverless runtimes pre-parse
  // the body and expose it only via req.body (stream may already be consumed).
  if (typeof req.on === "function") {
    return new Promise((resolve, reject) => {
      const chunks = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => {
        const buf = Buffer.concat(chunks);
        // If stream was already consumed (empty) but req.body exists, fall back.
        if (buf.length === 0 && req.body != null) {
          resolve(bodyToBuffer(req.body));
        } else {
          resolve(buf);
        }
      });
      req.on("error", reject);
    });
  }
  if (req.body != null) {
    return Promise.resolve(bodyToBuffer(req.body));
  }
  return Promise.resolve(null);
}

function bodyToBuffer(body) {
  if (Buffer.isBuffer(body)) return body;
  if (typeof body === "string") return Buffer.from(body);
  // Pre-parsed JSON object — re-serialize so the upstream receives valid JSON.
  return Buffer.from(JSON.stringify(body));
}

async function proxyToFynd(event, res, requestUrl) {
  res.setHeader("x-turbo-build", BUILD_ID);
  addCorsHeaders(event, res);
  if (!PROXY_TARGET) {
    res.statusCode = 502;
    res.setHeader("Content-Type", "text/plain");
    res.end("Proxy not configured: set DOMAIN or PROXY_TARGET env var");
    return;
  }

  const targetUrl = PROXY_TARGET.replace(/\/+$/, "") + requestUrl;
  const method = (event.method || "GET").toUpperCase();

  if (method === "OPTIONS") {
    res.statusCode = 204;
    const reqAllowHeaders =
      getRequestHeader(event?.headers, "access-control-request-headers") ||
      "Content-Type, Authorization";
    const reqAllowMethod =
      getRequestHeader(event?.headers, "access-control-request-method") ||
      "GET,POST,PUT,PATCH,DELETE";
    res.setHeader("Access-Control-Allow-Methods", reqAllowMethod);
    res.setHeader("Access-Control-Allow-Headers", reqAllowHeaders);
    res.setHeader("Access-Control-Max-Age", "600");
    res.end();
    return;
  }

  const fwdHeaders = {};
  const reqHeaders = event.headers || {};
  // Strip hop-by-hop headers and origin/referer so api.fynd.com treats this
  // as a clean server-to-server call and does not issue any origin-based redirect.
  const SKIP_HEADERS = new Set([
    "host",
    "connection",
    "content-length",
    "origin",
    "referer",
    "transfer-encoding",
  ]);
  for (const [k, v] of Object.entries(reqHeaders)) {
    if (!SKIP_HEADERS.has(k.toLowerCase())) {
      fwdHeaders[k] = v;
    }
  }

  let body = null;
  if (method !== "GET" && method !== "HEAD") {
    body = await collectBody(event);
    if (body && body.length) {
      fwdHeaders["content-length"] = String(body.length);
    }
  }

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers: fwdHeaders,
      body,
      redirect: "follow",
    });

    res.statusCode = upstream.status;

    const setCookies =
      typeof upstream.headers.getSetCookie === "function"
        ? upstream.headers.getSetCookie()
        : [];

    for (const [key, value] of upstream.headers.entries()) {
      const lower = key.toLowerCase();
      if (lower === "set-cookie" || lower === "transfer-encoding") continue;
      try {
        res.setHeader(key, value);
      } catch {
        /* skip headers the runtime rejects */
      }
    }

    if (setCookies.length) {
      res.setHeader(
        "set-cookie",
        setCookies.map((c) => c.replace(/;\s*[Dd]omain=[^;]+/g, "")),
      );
    }

    const responseBody = Buffer.from(await upstream.arrayBuffer());
    res.end(responseBody);
  } catch (err) {
    console.error("Proxy error:", err);
    res.statusCode = 502;
    res.setHeader("Content-Type", "text/plain");
    res.end("Bad Gateway");
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
const handler = async (event, res) => {
  try {
    res.setHeader("x-turbo-build", BUILD_ID);
    addCorsHeaders(event, res);

    // Some serverless runtimes pass the full URL (https://host/path?q) rather
    // than just the path.  Normalise to a relative path + query string.
    const rawUrl = event.url || event.path || "/";
    let url = rawUrl;
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      try {
        const parsed = new URL(rawUrl);
        url = parsed.pathname + (parsed.search || "");
      } catch {
        /* keep rawUrl as-is */
      }
    }
    const pathname = url.split("?")[0].split("#")[0];

    // Health / version endpoint — used to confirm which build is running.
    if (pathname === "/__version" || pathname === "/__health") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ build: BUILD_ID, proxy: PROXY_TARGET || "not configured" }),
      );
      return;
    }

    // Proxy API paths to Fynd
    if (
      pathname.startsWith("/service") ||
      pathname.startsWith("/ext") ||
      pathname.startsWith("/graphql")
    ) {
      return proxyToFynd(event, res, url);
    }

    // --- Static file serving (unchanged logic) ---
    const distPath = resolve(join(__dirname, "dist"));
    const cleanPath = pathname === "/" ? "index.html" : pathname.slice(1);

    if (cleanPath.includes("..")) {
      res.statusCode = 403;
      res.setHeader("Content-Type", "text/plain");
      res.end("Forbidden");
      return;
    }

    let filePath = resolve(distPath, cleanPath);

    if (!filePath.startsWith(distPath)) {
      res.statusCode = 403;
      res.setHeader("Content-Type", "text/plain");
      res.end("Forbidden");
      return;
    }

    const isStaticAsset =
      /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|otf|json)$/i.test(
        cleanPath,
      );

    if (existsSync(filePath)) {
      try {
        const fileContent = readFileSync(filePath);
        const mimeType = getMimeType(filePath);
        res.statusCode = 200;
        res.setHeader("Content-Type", mimeType);
        if (isStaticAsset) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else {
          res.setHeader("Cache-Control", "no-cache");
        }
        res.end(fileContent);
        return;
      } catch (readError) {
        console.error("Error reading file:", readError);
        res.statusCode = 500;
        res.setHeader("Content-Type", "text/plain");
        res.end("Internal Server Error");
        return;
      }
    }

    if (!isStaticAsset) {
      const indexPath = resolve(distPath, "index.html");
      if (existsSync(indexPath)) {
        try {
          const htmlContent = readFileSync(indexPath, "utf-8");
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html");
          res.setHeader("Cache-Control", "no-cache");
          res.end(htmlContent);
          return;
        } catch (htmlError) {
          console.error("Error reading index.html:", htmlError);
        }
      }
    }

    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Not Found");
  } catch (error) {
    console.error("Handler error:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end("Internal Server Error");
  }
};

export { handler };

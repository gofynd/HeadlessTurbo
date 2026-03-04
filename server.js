import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
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
const PROXY_TARGET = env.PROXY_TARGET || getProxyTarget(env.DOMAIN);
const WDS_PORT = Number(env.TURBO_DEV_PORT) || 5002;
const WDS_URL = env.WDS_URL || `http://localhost:${WDS_PORT}`;
const distPath = resolve(join(__dirname, "dist"));

const app = express();

// Single API proxy for both dev and prod: /service, /ext and /graphql -> Fynd API
if (PROXY_TARGET) {
  const apiProxyOptions = {
    target: PROXY_TARGET,
    changeOrigin: true,
    secure: true,
    cookieDomainRewrite: "",
    on: {
      proxyRes(proxyRes) {
        const setCookie = proxyRes.headers["set-cookie"];
        if (!setCookie) return;
        const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
        proxyRes.headers["set-cookie"] = cookies.map((header) =>
          header.replace(/;\s*[Dd]omain=[^;]+/g, ""),
        );
      },
    },
  };
  app.use(["/service", "/ext", "/graphql"], createProxyMiddleware(apiProxyOptions));
  console.log(`Proxy: /service, /ext, /graphql -> ${PROXY_TARGET}`);
} else {
  console.warn(
    "PROXY_TARGET (or DOMAIN) not set. API proxy disabled for /service, /ext, /graphql.",
  );
}

if (isDev) {
  // Dev: forward all other traffic to webpack-dev-server (HMR, live reload)
  app.use(
    createProxyMiddleware({
      target: WDS_URL,
      ws: true,
    }),
  );
  console.log(`Dev mode: app traffic -> ${WDS_URL}`);
} else {
  // Prod: serve static + SPA fallback
  app.use(
    express.static(distPath, {
      maxAge: "1y",
      immutable: true,
      index: false,
    }),
  );
  app.get("*", (_req, res) => {
    res.set("Cache-Control", "no-cache");
    res.sendFile("index.html", { root: distPath });
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

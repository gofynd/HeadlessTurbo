/**
 * Single entry point for dev: starts webpack-dev-server (WDS), then server.js.
 * server.js is the only proxy (sidecar) for both dev and prod; in dev it forwards
 * app traffic to WDS and API traffic to PROXY_TARGET.
 */
import { spawn } from "child_process";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function readEnv() {
  try {
    const content = readFileSync(resolve(root, ".env"), { encoding: "utf-8" });
    return content.split("\n").reduce((acc, line) => {
      const t = line.trim();
      if (!t || t.startsWith("#")) return acc;
      const eq = t.indexOf("=");
      if (eq <= 0) return acc;
      acc[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
      return acc;
    }, {});
  } catch {
    return {};
  }
}

function waitFor(url, maxAttempts = 60) {
  return new Promise((resolveWait, rejectWait) => {
    let attempts = 0;
    const tryFetch = () => {
      attempts += 1;
      fetch(url, { method: "GET" })
        .then((r) => {
          if (r.ok) return resolveWait();
          if (attempts >= maxAttempts) rejectWait(new Error(`WDS not ready at ${url}`));
          else setTimeout(tryFetch, 500);
        })
        .catch(() => {
          if (attempts >= maxAttempts) rejectWait(new Error(`WDS not ready at ${url}`));
          else setTimeout(tryFetch, 500);
        });
    };
    tryFetch();
  });
}

const env = readEnv();
const wdsPort = Number(env.TURBO_DEV_PORT) || 5002;
const wdsUrl = `http://localhost:${wdsPort}`;
const appPort = Number(env.PORT) || 8080;

console.log(`Starting webpack-dev-server on ${wdsPort}...`);
const wds = spawn(
  "npx",
  ["webpack", "serve", "--config", "webpack.config.cjs", "--mode", "development"],
  {
    stdio: "inherit",
    env: process.env,
    cwd: root,
    shell: true,
  },
);

wds.on("error", (err) => {
  console.error("Failed to start webpack-dev-server:", err);
  process.exit(1);
});

console.log(`Waiting for ${wdsUrl}...`);
waitFor(wdsUrl)
  .then(() => {
    console.log(`Starting proxy server on port ${appPort} (DEV=1). Open http://localhost:${appPort}`);
    const server = spawn("node", ["server.js"], {
      stdio: "inherit",
      env: { ...process.env, DEV: "1", PORT: String(appPort) },
      cwd: root,
    });
    server.on("error", (err) => {
      console.error("Failed to start server.js:", err);
      process.exit(1);
    });
    server.on("exit", (code) => {
      process.exit(code ?? 0);
    });
  })
  .catch((err) => {
    console.error(err.message);
    wds.kill();
    process.exit(1);
  });

# CORS on Production — Debug & Fix

## Root Cause Analysis (Updated 2026-03-04)

Three distinct root causes identified via live-server inspection:

1. **`redirect: "manual"` in handler.js** — fixed in commit `35ffa49`.

2. **Boltic rebuilds frontend from source without `USE_PROXY=true`** — the OLD `app.jsx` used
   `getApiDomainForClient()` which returns `"https://api.fynd.com"` when `USE_PROXY` is not set.
   This caused the Boltic-built bundle to hardcode `api.fynd.com` as the FPIClient domain,
   bypassing the proxy entirely. Fixed by adding `USE_PROXY: "true"` to `boltic.yaml` env.

3. **handler.js pathname parsing fails for full-URL `event.url`** — Boltic's serverless runtime
   passes the full request URL (`https://host/path`) in `event.url`. The old code split on `?`
   only, leaving the pathname as `https://...` instead of `/service/...`, so
   `pathname.startsWith("/service")` was always `false` → handler served `index.html` for every
   API request instead of proxying. Fixed in commit `f95d95c`.

## Plan

- [x] Fix `redirect: "manual"` → `redirect: "follow"` in handler.js
- [x] Add `systemvars: true` to dotenv-webpack in webpack.config.cjs
- [x] Strip `Origin`/`Referer` headers forwarded to upstream API
- [x] Fix collectBody for pre-parsed body in serverless environments
- [x] Add `USE_PROXY: "true"` to boltic.yaml env
- [x] Fix handler.js to extract path from full URL in event.url
- [x] Add `/__version` health endpoint to verify active deployment
- [x] Update BUILD_ID to turbo-proxy-v5

## Review

- `handler.js` — correct path parsing, full URL safety, health endpoint, BUILD_ID bump
- `boltic.yaml` — USE_PROXY=true ensures Boltic build uses proxy mode regardless of app.jsx version

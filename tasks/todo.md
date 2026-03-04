# CORS on Production — Debug & Fix

## Root Cause Analysis

All GraphQL calls on the deployed app go through `fpi.executeGQL` (fdk-store-gql), which
builds the URL as `${this.domain}/service/application/graphql/`. `storefront-graphql.js`
is NOT in this call path.

Two issues found:

1. **`redirect: "manual"` in handler.js (primary cause)** — `fdk-store-gql` calls
   `/service/application/graphql/` (same-origin, relative URL). The Boltic handler proxies
   this to `https://api.fynd.com/service/application/graphql/`. If Fynd's API returns any
   HTTP redirect (e.g. auth redirect, HTTPS enforcement), `redirect: "manual"` makes the
   handler forward the raw `3xx + Location: https://api.fynd.com/...` to the browser. The
   browser then follows it cross-origin → CORS error.

2. **`dotenv-webpack` missing `systemvars: true`** — `.env` is in `.gitignore`; Boltic uses
   `.gitignore` as its build ignorefile. Without `systemvars: true`, env vars injected by the
   Boltic console (APPLICATION_ID, APPLICATION_TOKEN, DOMAIN) are ignored at webpack
   compile-time → `process.env.*` are `undefined` in the browser bundle → app crashes before
   initialization.

## Plan

- [x] Fix `redirect: "manual"` → `redirect: "follow"` in handler.js
- [x] Add `systemvars: true` to dotenv-webpack in webpack.config.cjs
- [x] Verify and review changes

## Review

Changes applied to two files:
- `handler.js` — proxy follows redirects server-side; browser never sees a cross-origin redirect
- `webpack.config.cjs` — systemvars fallback for when .env is absent during CI/cloud builds

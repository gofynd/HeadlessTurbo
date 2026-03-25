# Lessons

## 2026-02-18: Auth persistence + store rehydration

- When seeding a Redux store from localStorage (e.g. `{ auth: { logged_in: true } }`),
  any code that short-circuits on that flag must also verify the dependent data is present.
  In this case, the auth guard returned `true` when `logged_in` was set, but `user_data`
  was missing, causing components to crash on destructuring `undefined`.
- Always use defensive destructuring (`|| {}`) when consuming store selectors that may
  return `undefined` during hydration race conditions.
- When adding a persistence write path, verify the corresponding read path and all
  downstream consumers handle the partial-state scenario.

## 2026-02-18: Empty profile fields after login

- User profile data comes from Fynd GraphQL `user { logged_in_user { ... } }`. The FDK stores it in `auth.user_data` when the query response is handled; the profile page reads `fpi.getters.USER_DATA` or `fpi.getters.CUSTOM_VALUE?.user_Data`.
- After a full-page redirect post-login, only `logged_in: true` was persisted; `user_data` was lost. Persist the user payload (from login mutation or from USER_DATA_QUERY) with auth and rehydrate into `storeInitialData.auth` so the profile page has data on load.
- When running USER_DATA_QUERY manually (e.g. in auth-guard or profile page), sync the response to `fpi.custom.setValue("user_Data", { logged_in_user })` so components that read from custom store get the data even if FDK handler runs in a different order.

## 2026-03-04: CORS errors in production serverless proxy

- **`redirect: "manual"` in server-side proxy is dangerous.** When the upstream API redirects
  (e.g. `/graphql` → `/graphql/`), the proxy forwards the `3xx + Location: https://api.fynd.com/...`
  response to the browser. The browser follows the redirect cross-origin → CORS error.
  Always use `redirect: "follow"` in a transparent proxy so redirects are resolved server-side.
- **All prod GraphQL calls go through `fpi.executeGQL` (fdk-store-gql), not Apollo/storefront-graphql.js.**
  Verify the actual call path before assuming which client is responsible for CORS failures.
- **`systemvars: true` in dotenv-webpack is required for CI/cloud builds** where `.env` may be
  excluded (e.g. via `.gitignore` in the Boltic build context). Without it, env vars injected
  by the cloud console are ignored at webpack compile-time, causing `process.env.*` to be
  `undefined` in the browser bundle.
- **Boltic's serverless runtime passes the full URL in `event.url`** — not just the path.
  `event.url` may be `https://host/service/application/graphql/`. Always extract `pathname`
  using `new URL(rawUrl).pathname` when `rawUrl` starts with `http://` or `https://`.
  Without this, `pathname.startsWith("/service")` always fails and the handler falls through
  to serving `index.html` for every API request.
- **Add a `/__version` health endpoint to every serverless handler** so you can instantly
  verify which build is live without reading logs or checking the dashboard.
- **Confirm actual deployed code via a live probe before debugging.** Check for a known
  response header (e.g. `x-turbo-build`) or hit a health endpoint. The live server may be
  running code that is several commits behind even if git push succeeded.

## 2026-02-19: Add to watchlist 401 when logged in (local dev)

- Fynd Storefront API requires a session **cookie** for user-associated operations (e.g. `followById`). The Bearer header is app credentials only; user identity is via cookie.
- When proxying to the API from localhost, the API’s `Set-Cookie` often has `Domain=<api host>`, so the browser does not send that cookie to localhost. Fix: in the dev proxy, set `cookieDomainRewrite: ""` so the cookie becomes host-only for localhost and is sent on subsequent requests.
- "Copy as cURL" from DevTools usually omits HttpOnly cookies, so pasted curl can get 401 even when the same request works in the browser.

## 2026-03-13: Page props naming + modularization

- Avoid temporary naming in production-facing constants. Use domain names like `HOME_PAGE_SECTIONS` instead of `*_DUMMY_*`.
- Keep page modules thin and explicit: each page should import from its own `theme/props/<page>.js` module instead of a monolithic helper.
- For shared UI fallback data, split by concern (`header`, `footer`, `app-info`, `support`) so consuming components only depend on what they need.

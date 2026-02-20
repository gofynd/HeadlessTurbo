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

## 2026-02-19: Add to watchlist 401 when logged in (local dev)

- Fynd Storefront API requires a session **cookie** for user-associated operations (e.g. `followById`). The Bearer header is app credentials only; user identity is via cookie.
- When proxying to the API from localhost, the API’s `Set-Cookie` often has `Domain=<api host>`, so the browser does not send that cookie to localhost. Fix: in the dev proxy, set `cookieDomainRewrite: ""` so the cookie becomes host-only for localhost and is sent on subsequent requests.
- "Copy as cURL" from DevTools usually omits HttpOnly cookies, so pasted curl can get 401 even when the same request works in the browser.

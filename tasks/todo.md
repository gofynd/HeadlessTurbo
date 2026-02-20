# Fix Auth Persistence - Login Flow

## Problem

After logging in, navigating to profile/details redirects back to login.
After fixing persistence, profile page crashes: `Cannot destructure property 'first_name' of undefined`.

### Root Cause (Phase 1 — redirect loop)

`setPersistedAuth(true)` was never called after any login method. Store was never seeded on reload.

### Root Cause (Phase 2 — crash after persistence fix)

Auth guard short-circuited when `store.auth.logged_in === true` (from localStorage), returning immediately
without fetching user data. Profile component destructured `fpi.getters.USER_DATA` which was `undefined`.

## Tasks

- [x] 1. `useAccounts.jsx`: Persist auth on all login methods, clear on logout
- [x] 2. `useLogin.jsx`: Persist auth on social login redirect
- [x] 3. `auth-guard.js`: Fetch user data when `logged_in=true` but `user_data` missing
- [x] 4. `profile-root.jsx`: Add `|| {}` fallback on USER_DATA destructuring
- [x] 5. `useEmail.jsx`: Add `|| {}` fallback on USER_DATA destructuring
- [x] 6. `usePhone.jsx`: Add `|| {}` fallback on USER_DATA destructuring
- [x] 7. Verify no lint errors

## Fix Empty Profile Fields After Login (2026-02-18)

### Problem

After login, My Profile page showed empty fields (First Name, Last Name, DOB, Mobile, Gender). User data was not available because: (1) only `logged_in: true` was persisted, not `user_data`; (2) after redirect the store had no user payload; (3) USER_DATA_QUERY response was not explicitly synced to custom store as fallback.

### Solution (Fynd GraphQL user query)

- **Source of truth**: [Storefront GraphQL API](https://docs.fynd.com/partners/commerce/sdk/latest/graphql/application/client-libraries) — `user { logged_in_user { ... } }` (see `USER_DATA_QUERY` in `libQuery.js`). FDK stores response in `auth.user_data` via its user query handler.
- **Persistence**: Persist `user_data` with auth so on rehydration the store has profile data.
- **Sync**: After any USER_DATA_QUERY that returns `logged_in_user`, sync to `fpi.custom.setValue("user_Data", { logged_in_user })` so profile page can read from `userDataStore || customUserData`.

### Tasks

- [x] 1. `auth-persistence.js`: get/set optional `user_data` in persisted auth
- [x] 2. `App.jsx`: pass full `persistedAuth` (including `user_data`) as store initial data
- [x] 3. `useLogin.jsx`: on social login success persist `data.user` with auth
- [x] 4. `useAccounts.jsx`: on password/OTP login success persist mutation `user` with auth
- [x] 5. `auth-guard.js`: after USER_DATA_QUERY sync `logged_in_user` to custom and persist
- [x] 6. `profile-details-page.jsx`: on USER_DATA_QUERY response set custom `user_Data` from result

## Review

### Files Changed

- `theme/helper/hooks/useAccounts.jsx` — persist on 4 login methods + clear on logout; persist user on password/OTP login
- `theme/page-layouts/login/useLogin.jsx` — persist auth + user on social login redirect
- `theme/helper/auth-guard.js` — only short-circuit when both `logged_in` and `user_data` exist; sync user query result to custom and persist
- `theme/helper/auth-persistence.js` — get/set optional user_data for rehydration
- `theme/App.jsx` — seed store with persisted user_data when present
- `theme/page-layouts/profile/profile-details-page.jsx` — set custom user_Data from USER_DATA_QUERY response
- `theme/components/profile/profile-root.jsx` — defensive `|| {}` fallback
- `theme/page-layouts/profile/useEmail.jsx` — defensive `|| {}` fallback
- `theme/page-layouts/profile/usePhone.jsx` — defensive `|| {}` fallback

## Fix PDP Not Opening from PLP / Collection / Brand (2026-02-19)

### Problem

Clicking a product from PLP, collection, or brand opened a "Page Not Found" because the link was `/{slug}` (e.g. `/royal-canin-maxi-adult-dry-dog-food-12872251`) while the app route for PDP is `/product/:slug`.

### Root Cause

`convertActionToUrl` in `fdk-core/utils.js` was returning slug-only URLs when the API sent product links as type `"page"` or `"link"` with only the slug (no `/product/` prefix). The theme route expects `/product/:slug`.

### Solution

Normalize slug-only (or single-segment) URLs that look like product slugs to `/product/:slug` inside `convertActionToUrl`:

- Treat a segment as a product slug when it matches the common pattern (hyphenated, ending with `-digits`) and is not a reserved route segment (e.g. blog, cart, profile).
- Apply this for type `"page"` (slug or explicitUrl), type `"link"`, and the fallback path.

### Tasks

- [x] 1. Add `RESERVED_SEGMENTS` and `isProductSlugSegment()` in `fdk-core/utils.js`
- [x] 2. For type `"page"`: if slug looks like product slug, return `/product/${slug}`; else keep `/${slug}`; same for explicitUrl when no slug
- [x] 3. For type `"link"` and fallback: if normalized path is a single segment that looks like product slug, return `/product/${segment}`
- [x] 4. Verify no lint errors

### Review

- **File changed**: `theme/fdk-core/utils.js`
- **Behavior**: Product links from PLP/collection/brand that were rendered as `/{slug}` now resolve to `/product/{slug}`, so the existing route `path="/product/:slug"` matches and PDP loads.
- **Risk**: Only segments matching `^.+-[0-9]+$` and not in the reserved list are treated as product slugs; other single-segment links are unchanged.

### Follow-up: PDP still 404 when link is /slug (2026-02-19)

PLP/collection product links from theme-template still opened as `/{slug}` (no `/product/`), so redirect continued to fail. **Additional fix**: accept both URL shapes in the router.

- **Route**: Added `path=":slug"` before the `*` catch-all, with `handle={{ pageType: "product-description" }}` so the data layer fetches PDP by slug.
- **ProductBySlugGate**: Wrapper in `routes.jsx` that reads `slug` from params; if `slug` is in `RESERVED_PATH_SEGMENTS`, renders NotFoundPage; otherwise renders ProductDescription. Ensures `/blog`, `/cart`, etc. still 404.
- **Export**: `RESERVED_PATH_SEGMENTS` exported from `fdk-core/utils.js` for use in the route wrapper.
- **Result**: Both `/product/xyz` and `/xyz` (when `xyz` is a product slug) open the PDP; reserved single segments still show 404.

### PDP Add to Cart / Size not showing (2026-02-19)

**Problem**: Product page showed name, price, description but no size selector or Add to Cart button.

**Cause**: PDP section renders blocks from `PDP_PAGE_DUMMY_SECTIONS.productDescription.blocks`. The size selector and Add to Cart are rendered only by the **size_wrapper** block. Dummy data had `product_variants`, `delivery_info`, and `add_to_cart` but no **size_wrapper**; there is no switch case for `delivery_info` or `add_to_cart`, so those did nothing.

**Fix** (`theme/helper/dummy-data.js`):
- Added **size_wrapper** block with `hide_single_size: false`, `size_selection_style: "dropdown"` so SIZE and Add to Cart render.
- Replaced **delivery_info** with **pincode** (section has a "pincode" case that renders DeliveryInfo).
- Removed **add_to_cart** block (button is inside size_wrapper).

## Fix Add to Watchlist 401 "User is not logged in" (2026-02-19)

### Problem

When logged in, the add-to-watchlist (`followById`) GraphQL mutation returns 401 with "User is not logged in" even though the profile page shows the user as authenticated.

### Root Cause

- Fynd Storefront API requires a **session cookie** for user-associated operations (docs: "cookie is needed in cases where user information is associated").
- In local dev, the app runs on `localhost` and the proxy forwards `/service` to the API (e.g. `https://api.uat.fyndx1.de`). The API sets the session cookie with `Domain=api.uat.fyndx1.de`, so the browser only sends that cookie to the API domain, not to `localhost`. Proxied requests from the browser to `localhost/service/...` therefore did not include the session cookie, and the API correctly returned 401.

### Solution

- **Dev proxy**: In `webpack.config.js`, set `cookieDomainRewrite: ""` on the `/service` proxy so that `Set-Cookie` headers in API responses have their domain stripped. The cookie then applies to the current host (`localhost`), and the browser sends it on subsequent requests to `localhost`, so authenticated mutations (e.g. `followById`) succeed.

### Tasks

- [x] 1. Add `cookieDomainRewrite: ""` to devServer proxy for `/service`
- [x] 2. Document in todo.md and lessons.md

### Note on curl — session cookie is required

The cookies in your curl (`anonymous_id`, `app_i18n_details`, `app_location_details`) are **not** the login session. The API expects a **session cookie** set when you log in (often HttpOnly, so "Copy as cURL" does not include it). Without it, the API correctly returns 401.

**To test followById with curl:**

1. In the browser: open http://localhost:5001, log in, then open DevTools → **Application** (or **Storage**) → **Cookies** → `http://localhost:5001`.
2. Find the cookie that looks like a session (e.g. `connect.sid`, `session`, `fynd_session`, or similar — name depends on the Fynd backend). Copy its **Name** and **Value**.
3. Add it to your curl:  
   `-b 'anonymous_id=...; app_i18n_details=...; app_location_details=...; SESSION_COOKIE_NAME=SESSION_VALUE'`  
   (replace `SESSION_COOKIE_NAME` and `SESSION_VALUE` with the actual name and value).
4. Restart dev server and log in again so the proxy can rewrite the cookie for localhost; then the session cookie will appear under localhost in Application → Cookies.

**Easier:** Test add-to-watchlist in the browser (click the heart/wishlist icon). The browser sends the session cookie automatically; no curl needed.

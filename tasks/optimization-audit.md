# Turbo Theme — Code Optimization Audit

Audit date: 2026-03-12. This document lists **files and code that are not optimized**, with specific issues and recommendations.

---

## 1. Hooks / Config — New object references every render

### `theme/helper/hooks/useThemeConfig.jsx`

- **Issue:** `globalConfig`, `palette`, `pageConfig`, and the returned object are recreated on every render. Any component that uses `useThemeConfig` (e.g. pages, Header, ThemeProvider, sections) re-renders whenever the hook runs, even when underlying store data is unchanged.
- **Lines:** 50–77 (object literals returned without memoization).
- **Recommendation:** Memoize derived values and the return object with `useMemo` keyed on `THEME`, `mode`, `page`, and `app_features?.common?.listing_price?.value` so reference equality is stable when inputs are unchanged.

---

## 2. SEO hook — Unmemoized value

### `theme/helper/hooks/useSeoMeta.jsx`

- **Issue:** `brandName` (lines 12–17) is computed on every render; it is not wrapped in `useMemo`. All consumers re-render when the parent re-renders even if CONFIGURATION/globalConfig did not change.
- **Recommendation:** Wrap `brandName` in `useMemo` with dependencies: `[CONFIGURATION?.application?.name, CONFIGURATION?.app?.name, CONFIGURATION?.application?.meta?.name, globalConfig?.brand_name, globalConfig?.site_name]`.

---

## 3. Sections — Heavy per-render work and list keys

### `theme/sections/hero-image.jsx`

- **Issues:**
  - **Lines 65–82 (`getImgSrcSet`):** Called during render and returns a new array every time. Not memoized.
  - **Lines 84–250 (`getOverlayPositionStyles`):** Large function called on every render, returns a new object. Depends on `props`, `windowWidth`, `fpi` (for `getLocaleDirection`). Not memoized.
  - **Lines 269–278 (`getHotspots`):** Calls `blocks?.filter` twice per render; returns new object reference every time. Not memoized.
  - **Lines 378–418:** List items use `key={index}`. If list order changes (e.g. reorder in CMS), React can reconcile incorrectly. Prefer a stable id (e.g. `block.id` or a composite key from block props).
  - **Lines 42–59 (`useEffect`): Effect depends on `tooltipHeight` and `tooltipWidth` and updates them; can cause extra layout/effect runs. Consider a single read in the effect and only setState when values actually change, or use a ref + requestAnimationFrame to avoid dependency loops.
- **Recommendation:** Memoize `getImgSrcSet`, `getOverlayPositionStyles`, and `getHotspots` with `useMemo` (deps: relevant props, `blocks`, `windowWidth`, `fpi`). Use stable keys for hotspot lists. Simplify tooltip effect to avoid unnecessary state updates.

### `theme/sections/featured-collection.jsx`

- **Issues:**
  - **Lines 523, 706:** List items use `key={index}`. Prefer stable ids for product/card lists.
  - Large component (1500+ lines) with many hooks and inline logic; consider splitting into smaller components or custom hooks to reduce re-render scope and improve readability.
- **Recommendation:** Use stable keys (e.g. product `item_id` or slug). Optionally split carousel rows and product cards into memoized subcomponents.

### `theme/sections/media-with-text.jsx` (lines 241, 247, 260, 266)

- **Issue:** `key={index}` for block/hotspot lists.
- **Recommendation:** Use block id or a stable composite key.

### `theme/sections/application-banner.jsx` (lines 174, 180, 207, 213)

- **Issue:** Same as above; `key={index}` for blocks.
- **Recommendation:** Stable keys from block identity.

### `theme/sections/image-slideshow.jsx` (lines 322, 336)

### `theme/sections/testimonials.jsx` (line 93)

### `theme/sections/feature-blog.jsx` (lines 112, 114)

- **Issue:** Carousel/list items keyed by index.
- **Recommendation:** Use item id or slug where available.

---

## 4. Layout / Data loading — Effect dependencies and object creation

### `theme/layouts/RootLayout.jsx`

- **Issues:**
  - **Lines 51–53:** `filterQuery` is built from `URLSearchParams` on every effect run; then a new object is passed to `pageDataResolver` (lines 55–64) including `router: { ...currentMatch, route: { handle: ... } }`. New object references every time can trigger unnecessary resolver work or downstream updates if compared by reference elsewhere.
  - **Lines 46–65:** `useEffect` depends on `[currentMatch, fpi, location.search, themeId]`. If `currentMatch` is a new object reference each time (e.g. from `useMatches()`), the effect may run more often than needed.
- **Recommendation:** Memoize `filterQuery` and the payload passed to `pageDataResolver` (e.g. with `useMemo`) so the effect only runs when route/page/query actually change. Consider normalizing `currentMatch` (e.g. by `pathname` + `handle`) if the router provides new references every render.

### `theme/pages/home.jsx`

- **Issue:** **Lines 21–31:** `useEffect` dependency array is `[fpi]`. If `fpi` is a new reference on each render (e.g. from context), this effect runs every time and may call `globalDataResolver` repeatedly.
- **Recommendation:** Run global data resolution once (e.g. in app bootstrap or with a ref guard). If it must stay in the page, depend on a stable identifier (e.g. `applicationID`/`applicationToken`) or use a ref to avoid duplicate calls.

---

## 5. Routes — Suspense and wrapper component

### `theme/routes.jsx`

- **Issues:**
  - **Line 94:** `Suspense fallback={null}` gives no loading feedback while lazy routes load; users may see a blank screen.
  - **Lines 86–89 (`RenderWithFPI`):** Wrapper calls `useFPI()` and passes `fpi` to `AuthCheck` and then to `Component`. Every route render creates this tree; lazy components are already code-split, so this is acceptable, but the wrapper is not memoized (low impact).
- **Recommendation:** Use a minimal fallback for `Suspense` (e.g. a small loader or skeleton) instead of `null`. Optionally memoize `RenderWithFPI` if profiling shows it as hot.

---

## 6. Auth guard — Stale closure risk

### `theme/components/AuthCheck.jsx`

- **Issue:** **Lines 15–52:** `useEffect` depends on `Component`, `fpi`, `loginPath`, `navigate`, `shouldRedirectToLogin`. If `Component` is an inline reference (e.g. from `page(Home)` where the route element is recreated), the effect can re-run more than needed. `loginPath` is correctly memoized from `location`.
- **Recommendation:** Ensure route elements/components are stable (they are, since `page(Home)` is called at module load). No change required unless route definitions are ever created inside a render path. If so, avoid passing inline component references.

---

## 7. Cart-landing section — Missing `fpi` prop

### `theme/pages/cart-landing.jsx`

- **Issue:** **Lines 69–73:** `<CartLanding ... />` receives `props`, `blocks`, `globalConfig` but not `fpi`. The section component may use `useFPI()` internally (as in `theme/sections/cart-landing.jsx`), which is fine, but the page does not pass `fpi` for consistency with other pages (e.g. home, blog-detail).
- **Recommendation:** Either pass `fpi={fpi}` for consistency and easier testing, or document that the section reads FPI from context only. Not a performance issue; consistency/maintainability only.

---

## 8. Global provider — Repeated computation

### `theme/providers/global-provider.jsx`

- **Issue:** **Lines 72–76:** `domainUrl` and `baseUrl` are derived inside render without `useMemo`. CONFIGURATION and `isRunningOnClient()` are used; if CONFIGURATION is stable, these can be memoized to avoid redundant work and to keep stable references for children that depend on them.
- **Recommendation:** Memoize `domainUrl` and `baseUrl` with `useMemo` keyed on `CONFIGURATION?.application?.domains` and environment.

---

## 9. Index / bootstrap — Minor

### `theme/index.jsx`

- **Issue:** **Lines 16–27:** `originDomain` and `window?.location?.origin` are checked twice (lines 16–17 and 26–27). Redundant only at init; negligible cost.
- **Recommendation:** Single assignment of `originDomain` and reuse when setting `client.domain`. Optional cleanup.

---

## 10. List keys across the theme

Using `key={index}` in dynamic lists can cause wrong reconciliation when items are reordered, added, or removed. Prefer stable IDs where available.

| File | Approx. line(s) | Suggestion |
|------|------------------|------------|
| `sections/hero-image.jsx` | 380, 386, 416, 422 | Use block id or composite key |
| `sections/featured-collection.jsx` | 523, 706 | Use product/item id or slug |
| `sections/media-with-text.jsx` | 241, 247, 260, 266 | Block id |
| `sections/application-banner.jsx` | 174, 180, 207, 213 | Block id |
| `sections/brand-listing.jsx` | 258, 261, 332, 345, 418 | Card/brand id |
| `sections/collections-listing.jsx` | 239 | Collection id/slug |
| `sections/categories-listing.jsx` | 227, 284 | Category id/slug |
| `sections/feature-blog.jsx` | 112, 114 | Blog/item id |
| `sections/image-gallery.jsx` | 193, 275, 283, 317 | Block/index or id |
| `sections/order-details.jsx` | 553, 742, 754, 813 | Order/shipment line id |
| `sections/order-status.jsx` | 104 | Stable id |
| `sections/profile-orders.jsx` | 549 | Order id |
| `page-layouts/pdp/*` (multiple) | Various | Product/variant/offer id where possible |
| `components/header/search.jsx` | 362, 395, 434 | Suggestion id or index only if list is stable |
| `components/footer/footer.jsx` | 226 | Link id or url |
| `components/carousel/carousel.jsx` | 288 | Index is acceptable for static carousel items |

Use `key={index}` only when the list is static and never reordered; otherwise use stable ids.

---

## Summary

| Priority | Category | Files | Main fix |
|----------|----------|--------|----------|
| High | Hook return refs | `useThemeConfig.jsx` | Memoize returned objects and derived config |
| High | Per-render work | `hero-image.jsx` | Memoize `getImgSrcSet`, `getOverlayPositionStyles`, `getHotspots`; fix tooltip effect |
| Medium | Unmemoized value | `useSeoMeta.jsx` | Memoize `brandName` |
| Medium | Effect deps / refs | `RootLayout.jsx`, `home.jsx` | Stable deps; avoid calling global resolver on every fpi ref change |
| Medium | List keys | Multiple sections | Prefer stable ids over `key={index}` |
| Low | UX | `routes.jsx` | Suspense fallback component instead of `null` |
| Low | Consistency | `global-provider.jsx`, `index.jsx`, `cart-landing.jsx` | Memoize domain/baseUrl; optional cleanup and prop consistency |

Implementing the high-priority items will reduce unnecessary re-renders and per-render work; medium items improve correctness and robustness of updates and list rendering.

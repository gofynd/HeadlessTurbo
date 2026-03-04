/**
 * Flag-based API endpoint configuration.
 * - USE_PROXY=true → API calls use same-origin (relative URLs), relying on server-side proxy.
 * - ON_LOCAL=true → API calls go to localhost (same-origin / dev proxy).
 * - IS_PRODUCTION=true → API calls go to api.fynd.com (or DOMAIN from env).
 * Priority: USE_PROXY > ON_LOCAL > IS_PRODUCTION > hostname fallback.
 * When neither is set, behavior falls back to hostname (localhost/127.0.0.1 → local).
 */

function toAbsoluteDomain(domain) {
  if (!domain || typeof domain !== "string") return "";
  const d = domain.trim();
  if (/^https?:\/\//i.test(d)) return d;
  return `https://${d}`;
}

/**
 * @returns {boolean} True when ON_LOCAL env is explicitly "true".
 */
export function isOnLocal() {
  return process.env.ON_LOCAL === "true";
}

/**
 * @returns {boolean} True when IS_PRODUCTION env is explicitly "true".
 */
export function isProduction() {
  return process.env.IS_PRODUCTION === "true";
}

/**
 * @returns {boolean} True when USE_PROXY env is explicitly "true".
 */
export function useProxy() {
  return process.env.USE_PROXY === "true";
}

/**
 * Whether API calls should target same-origin instead of api.fynd.com.
 * USE_PROXY > ON_LOCAL > IS_PRODUCTION > hostname fallback.
 * @returns {boolean}
 */
export function useLocalApi() {
  if (useProxy()) return true;
  if (isOnLocal()) return true;
  if (isProduction()) return false;
  if (typeof window !== "undefined") {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    );
  }
  return false;
}

/**
 * Domain string for FPI client: "" for local (relative URLs), or full https URL for production.
 * Used by app.jsx as domainForClient.
 * @returns {string}
 */
export function getApiDomainForClient() {
  if (useLocalApi()) return "";
  const domain = process.env.DOMAIN || "api.fynd.com";
  return toAbsoluteDomain(domain);
}

const GRAPHQL_PATH = "/service/application/graphql";

/**
 * Full GraphQL URL when targeting production API, or null to use same-origin (local).
 * Used by storefront-graphql so all API calls respect the same flag.
 * @returns {string|null} Full URL (e.g. https://api.fynd.com/service/application/graphql) or null for same-origin.
 */
export function getProductionGraphqlUrl() {
  if (useLocalApi()) return null;
  const domain = process.env.DOMAIN || "api.fynd.com";
  const base = toAbsoluteDomain(domain);
  return `${base.replace(/\/+$/, "")}${GRAPHQL_PATH}`;
}

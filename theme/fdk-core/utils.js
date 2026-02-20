import React, { createContext, useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useLocation as useRouterLocation,
  useNavigate as useRouterNavigate,
} from "react-router-dom";
import en from "../locales/en.json";

const FPIContext = createContext(null);

function getByPath(obj, path) {
  if (!obj || !path) {
    return undefined;
  }
  return path
    .split(".")
    .reduce(
      (acc, segment) =>
        acc && acc[segment] !== undefined ? acc[segment] : undefined,
      obj,
    );
}

export function FPIProvider({ value, children }) {
  return <FPIContext.Provider value={value}>{children}</FPIContext.Provider>;
}

export function useFPI() {
  return (
    useContext(FPIContext) ||
    (typeof window !== "undefined" ? window.fpi : null)
  );
}

export function useGlobalDispatch() {
  return useDispatch();
}

export function useGlobalStore(selector) {
  if (typeof selector !== "function") {
    return undefined;
  }
  return useSelector((state) => {
    try {
      return selector(state);
    } catch {
      return undefined;
    }
  });
}

export function useNavigate() {
  return useRouterNavigate();
}

export function useLocation() {
  return useRouterLocation();
}

export function useLocale() {
  const fpi = useFPI();
  const i18nDetails = useGlobalStore(fpi?.getters?.i18N_DETAILS) || {};
  const activeLocale =
    i18nDetails?.language?.locale ||
    i18nDetails?.locale ||
    i18nDetails?.language?.iso2 ||
    "en";

  const updateLocale = (nextLocale) => {
    if (!nextLocale) {
      return;
    }
    fpi?.custom?.setValue?.("activeLocale", nextLocale);
  };

  return { activeLocale, updateLocale };
}

function interpolate(str, vars) {
  if (!str || typeof str !== "string" || !vars || typeof vars !== "object") {
    return str;
  }
  return str.replace(/\{\{(\w+)\}\}/g, (_, name) =>
    vars[name] !== undefined && vars[name] !== null ? String(vars[name]) : `{{${name}}}`
  );
}

export function useGlobalTranslation() {
  const dictionary = en || {};

  return useMemo(
    () => ({
      t: (key, fallbackOrVars) => {
        const val = getByPath(dictionary, key);
        if (typeof val === "string") {
          if (
            fallbackOrVars &&
            typeof fallbackOrVars === "object" &&
            !Array.isArray(fallbackOrVars)
          ) {
            return interpolate(val, fallbackOrVars);
          }
          return val;
        }
        if (typeof fallbackOrVars === "string") {
          return fallbackOrVars;
        }
        return key;
      },
    }),
    [],
  );
}

// Reserved first path segments (must not be treated as product slug).
// Used by convertActionToUrl and by the /:slug route to show 404 for known paths.
export const RESERVED_PATH_SEGMENTS = new Set([
  "products",
  "product",
  "brands",
  "categories",
  "collections",
  "compare",
  "wishlist",
  "cart",
  "login",
  "register",
  "forgot-password",
  "set-password",
  "account-locked",
  "edit-profile",
  "profile",
  "blog",
  "contact-us",
  "about-us",
  "locate-us",
  "privacy-policy",
  "shipping-policy",
  "return-policy",
  "terms-and-conditions",
  "faq",
  "page",
  "sections",
  "form",
  "payment",
  "refund",
  "return",
  "reattempt",
  "order-tracking",
  "verify-email",
]);

export function convertActionToUrl(action) {
  if (!action || typeof action !== "object") {
    return "";
  }

  const page = action.page || {};
  const query = page.query || action.query || {};
  const params = page.params || action.params || {};
  const type = action.type || page.type;
  const slug = query.slug || params.slug || action.slug;

  const getUrlValue = (value) => {
    if (Array.isArray(value)) {
      return value[0] || "";
    }
    return value || "";
  };

  // Platform navigation payloads often send direct URL in page.query/url.
  const explicitUrl =
    getUrlValue(page.url) ||
    getUrlValue(query.url) ||
    action.url ||
    action.href ||
    "";

  const normalizeInternalUrl = (url) => {
    if (!url || typeof url !== "string") {
      return "";
    }
    const trimmed = url.trim();
    if (!trimmed) {
      return "";
    }
    // Keep anchors/protocol links untouched.
    if (
      trimmed.startsWith("#") ||
      /^(https?:)?\/\//i.test(trimmed) ||
      /^(mailto|tel):/i.test(trimmed)
    ) {
      return trimmed;
    }
    // Ensure in-app paths are absolute so client-side routing resolves correctly.
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  };

  // Product slugs from PLP/collection/brand often look like "name-12345" (ends with -digits).
  // Single-segment paths that look like this should resolve to PDP (/product/:slug).
  function isProductSlugSegment(segment) {
    if (!segment || typeof segment !== "string") return false;
    const s = segment.split("?")[0].trim();
    if (!s || RESERVED_PATH_SEGMENTS.has(s)) return false;
    return /^.+-[0-9]+$/.test(s);
  }

  const normalizedType = String(type || "").toLowerCase();

  if (normalizedType === "external") {
    return explicitUrl;
  }

  if (normalizedType === "page") {
    if (slug) {
      return isProductSlugSegment(slug) ? `/product/${slug}` : `/${slug}`;
    }
    const normalized = normalizeInternalUrl(explicitUrl);
    const segment = normalized.replace(/^\//, "").split("/")[0];
    if (segment && isProductSlugSegment(segment)) {
      return `/product/${segment}`;
    }
    return normalized;
  }
  if (normalizedType === "home") {
    return "/";
  }
  if (
    normalizedType === "products" ||
    normalizedType === "shop-all" ||
    normalizedType === "shop_all" ||
    normalizedType === "all-products" ||
    normalizedType === "all_products"
  ) {
    return "/products";
  }
  if (normalizedType === "collections") {
    return "/collections";
  }
  if (normalizedType === "categories") {
    return "/categories";
  }
  if (normalizedType === "brands") {
    return "/brands";
  }
  if (normalizedType === "product") {
    return slug ? `/product/${slug}` : "";
  }
  if (normalizedType === "collection") {
    return slug ? `/collection/${slug}` : "";
  }
  if (normalizedType === "category") {
    return slug ? `/category/${slug}` : "";
  }
  if (normalizedType === "brand") {
    return slug ? `/brand/${slug}` : "";
  }
  if (normalizedType === "link") {
    const normalized = normalizeInternalUrl(explicitUrl);
    const segment = normalized.replace(/^\//, "").split("/")[0]?.split("?")[0];
    if (segment && isProductSlugSegment(segment)) {
      return `/product/${segment}`;
    }
    return normalized;
  }

  const fallback = normalizeInternalUrl(explicitUrl);
  const segment = fallback.replace(/^\//, "").split("/")[0]?.split("?")[0];
  if (segment && isProductSlugSegment(segment)) {
    return `/product/${segment}`;
  }
  return fallback;
}

export function getPageSlug(router) {
  const pageType = router?.route?.handle?.pageType || router?.handle?.pageType;
  const params = router?.params || router?.route?.params || {};
  const customPageRoute = params["*"];
  const slug = params.slug;

  if (pageType === "custom-template" && customPageRoute) {
    const sanitized = customPageRoute.endsWith("/")
      ? customPageRoute.slice(0, -1)
      : customPageRoute;
    return `custom-template${sanitized.replace(/\//g, ":::")}`;
  }

  if (pageType === "section-page") {
    return slug;
  }

  return pageType || null;
}

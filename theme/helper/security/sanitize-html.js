// Single source of truth for HTML/Markdown/URL sanitization on the storefront.
// Security report FND-02, FND-05, FND-06, FND-10, FND-11, FND-16, FND-31.
//
// Do NOT introduce parallel helpers (regex stripScripts, sanitizeHTMLTag, etc.).
// Add coverage here instead. The unsafe helpers being removed only created a
// false sense of security.

import DOMPurify from "dompurify";
import { marked } from "marked";

const TRUSTED_IFRAME_HOST_RE =
  /^(https?:)?\/\/(www\.)?(youtube(-nocookie)?\.com|youtu\.be|vimeo\.com|player\.vimeo\.com)\//i;

const SAFE_URI_RE = /^(?:(?:https?|mailto|tel|ftp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i;

// Strict scheme allowlist for href/src style values.
const DEFAULT_ALLOWED_SCHEMES = ["http:", "https:", "mailto:", "tel:"];

function getWindow() {
  return typeof window === "undefined" ? null : window;
}

// Produces sanitized HTML safe to feed into dangerouslySetInnerHTML or
// html-react-parser. Pass `allowIframes: true` only when the surrounding
// component is supposed to embed third-party media (e.g. YouTube via
// useRichText). Even then, only whitelisted hosts are permitted.
export function sanitizeHtml(dirty, options = {}) {
  if (dirty == null) return "";
  if (typeof dirty !== "string") {
    try {
      dirty = String(dirty);
    } catch {
      return "";
    }
  }

  const { allowIframes = false } = options;

  const forbidTags = ["script", "object", "embed", "form", "style", "meta", "base"];
  if (!allowIframes) forbidTags.push("iframe");

  const config = {
    FORBID_TAGS: forbidTags,
    FORBID_ATTR: [
      "onerror",
      "onload",
      "onclick",
      "onmouseover",
      "onfocus",
      "onblur",
      "onchange",
      "onsubmit",
      "onkeydown",
      "onkeyup",
      "onkeypress",
      "onmouseenter",
      "onmouseleave",
      "onmousedown",
      "onmouseup",
      "onmousemove",
      "ondblclick",
      "onwheel",
      "ontoggle",
      "onanimationstart",
      "onanimationend",
      "ontransitionend",
      "formaction",
      "srcdoc",
    ],
    ALLOWED_URI_REGEXP: SAFE_URI_RE,
    ADD_ATTR: allowIframes
      ? ["allow", "allowfullscreen", "frameborder", "sandbox", "loading", "referrerpolicy"]
      : [],
  };

  let result = DOMPurify.sanitize(dirty, config);

  // Second-pass guard: when iframes are allowed, ensure src/href values resolve
  // to one of the trusted media hosts. DOMPurify by itself only enforces the
  // URI scheme; it does not gate by hostname.
  if (allowIframes && typeof result === "string" && result.includes("<iframe")) {
    result = result.replace(
      /<iframe\b[^>]*?\bsrc\s*=\s*"([^"]*)"[^>]*>/gi,
      (match, src) => (TRUSTED_IFRAME_HOST_RE.test(src) ? match : ""),
    );
  }

  return result;
}

// Sanitized Markdown -> HTML pipeline. Use this in place of marked() directly
// for any content that could come from a CMS author or untrusted source.
export function sanitizeMarkdown(md, options = {}) {
  if (md == null) return "";
  let html;
  try {
    html = marked(typeof md === "string" ? md : String(md));
  } catch {
    return "";
  }
  return sanitizeHtml(html, options);
}

// safeUrl validates a URL string against an allowlist of schemes and returns
// a sanitized version. Use for href/src/redirect handling. Rejects:
//   - javascript:, data:, vbscript: schemes
//   - protocol-relative `//host` and Windows-style `\\host` redirects
//   - values containing backslashes (browsers normalize \ to /, causing
//     double-slash bypasses on `/\evil.com`)
// Returns `fallback` (default '#') for anything that fails validation so
// React still renders a syntactically valid attribute.
export function safeUrl(value, options = {}) {
  const {
    allowedSchemes = DEFAULT_ALLOWED_SCHEMES,
    allowRelative = true,
    fallback = "#",
  } = options;

  if (value == null) return fallback;
  const str = String(value).trim();
  if (!str) return fallback;

  // Reject backslashes outright — browsers normalize `\` to `/` and the
  // resulting `//host` becomes an off-origin redirect.
  if (str.includes("\\")) return fallback;
  // Reject protocol-relative URLs unless an absolute URL with allowed scheme
  // is explicitly accepted later.
  if (/^\/\//.test(str)) return fallback;

  // Relative path: must start with `/` and not be `//` (handled above).
  if (allowRelative && str.startsWith("/")) return str;
  // Fragment-only / query-only references are safe.
  if (str.startsWith("#") || str.startsWith("?")) return str;

  const win = getWindow();
  const base = win ? win.location.origin : "https://localhost";
  let parsed;
  try {
    parsed = new URL(str, base);
  } catch {
    return fallback;
  }

  if (!allowedSchemes.includes(parsed.protocol)) return fallback;

  return parsed.toString();
}

// Strict same-origin redirect resolver used by the login flow (security report
// FND-11). Accepts only same-origin paths; returns the fallback otherwise.
// Caller is expected to pass the raw redirect query param exactly once
// (we do NOT double-decode).
export function safeInternalRedirect(value, fallback = "/") {
  if (value == null) return fallback;
  const str = String(value);
  if (!str) return fallback;
  if (str.includes("\\")) return fallback;
  if (!str.startsWith("/")) return fallback;
  if (str.startsWith("//")) return fallback;

  const win = getWindow();
  if (!win) return str; // SSR: trust the validated relative path

  let parsed;
  try {
    parsed = new URL(str, win.location.origin);
  } catch {
    return fallback;
  }
  if (parsed.origin !== win.location.origin) return fallback;
  return parsed.pathname + parsed.search + parsed.hash;
}

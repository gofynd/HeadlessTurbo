import React, { Component } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import { FPIProvider } from "fdk-core/utils";
import "./styles/base.global.less";
import initializeTheme from "./index";
import { routes } from "./routes";
import { getPersistedAuth } from "./helper/auth-persistence";
import { getAppCredentials } from "./helper/getAppCredentials";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const isBrowser = typeof window !== "undefined";

// SECURITY (report FND-15): wrap window.fetch once on bootstrap so every
// same-origin call to /service /ext /graphql carries the CSRF token. The
// Fynd FPI SDK and any custom code that uses fetch go through this shim,
// keeping the double-submit contract intact regardless of caller.
function installCsrfFetchInterceptor() {
  if (!isBrowser || typeof window.fetch !== "function") return;
  if (window.__csrfFetchPatched) return;

  const originalFetch = window.fetch.bind(window);

  const isProxiedPath = (urlStr) => {
    if (typeof urlStr !== "string") return false;
    return (
      urlStr.startsWith("/service") ||
      urlStr.startsWith("/ext") ||
      urlStr.startsWith("/graphql")
    );
  };

  window.fetch = function csrfFetch(input, init) {
    try {
      const url =
        typeof input === "string"
          ? input
          : input && typeof input.url === "string"
            ? input.url
            : "";
      const method =
        (init && init.method) ||
        (input && input.method) ||
        "GET";
      const upper = String(method).toUpperCase();
      const needsCsrf =
        isProxiedPath(url) &&
        upper !== "GET" &&
        upper !== "HEAD" &&
        upper !== "OPTIONS";
      if (needsCsrf && window.__CSRF_TOKEN__) {
        const headers = new Headers(
          (init && init.headers) || (input && input.headers) || {},
        );
        if (!headers.has("X-CSRF-Token")) {
          headers.set("X-CSRF-Token", window.__CSRF_TOKEN__);
        }
        const nextInit = { ...(init || {}), headers };
        return originalFetch(input, nextInit);
      }
    } catch {
      // fall through to unmodified fetch
    }
    return originalFetch(input, init);
  };
  window.__csrfFetchPatched = true;
}

function assertEnvVars() {
  // Credentials flow ONLY through window.__APP_CREDENTIALS__ injected by server.js
  // at request time. No process.env fallback — that path lets Webpack inline the
  // token into the public bundle (see security report FND-01 / FND-08).
  const { applicationID, applicationToken } = getAppCredentials();

  if (!applicationID || !applicationToken) {
    throw new Error(
      "Missing app credentials. window.__APP_CREDENTIALS__ was not injected by the server.",
    );
  }

  return { applicationID, applicationToken };
}

function getStoreInitialData() {
  if (!isBrowser) return {};

  // SECURITY (report FND-03): we only bootstrap the non-sensitive logged_in
  // hint here so the UI can render the right shell on first paint. User
  // profile data (name, DOB, email, phone, etc.) is fetched from the server
  // via USER_DATA_QUERY against the session cookie. The persisted hint is
  // NEVER used as an authorization signal — see auth-guard.js.
  const persistedAuth = getPersistedAuth();
  if (!persistedAuth?.logged_in) return {};

  return { auth: { logged_in: true } };
}

function assertInitializeThemeFn(fn) {
  if (typeof fn === "function") return fn;

  const got = fn === undefined ? "undefined" : typeof fn;
  throw new Error(
    `Theme Error: initializeTheme is not a function. Got type: ${got}. ` +
      "Ensure theme/index.jsx default export is bundled correctly (standalone: use npm run dev; no themeBundle entry in local).",
  );
}

function attachGlobals({ fpi }) {
  if (!isBrowser) return;

  // Do NOT write back to window.__APP_CREDENTIALS__ — it's a server-injected,
  // read-only value (see security report FND-09). Re-assigning here would let
  // any earlier script on the page tamper with credential state.
  window.fpi = fpi;

  if (typeof window.FPI === "undefined") window.FPI = {};
  if (typeof window.FPI.event === "undefined") window.FPI.event = {};
  if (typeof window.FPI.event.emit !== "function") {
    window.FPI.event.emit = function () {};
  }
}

async function bootstrap() {
  installCsrfFetchInterceptor();
  const { applicationID, applicationToken } = assertEnvVars();
  const storeInitialData = getStoreInitialData();
  const safeInitializeTheme = assertInitializeThemeFn(initializeTheme);

  const parsedTheme = await safeInitializeTheme({
    applicationID,
    applicationToken,
    // Domain is derived and enforced inside theme/index.jsx for same-origin usage.
    domain: undefined,
    storeInitialData,
  });

  if (!parsedTheme?.fpi) {
    throw new Error(
      "Theme Error: initializeTheme() did not return { fpi }. Got: " +
        (parsedTheme === undefined ? "undefined" : typeof parsedTheme),
    );
  }

  const { fpi, globalDataResolver } = parsedTheme;

  attachGlobals({ fpi });
  await globalDataResolver?.({ fpi, applicationID });

  const app = document.getElementById("app");
  if (!app) {
    throw new Error('Theme Error: Root element with id "app" not found.');
  }

  const root = ReactDOM.createRoot(app);

  root.render(
    <ErrorBoundary>
      <HelmetProvider>
        <ReduxProvider store={fpi.store}>
          <FPIProvider value={fpi}>
            <RouterProvider router={routes} />
          </FPIProvider>
        </ReduxProvider>
      </HelmetProvider>
    </ErrorBoundary>,
  );
}

bootstrap();

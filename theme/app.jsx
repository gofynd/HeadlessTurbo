import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import { FPIProvider } from "fdk-core/utils";
import "./styles/base.global.less";
import initializeTheme from "./index";
import { routes } from "./routes";
import { getPersistedAuth } from "./helper/auth-persistence";

async function main() {
  const applicationID = process.env.APPLICATION_ID;
  const applicationToken = process.env.APPLICATION_TOKEN;
  const domain = process.env.DOMAIN;

  if (!applicationID || !applicationToken || !domain) {
    // Keeps local setup failures explicit before rendering.
    throw new Error(
      "Missing env vars. Expected APPLICATION_ID, APPLICATION_TOKEN, DOMAIN.",
    );
  }

  // Always use same-origin for FPI calls so server-side proxy handles Storefront API.
  // This avoids CORS failures in serverless deployments where build-time envs differ.
  const domainForClient = "";

  if (typeof initializeTheme !== "function") {
    const got =
      initializeTheme === undefined ? "undefined" : typeof initializeTheme;
    throw new Error(
      `Theme Error: initializeTheme is not a function. Got type: ${got}. ` +
        "Ensure theme/index.jsx default export is bundled correctly (standalone: use npm run dev; no themeBundle entry in local).",
    );
  }

  const persistedAuth =
    typeof window !== "undefined" ? getPersistedAuth() : null;
  const storeInitialData =
    persistedAuth && Object.keys(persistedAuth).length
      ? { auth: { ...persistedAuth } }
      : {};

  const parsedTheme = await initializeTheme({
    applicationID,
    applicationToken,
    domain: domainForClient,
    storeInitialData,
  });

  if (!parsedTheme?.fpi) {
    throw new Error(
      "Theme Error: initializeTheme() did not return { fpi }. Got: " +
        (parsedTheme === undefined ? "undefined" : typeof parsedTheme),
    );
  }

  const { fpi, globalDataResolver } = parsedTheme;

  if (typeof window !== "undefined") {
    window.__APP_CREDENTIALS__ = { applicationID, applicationToken };
    // Set window.fpi for global access (used by copilot utils and actions)
    window.fpi = fpi;
    // Fallback: theme/index.jsx sets window.FPI.event earlier (right after FPIClient creation).
    // Here we ensure it exists so host can attach later or we no-op; avoids "Cannot read
    // properties of undefined (reading 'event')" in defaultFPIEmit when cart/checkout GQL runs.
    if (typeof window.FPI === "undefined") window.FPI = {};
    if (typeof window.FPI.event === "undefined") window.FPI.event = {};
    if (typeof window.FPI.event.emit !== "function") {
      window.FPI.event.emit = function () {};
    }
  }
  await globalDataResolver?.({ fpi, applicationID });

  const app = document.getElementById("app");
  const root = ReactDOM.createRoot(app);

  root.render(
    <HelmetProvider>
      <ReduxProvider store={fpi.store}>
        <FPIProvider value={fpi}>
          <RouterProvider router={routes} />
        </FPIProvider>
      </ReduxProvider>
    </HelmetProvider>,
  );
}

main();

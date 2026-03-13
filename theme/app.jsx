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
import { getAppCredentials } from "./helper/getAppCredentials";

const isBrowser = typeof window !== "undefined";

function assertEnvVars() {
  const runtimeCredentials = getAppCredentials();
  const applicationID =
    runtimeCredentials.applicationID || process.env.APPLICATION_ID;
  const applicationToken =
    runtimeCredentials.applicationToken || process.env.APPLICATION_TOKEN;

  if (!applicationID || !applicationToken) {
    throw new Error(
      "Missing env vars. Expected APPLICATION_ID, APPLICATION_TOKEN.",
    );
  }

  return { applicationID, applicationToken };
}

function getStoreInitialData() {
  if (!isBrowser) return {};

  const persistedAuth = getPersistedAuth();
  if (!persistedAuth || !Object.keys(persistedAuth).length) return {};

  return { auth: { ...persistedAuth } };
}

function assertInitializeThemeFn(fn) {
  if (typeof fn === "function") return fn;

  const got = fn === undefined ? "undefined" : typeof fn;
  throw new Error(
    `Theme Error: initializeTheme is not a function. Got type: ${got}. ` +
      "Ensure theme/index.jsx default export is bundled correctly (standalone: use npm run dev; no themeBundle entry in local).",
  );
}

function attachGlobals({ fpi, applicationID, applicationToken }) {
  if (!isBrowser) return;

  window.__APP_CREDENTIALS__ = { applicationID, applicationToken };
  window.fpi = fpi;

  if (typeof window.FPI === "undefined") window.FPI = {};
  if (typeof window.FPI.event === "undefined") window.FPI.event = {};
  if (typeof window.FPI.event.emit !== "function") {
    window.FPI.event.emit = function () {};
  }
}

async function bootstrap() {
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

  attachGlobals({ fpi, applicationID, applicationToken });
  await globalDataResolver?.({ fpi, applicationID });

  const app = document.getElementById("app");
  if (!app) {
    throw new Error('Theme Error: Root element with id "app" not found.');
  }

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

bootstrap();

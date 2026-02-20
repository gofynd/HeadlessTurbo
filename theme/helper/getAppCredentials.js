/**
 * Application credentials for standalone Turbo (or when running inside Skyfire).
 * Standalone app.jsx sets window.__APP_CREDENTIALS__; Skyfire sets window.APP_DATA.
 */
export function getApplicationID() {
  if (typeof window === "undefined") return "";
  const creds = window.APP_DATA || window.__APP_CREDENTIALS__;
  return creds?.applicationID ?? "";
}

export function getApplicationToken() {
  if (typeof window === "undefined") return "";
  const creds = window.APP_DATA || window.__APP_CREDENTIALS__;
  return creds?.applicationToken ?? "";
}

export function getAppCredentials() {
  if (typeof window === "undefined") return {};
  const creds = window.APP_DATA || window.__APP_CREDENTIALS__;
  return {
    applicationID: creds?.applicationID ?? "",
    applicationToken: creds?.applicationToken ?? "",
  };
}

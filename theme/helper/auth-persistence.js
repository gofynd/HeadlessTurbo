/**
 * Persist auth state to localStorage so it survives page refresh.
 * Used to rehydrate the store on load so protected routes don't redirect to login.
 */

const STORAGE_KEY = "turbo_fp_auth";

function safeStorage() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * @returns {{ logged_in: boolean, user_data?: object } | null} Persisted auth slice for store rehydration, or null.
 */
export function getPersistedAuth() {
  const storage = safeStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.logged_in === true) {
      const result = { logged_in: true };
      if (parsed.user_data && typeof parsed.user_data === "object") {
        result.user_data = parsed.user_data;
      }
      return result;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Call when user is logged in (guard allowed, or login success).
 * @param {boolean} loggedIn
 * @param {object} [userData] - Optional user payload (e.g. from login mutation or user query) to persist so profile shows data after redirect.
 */
export function setPersistedAuth(loggedIn, userData) {
  const storage = safeStorage();
  if (!storage) return;
  try {
    if (loggedIn) {
      const payload = { logged_in: true };
      if (userData && typeof userData === "object") {
        payload.user_data = userData;
      }
      storage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } else {
      storage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

/**
 * Call on logout so next load doesn't rehydrate as logged in.
 */
export function clearPersistedAuth() {
  setPersistedAuth(false);
}

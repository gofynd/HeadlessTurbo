/**
 * SECURITY (report FND-03): the previous version persisted the full user
 * profile object (user_id, name, gender, DOB, emails, phone numbers, profile
 * picture URL) to localStorage so the auth guard could short-circuit on
 * refresh. Two problems with that:
 *
 *   1. Any successful XSS reads the full PII blob — every report finding in
 *      the FND-02 / FND-05 / FND-07 family materially amplifies into a
 *      privacy breach.
 *   2. A malicious script can write `{ logged_in: true, user_data: {...} }`
 *      to localStorage and the auth guard renders authenticated UI before the
 *      server cookie is ever consulted.
 *
 * The fix: persist ONLY a non-sensitive `logged_in` boolean in sessionStorage
 * (cleared on tab close). Profile data is re-fetched via the existing
 * USER_DATA_QUERY against the server session cookie on every page load.
 */

const STORAGE_KEY = "turbo_fp_auth";

function safeStorage() {
  if (typeof window === "undefined" || !window.sessionStorage) return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * @returns {{ logged_in: boolean } | null} Non-sensitive auth hint for store
 *   bootstrap. Callers MUST NOT trust this as proof of authentication — the
 *   server session cookie is the only authoritative source.
 */
export function getPersistedAuth() {
  const storage = safeStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.logged_in === true) {
      return { logged_in: true };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * @param {boolean} loggedIn
 */
export function setPersistedAuth(loggedIn /* , userData (deprecated, ignored) */) {
  const storage = safeStorage();
  if (!storage) return;
  try {
    if (loggedIn) {
      storage.setItem(STORAGE_KEY, JSON.stringify({ logged_in: true }));
    } else {
      storage.removeItem(STORAGE_KEY);
    }
    // Best-effort cleanup of any stale PII blob written by previous versions.
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
}

export function clearPersistedAuth() {
  setPersistedAuth(false);
}

import { isRunningOnClient } from "./utils";
import { USER_DATA_QUERY } from "../queries/libQuery";
import { setPersistedAuth } from "./auth-persistence";

// SECURITY (report FND-03 / FND-28): the previous implementation trusted the
// client-side `logged_in === true && user_data.user_id` short-circuit. That
// path was forgeable — a malicious script could set the localStorage flag and
// the guard would render authenticated UI before the server cookie was
// validated. We now always round-trip USER_DATA_QUERY (which carries the
// session cookie) before granting access. The persisted flag is a UX hint
// only, never an authorization signal. PII is no longer logged in dev either
// (report FND-28).
export async function isLoggedIn({ fpi, store }) {
  try {
    const userData = await fpi.executeGQL(USER_DATA_QUERY);
    const loggedInUser = userData?.data?.user?.logged_in_user;
    const loggedIn = !!loggedInUser;

    if (loggedInUser) {
      fpi.custom.setValue("user_Data", { logged_in_user: loggedInUser });
    }

    setPersistedAuth(loggedIn);
    return loggedIn;
  } catch (error) {
    return false;
  }
}

export async function loginGuard({ fpi, store }) {
  try {
    const loggedIn = await isLoggedIn({ fpi, store });
    const locale =
      fpi?.store?.getState?.()?.custom?.i18nDetailsKey?.language?.locale;
    if (loggedIn && isRunningOnClient()) {
      const path = locale && locale !== "en" ? `/${locale}` : "/";
      window.location.href = path;
      return false;
    }
    return true;
  } catch (error) {
    return true;
  }
}

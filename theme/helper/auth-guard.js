import { isRunningOnClient } from "./utils";
import { USER_DATA_QUERY } from "../queries/libQuery";
import { setPersistedAuth } from "./auth-persistence";

export async function isLoggedIn({ fpi, store }) {
  try {
    const storedLoggedIn = store?.auth?.logged_in;

    if (storedLoggedIn === true && store?.auth?.user_data?.user_id) {
      return true;
    }

    if (storedLoggedIn === false) {
      return false;
    }

    // Either logged_in was rehydrated from localStorage without user data,
    // or it was never set. Validate the session and populate user data.
    const userData = await fpi.executeGQL(USER_DATA_QUERY);
    const loggedInUser = userData?.data?.user?.logged_in_user;
    const loggedIn = !!loggedInUser;

    if (loggedInUser) {
      fpi.custom.setValue("user_Data", { logged_in_user: loggedInUser });
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[auth-guard] USER_DATA_QUERY result:", {
        loggedIn,
        user_id: loggedInUser?.user_id,
        first_name: loggedInUser?.first_name,
        storeAfter: fpi.store?.getState?.()?.auth?.user_data,
      });
    }

    setPersistedAuth(loggedIn, loggedIn ? loggedInUser : null);
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

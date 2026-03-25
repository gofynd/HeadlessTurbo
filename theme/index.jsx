import FPIClient from "@gofynd/fdk-store-gql";
import { globalDataResolver, pageDataResolver } from "./helper/lib";
import { setupAutoRevalidation } from "./helper/fpi-swr-wrapper";

/**
 * Initialize theme for standalone Turbo: create FPIClient and return resolvers.
 * Consumed by theme/app.jsx only.
 */
export default async ({
  applicationID,
  applicationToken,
  domain,
  storeInitialData,
}) => {
  // Setup fetch interceptor to add Priority header

  // Use __API_ORIGIN__ when set (dev: proxy on 5001) so all APIs, including orders, go through proxy and avoid 403.
  // When HTML is from WDS (port 5002), server never injects __API_ORIGIN__; fallback: send API to proxy port 5001.
  const isWdsOrigin =
    typeof window !== "undefined" &&
    window.location?.hostname === "localhost" &&
    window.location?.port === "5002";
  const originDomain =
    typeof window !== "undefined" &&
    (window.__API_ORIGIN__ ||
      (isWdsOrigin ? "http://localhost:5001" : null) ||
      window?.location?.origin);
  const fpiOptions = {
    applicationID,
    applicationToken,
    domain: originDomain,
    storeInitialData,
  };
  const { client } = new FPIClient(fpiOptions);
  // Force absolute same-origin base URL. Some SDK codepaths treat "" as "use default api.fynd.com".
  if (typeof window !== "undefined" && originDomain) {
    client.domain = originDomain;
  }

  setupAutoRevalidation(client);

  return {
    fpi: client,
    globalDataResolver,
    pageDataResolver,
  };
};

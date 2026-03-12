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

  const originDomain =
    typeof window !== "undefined" && window?.location?.origin;
  const fpiOptions = {
    applicationID,
    applicationToken,
    domain: originDomain,
    storeInitialData,
  };
  const { client } = new FPIClient(fpiOptions);
  // Force absolute same-origin base URL. Some SDK codepaths treat "" as "use default api.fynd.com".
  if (typeof window !== "undefined" && window?.location?.origin) {
    client.domain = originDomain;
  }

  setupAutoRevalidation(client);

  return {
    fpi: client,
    globalDataResolver,
    pageDataResolver,
  };
};

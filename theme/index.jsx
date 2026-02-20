import FPIClient from "fdk-store";
import { globalDataResolver, pageDataResolver } from "./helper/lib";
import {
  wrapFpiWithSWR,
  setupAutoRevalidation,
} from "./helper/fpi-swr-wrapper";

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

  const proxyDomain = domain;
  const fpiOptions = {
    applicationID,
    applicationToken,
    domain: proxyDomain,
    storeInitialData,
  };
  const { client } = new FPIClient(fpiOptions);

  // FDK store cartHandler -> emitFPIEvent -> defaultFPIEmit reads window.FPI.event.emit.
  // Set it as soon as the client exists so any GQL response handler (e.g. after CHECKOUT_LANDING
  // or cart fetch) does not throw "Cannot read properties of undefined (reading 'event')".
  if (typeof window !== "undefined") {
    if (typeof window.FPI === "undefined") window.FPI = {};
    if (typeof window.FPI.event === "undefined") window.FPI.event = {};
    if (typeof window.FPI.event.emit !== "function") {
      window.FPI.event.emit = function () {};
    }
  }

  const state = client.store.getState();
  const THEME = client.getters?.THEME(state);
  const mode = THEME?.config?.list?.find(
    (f) => f.name === THEME?.config?.current,
  );
  const ENABLE_SWR_CACHE =
    mode?.global_config?.custom?.props?.enable_swr_caching ?? false;

  if (ENABLE_SWR_CACHE) {
    wrapFpiWithSWR(client, {
      staleTime: 0,
      cacheTime: 5 * 60 * 1000,
      dedupingInterval: 2000,
      maxCacheSize: 100,
      maxCacheMemoryMB: 5,
    });
    setupAutoRevalidation(client);
  }

  return {
    fpi: client,
    globalDataResolver,
    pageDataResolver,
  };
};

/**
 * Storefront GraphQL client using Apollo Client (no fpi.executeGQL).
 * Follows Fynd Storefront API: https://docs.fynd.com/partners/commerce/sdk/latest/graphql/application/client-libraries
 *
 * - POST to /service/application/graphql (same-origin; use app proxy or Skyfire to avoid CORS)
 * - Authorization: Bearer base64(applicationId:applicationToken)
 * - Body: { query, variables }
 */
import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";

/**
 * Build Base64-encoded Bearer token from application credentials.
 * @param {string} applicationId
 * @param {string} applicationToken
 * @returns {string} base64(applicationId:applicationToken)
 */
export function getStorefrontAuthToken(applicationId, applicationToken) {
  if (!applicationId || !applicationToken) {
    throw new Error(
      "storefrontGraphql: applicationId and applicationToken are required",
    );
  }
  const raw = `${applicationId}:${applicationToken}`;
  if (typeof btoa !== "undefined") {
    return btoa(raw);
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(raw, "utf8").toString("base64");
  }
  throw new Error("storefrontGraphql: no btoa or Buffer available");
}

/**
 * Resolve GraphQL endpoint URL (same-origin so dev/host proxy handles it; avoids CORS).
 * Per Fynd docs: use same endpoint as your app so the server can proxy to Storefront API.
 * @param {string} [domain] - Optional path prefix (e.g. "" for /service/application/graphql)
 * @returns {string}
 */
export function getStorefrontGraphqlUrl(domain = "") {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    const path = domain
      ? `/${String(domain).replace(/^\/+|\/+$/g, "")}/service/application/graphql`
      : "/service/application/graphql";
    return `${origin}${path}`;
  }
  throw new Error(
    "storefrontGraphql: getStorefrontGraphqlUrl is only for browser (same-origin)",
  );
}

const apolloClientCache = new Map();

function getApolloClient({
  applicationId,
  applicationToken,
  domain = "",
  graphqlUrl,
  headers: extraHeaders = {},
}) {
  const url = graphqlUrl || getStorefrontGraphqlUrl(domain);
  const cacheKey = JSON.stringify({
    url,
    applicationId,
    applicationToken,
    headers: extraHeaders,
  });

  if (apolloClientCache.has(cacheKey)) {
    return apolloClientCache.get(cacheKey);
  }

  const token = getStorefrontAuthToken(applicationId, applicationToken);
  const client = new ApolloClient({
    link: new HttpLink({
      uri: url,
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-ordering-source": "storefront",
        ...extraHeaders,
      },
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: "no-cache",
        errorPolicy: "all",
      },
      mutate: {
        errorPolicy: "all",
      },
    },
  });

  apolloClientCache.set(cacheKey, client);
  return client;
}

/**
 * Execute a GraphQL request via Storefront API (no FPI).
 *
 * @param {Object} options
 * @param {string} options.query - GraphQL query or mutation string
 * @param {Object} [options.variables] - Variables (default {})
 * @param {string} options.applicationId - Application ID
 * @param {string} options.applicationToken - Application token
 * @param {string} [options.domain] - Optional domain for URL (default "" for same-origin /service/application/graphql)
 * @param {string} [options.graphqlUrl] - Override full GraphQL URL (if set, domain is ignored)
 * @param {Object} [options.headers] - Extra headers
 * @returns {Promise<{ data?: any, errors?: Array<{ message: string }> }>}
 */
export async function storefrontGraphql({
  query,
  variables = {},
  applicationId,
  applicationToken,
  domain = "",
  graphqlUrl,
  headers: extraHeaders = {},
}) {
  const client = getApolloClient({
    applicationId,
    applicationToken,
    domain,
    graphqlUrl,
    headers: extraHeaders,
  });
  const parsedQuery = gql`
    ${query}
  `;
  const trimmedQuery = query.trim().toLowerCase();
  const isMutation = trimmedQuery.startsWith("mutation");

  try {
    const response = isMutation
      ? await client.mutate({
          mutation: parsedQuery,
          variables,
        })
      : await client.query({
          query: parsedQuery,
          variables,
        });

    const graphQLErrors =
      response?.errors ||
      response?.error?.graphQLErrors ||
      (response?.error ? [{ message: response.error.message }] : []);

    if (graphQLErrors?.length) {
      return { data: response?.data, errors: graphQLErrors };
    }
    return { data: response?.data };
  } catch (error) {
    const networkStatus =
      error?.networkError?.statusCode ||
      error?.networkError?.status ||
      error?.status;
    const hint =
      Number(networkStatus) === 500
        ? " (Server error: check APPLICATION_ID/APPLICATION_TOKEN, DOMAIN, and backend logs at proxy target)"
        : "";
    const err = new Error(
      `storefrontGraphql: Apollo request failed${hint} - ${error?.message || "Unknown error"}`,
    );
    err.status = networkStatus;
    err.originalError = error;
    if (typeof console !== "undefined" && console.error) {
      console.error("[storefrontGraphql] Apollo request failed:", error);
    }
    throw err;
  }
}

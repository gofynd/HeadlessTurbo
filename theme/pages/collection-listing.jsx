import React, { useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import Loader from "../components/loader/loader";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import CollectionListingSection from "../sections/collection-listing";
import { COLLECTION_PAGE_SECTIONS } from "../props/collection-listing";

function CollectionListing({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const customValues = useGlobalStore(fpi.getters.CUSTOM_VALUE) || {};
  const { globalConfig } = useThemeConfig({ fpi, page: "collection-listing" });
  const seoData = customValues?.customCollection?.seo || page?.seo || {};
  const { error, isLoading } = page || {};
  const fallbackImage = useMemo(() => {
    const props = COLLECTION_PAGE_SECTIONS.collectionListing.props;
    return props?.desktop_banner?.value || props?.mobile_banner?.value || "";
  }, []);

  const {
    brandName,
    canonicalUrl,
    pageUrl,
    description: seoDescription,
    socialImage,
  } = useSeoMeta({
    fpi,
    seo: seoData,
    fallbackImage,
  });

  const title = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.title || customValues?.customCollection?.name || "Collection",
    );
    if (raw && brandName) return `${raw} | ${brandName}`;
    return raw || brandName || "";
  }, [seoData?.title, brandName, customValues?.customCollection?.name]);

  const description = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.description ||
        customValues?.customCollection?.description ||
        t("resource.categories.collection_listing_description") ||
        "",
    );
    const normalized = raw.replace(/\s+/g, " ").trim();
    return normalized || seoDescription;
  }, [
    seoData?.description,
    customValues?.customCollection?.description,
    t,
    seoDescription,
  ]);

  if (error) {
    return (
      <>
        <h1>{t("resource.common.error_occurred")}</h1>
        <pre>{JSON.stringify(error, null, 4)}</pre>
      </>
    );
  }

  return (
    <>
      {getHelmet({
        title,
        description,
        image: socialImage,
        canonicalUrl,
        url: pageUrl,
        siteName: brandName,
        ogType: "website",
      })}
      <div className="margin0auto basePageContainer">
        <h1 className="visually-hidden">{title}</h1>
        <CollectionListingSection
          props={COLLECTION_PAGE_SECTIONS.collectionListing.props}
          blocks={COLLECTION_PAGE_SECTIONS.collectionListing.blocks}
          globalConfig={globalConfig}
        />
        {isLoading && <Loader />}
      </div>
    </>
  );
}

export const settings = JSON.stringify({
  props: [],
});

export const sections = JSON.stringify([
  {
    attributes: {
      page: "collection-listing",
    },
  },
]);

export default CollectionListing;

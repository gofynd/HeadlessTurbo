import React, { useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import Loader from "../components/loader/loader";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import CollectionsSection from "../sections/collections";
import { COLLECTIONS_PAGE_SECTIONS } from "../props/collections";

function Collections({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi, page: "collections" });
  const seoData = page?.seo || {};
  const { error, isLoading } = page || {};
  const fallbackTitle =
    COLLECTIONS_PAGE_SECTIONS.collections.props?.title?.value ||
    "Collections";
  const fallbackDescription =
    COLLECTIONS_PAGE_SECTIONS.collections.props?.description?.value || "";
  const {
    brandName,
    canonicalUrl,
    pageUrl,
    description: seoDescription,
    socialImage,
  } = useSeoMeta({ fpi, seo: seoData });

  const title = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.title || fallbackTitle || "Collections",
    );
    if (raw && brandName) return `${raw} | ${brandName}`;
    return raw || brandName || "";
  }, [seoData?.title, brandName, fallbackTitle]);

  const description = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.description || fallbackDescription || "",
    );
    const normalized = raw.replace(/\s+/g, " ").trim();
    return normalized || seoDescription;
  }, [seoData?.description, fallbackDescription, seoDescription]);

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
        <CollectionsSection
          props={COLLECTIONS_PAGE_SECTIONS.collections.props}
          blocks={COLLECTIONS_PAGE_SECTIONS.collections.blocks}
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
      page: "collections",
    },
  },
]);

export default Collections;

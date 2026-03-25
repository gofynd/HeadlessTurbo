import React, { useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import Loader from "../components/loader/loader";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import CategoriesSection from "../sections/categories";
import { CATEGORIES_PAGE_SECTIONS } from "../props/categories";

function Categories({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi, page: "categories" });
  const seoData = page?.seo || {};
  const { error, isLoading } = page || {};
  const fallbackTitle =
    CATEGORIES_PAGE_SECTIONS.categories.props?.heading?.value ||
    t("resource.common.page_titles.categories");
  const fallbackDescription =
    CATEGORIES_PAGE_SECTIONS.categories.props?.description?.value || "";
  const {
    brandName,
    canonicalUrl,
    pageUrl,
    description: seoDescription,
    socialImage,
  } = useSeoMeta({ fpi, seo: seoData });

  const title = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.title || fallbackTitle || t("resource.common.page_titles.categories")
    );
    if (raw && brandName) return `${raw} | ${brandName}`;
    return raw || brandName || "";
  }, [seoData?.title, brandName, fallbackTitle, t]);

  const description = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.description || fallbackDescription || t("resource.categories.categories_description")
    );
    const normalized = raw.replace(/\s+/g, " ").trim();
    return normalized || seoDescription;
  }, [seoData?.description, fallbackDescription, t, seoDescription]);

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
        <CategoriesSection
          fpi={fpi}
          props={CATEGORIES_PAGE_SECTIONS.categories.props}
          blocks={CATEGORIES_PAGE_SECTIONS.categories.blocks}
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
      page: "categories",
    },
  },
]);

export default Categories;

import React, { useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useSearchParams } from "react-router-dom";
import { useThemeConfig } from "../helper/hooks";
import Loader from "../components/loader/loader";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import ProductListingSection from "../sections/product-listing";
import { PLP_PAGE_DUMMY_SECTIONS } from "../helper/dummy-data";

function ProductListing({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi, page: "product-listing" });
  const seoData = page?.seo || {};
  const { error, isLoading } = page || {};
  const [searchParams] = useSearchParams();
  const department = searchParams.get("department") || "";
  const brand = searchParams.get("brand") || "";
  const category = searchParams.get("category") || "";
  const {
    brandName,
    canonicalUrl,
    pageUrl,
    description: seoDescription,
    socialImage,
  } = useSeoMeta({ fpi, seo: seoData });

  const title = useMemo(() => {
    const seoTitle = sanitizeHTMLTag(seoData?.title);

    if (category && department) {
      return `${sanitizeHTMLTag(category)} | ${sanitizeHTMLTag(department)}`;
    }

    if (brand) {
      const base = sanitizeHTMLTag(brand);
      const suffix = brandName ? ` | ${brandName}` : "";
      return `${base}${suffix}`;
    }

    const fallback =
      seoTitle || t("resource.common.page_titles.product_listing");

    if (fallback && brandName) {
      return `${fallback} | ${brandName}`;
    }

    return fallback || brandName || "";
  }, [seoData?.title, category, department, brand, brandName, t]);

  const description = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.description || t("resource.product.seo_description"),
    );
    const normalized = raw.replace(/\s+/g, " ").trim();
    return normalized || seoDescription;
  }, [seoData?.description, t, seoDescription]);

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
        <ProductListingSection
          props={PLP_PAGE_DUMMY_SECTIONS.productListing.props}
          blocks={PLP_PAGE_DUMMY_SECTIONS.productListing.blocks}
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
      page: "product-listing",
    },
  },
]);

export default ProductListing;

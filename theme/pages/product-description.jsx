import React, { useMemo } from "react";
import { useGlobalStore } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import Loader from "../components/loader/loader";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import { getHelmet } from "../providers/global-provider";
import styles from "../styles/sections/product-description.less";
import {
  sanitizeHTMLTag,
  sanitizeMetaDescription,
} from "../helper/utils";
import ProductDescriptionSection from "../sections/product-description";
import { PDP_PAGE_SECTIONS } from "../props/product-description";
import { useGlobalTranslation } from "fdk-core/utils";

function ProductDescription({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi, page: "product-description" });
  const PRODUCT = useGlobalStore(fpi.getters.PRODUCT);
  const seo = PRODUCT?.product_details?.seo || {};
  const productDescription =
    PRODUCT?.product_details?.description ||
    PRODUCT?.product_meta?.short_description;
  const productName = PRODUCT?.product_details?.name || "";
  const productImage =
    PRODUCT?.product_details?.media?.[0]?.secure_url ||
    PRODUCT?.product_details?.media?.[0]?.url ||
    "";
  const {
    brandName,
    canonicalUrl,
    pageUrl,
    description: seoDescription,
    socialImage,
  } = useSeoMeta({
    fpi,
    seo: { ...seo, image: seo?.image || productImage },
    fallbackImage: productImage,
  });

  const title = useMemo(() => {
    const raw = sanitizeHTMLTag(seo?.title || productName);
    return raw && brandName ? `${raw} | ${brandName}` : raw || brandName || "";
  }, [seo?.title, productName, brandName]);

  const description = useMemo(() => {
    const rawSeoDesc = sanitizeHTMLTag(seo?.description || "");
    const rawProductDesc = sanitizeMetaDescription(productDescription || "");
    const rawTitle = sanitizeHTMLTag(title || "");
    const rawBrandName = sanitizeHTMLTag(brandName || "");

    const raw =
      rawSeoDesc || rawProductDesc || rawTitle || rawBrandName || "";
    return raw;
  }, [seo?.description, productDescription, title, brandName]);

  const { error, isLoading } = page || {};

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
        ogType: "product",
      })}
      <div
        className={`${styles.productDescWrapper} basePageContainer margin0auto`}
      >
        <h1 className="visually-hidden">{title}</h1>
        <ProductDescriptionSection
          props={PDP_PAGE_SECTIONS.productDescription.props}
          blocks={PDP_PAGE_SECTIONS.productDescription.blocks}
          globalConfig={globalConfig}
        />
        {isLoading && <Loader />}
      </div>
      {/* Note: Do not remove the below empty div, it is required to insert sticky add to cart at the bottom of the sections */}
      <div id="sticky-add-to-cart" className={styles.stickyAddToCart}></div>
    </>
  );
}

export const settings = JSON.stringify({
  props: [],
});

export const sections = JSON.stringify([
  {
    attributes: {
      page: "product-description",
    },
  },
]);

export default ProductDescription;

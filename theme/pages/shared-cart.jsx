import React, { useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import SharedCart from "../page-layouts/shared-cart/shared-cart";
import Loader from "../components/loader/loader";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";

function SharedCartPage({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  useThemeConfig({ fpi, page: "shared-cart" });
  const seoData = page?.seo || {};
  const {
    brandName,
    canonicalUrl,
    pageUrl,
    description: seoDescription,
    socialImage,
  } = useSeoMeta({ fpi, seo: seoData });
  const { error, isLoading } = page || {};

  const title = useMemo(() => {
    const base =
      (seoData?.title?.value ?? seoData?.title) ||
      (brandName ? `Shared Cart | ${brandName}` : "Shared Cart");
    return sanitizeHTMLTag(base);
  }, [seoData?.title, brandName]);

  const description = useMemo(() => {
    const base = seoData?.description?.value ?? seoData?.description ?? "";
    return sanitizeHTMLTag(base).replace(/\s+/g, " ").trim() || seoDescription;
  }, [seoData?.description, seoDescription]);

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
      <div className="basePageContainer margin0auto">
        <h1 className="visually-hidden">{title}</h1>
        {isLoading ? <Loader /> : <SharedCart fpi={fpi} />}
      </div>
    </>
  );
}

SharedCartPage.serverFetch = () => {};

export const settings = JSON.stringify({ props: [] });

export const sections = JSON.stringify([
  {
    canvas: { value: "left_panel", label: "Left Panel" },
    attributes: { page: "shared-cart" },
    blocks: [
      { type: "shared-cart-items", name: "Shared Cart Items", props: [] },
    ],
  },
  {
    canvas: { value: "right_panel", label: "Right Panel" },
    attributes: { page: "shared-cart" },
    blocks: [
      { type: "shared-cart-breakup", name: "Shared Cart Breakup", props: [] },
    ],
  },
]);

export default SharedCartPage;

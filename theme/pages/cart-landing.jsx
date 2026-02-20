import React, { useEffect, useMemo } from "react";
import { useGlobalStore, useNavigate, useGlobalTranslation } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import Loader from "../components/loader/loader";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import CartLanding from "../sections/cart-landing";
import { CART_PAGE_DUMMY_SECTIONS } from "../helper/dummy-data";
import styles from "../styles/cart-landing.less";

function CartPage({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const navigate = useNavigate();
  const { globalConfig } = useThemeConfig({ fpi, page: "cart-landing" });
  const seoData = page?.seo || {};
  const { error, isLoading } = page || {};
  const {
    brandName,
    canonicalUrl,
    pageUrl,
    description: seoDescription,
    socialImage,
  } = useSeoMeta({ fpi, seo: seoData });

  const title = useMemo(() => {
    const baseTitle = sanitizeHTMLTag(
      seoData?.title || brandName || t("resource.common.page_titles.cart") || "Cart",
    );
    return baseTitle ? `${baseTitle} - Official Online Store` : "";
  }, [seoData?.title, brandName, t]);

  const description = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.description || t("resource.cart_landing.seo_description"),
    );
    const normalized = raw.replace(/\s+/g, " ").trim();
    return normalized || seoDescription;
  }, [seoData?.description, t, seoDescription]);

  useEffect(() => {
    if (globalConfig?.disable_cart) {
      navigate("/");
    }
  }, [globalConfig, navigate]);

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
        robots: "noindex, nofollow",
      })}
      <div className={`${styles.cart} basePageContainer margin0auto`}>
        <h1 className="visually-hidden">{title}</h1>
        <CartLanding
          props={CART_PAGE_DUMMY_SECTIONS.cartLanding.props}
          blocks={CART_PAGE_DUMMY_SECTIONS.cartLanding.blocks}
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
    canvas: {
      value: "left_panel",
      label: "Left Panel",
    },
    attributes: {
      page: "cart-landing",
    },
  },
  {
    canvas: {
      value: "right_panel",
      label: "Right Panel",
    },
    attributes: {
      page: "cart-landing",
    },
  },
]);

export default CartPage;

import React, { useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import Loader from "../components/loader/loader";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import OrderTrackingSection from "../sections/order-tracking";
import { ORDER_TRACKING_PAGE_DUMMY_SECTIONS } from "../helper/dummy-data";

function OrderTracking({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi, page: "order-tracking" });
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
    const base = brandName ? `Track Order | ${brandName}` : "Track Order";
    return sanitizeHTMLTag(base);
  }, [brandName]);

  const description = useMemo(() => {
    const base = t("resource.order_tracking.seo_description");
    return (
      sanitizeHTMLTag(base).replace(/\s+/g, " ").trim() || seoDescription
    );
  }, [t, seoDescription]);

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
        <OrderTrackingSection
          fpi={fpi}
          props={ORDER_TRACKING_PAGE_DUMMY_SECTIONS.orderTracking.props}
          blocks={ORDER_TRACKING_PAGE_DUMMY_SECTIONS.orderTracking.blocks}
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
      page: "order-tracking",
    },
  },
]);

export default OrderTracking;

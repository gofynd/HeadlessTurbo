import React, { useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import ProfileShipmentUpdatePage from "../page-layouts/profile/profile-shipment-update-page";
import Loader from "../components/loader/loader";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";

const ShipmentUpdate = ({ fpi }) => {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  useThemeConfig({ fpi, page: "shipment-update" });
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
      (brandName ? `Update Shipment | ${brandName}` : "Update Shipment");
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
        robots: "noindex, nofollow",
        ogType: "website",
      })}
      <div className="basePageContainer margin0auto">
        <h1 className="visually-hidden">{title}</h1>
        {isLoading ? <Loader /> : <ProfileShipmentUpdatePage fpi={fpi} />}
      </div>
    </>
  );
};

export const settings = JSON.stringify({ props: [] });

export const sections = JSON.stringify([
  {
    canvas: { value: "right_side", label: "Right Panel" },
    attributes: { page: "shipment-update" },
    blocks: [
      {
        type: "profile-navigation-menu",
        name: "Profile Navigation Menu",
        props: [],
      },
    ],
  },
]);

export default ShipmentUpdate;

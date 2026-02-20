import React, { useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import Loader from "../components/loader/loader";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import SetPasswordSection from "../sections/set-password";
import { SET_PASSWORD_PAGE_DUMMY_SECTIONS } from "../helper/dummy-data";

function SetPassword({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi, page: "set-password" });
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
    const raw = sanitizeHTMLTag(
      seoData?.title || "Set Password"
    );
    if (raw && brandName) return `${raw} | ${brandName}`;
    return raw || brandName || "";
  }, [seoData?.title, brandName]);

  const description = useMemo(() => {
    const raw = sanitizeHTMLTag(seoData?.description || "");
    const normalized = raw.replace(/\s+/g, " ").trim();
    return normalized || seoDescription;
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
      <div className="margin0auto basePageContainer">
        <h1 className="visually-hidden">{title}</h1>
        <SetPasswordSection
          fpi={fpi}
          props={SET_PASSWORD_PAGE_DUMMY_SECTIONS.setPassword.props}
          blocks={SET_PASSWORD_PAGE_DUMMY_SECTIONS.setPassword.blocks}
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
      page: "set-password",
    },
  },
]);

export default SetPassword;

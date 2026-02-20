import React, { useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import Loader from "../components/loader/loader";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import PageNotFoundSection from "../sections/page-not-found";
import { NOT_FOUND_PAGE_DUMMY_SECTIONS } from "../helper/dummy-data";

function PageNotFound({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi, page: "not-found-page" });
  const seoData = page?.seo || {};
  const { error, isLoading } = page || {};
  const fallbackTitle =
    NOT_FOUND_PAGE_DUMMY_SECTIONS.pageNotFound.props?.heading?.value ||
    "Page Not Found";
  const fallbackDescription =
    NOT_FOUND_PAGE_DUMMY_SECTIONS.pageNotFound.props?.message?.value ||
    "The page you are looking for does not exist.";
  const {
    brandName,
    canonicalUrl,
    pageUrl,
    description: seoDescription,
    socialImage,
  } = useSeoMeta({ fpi, seo: seoData });

  const title = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.title || fallbackTitle
    );
    if (raw && brandName) return `${raw} | ${brandName}`;
    return raw || brandName || "";
  }, [seoData?.title, brandName, fallbackTitle]);

  const description = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.description || fallbackDescription
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
        <PageNotFoundSection
          fpi={fpi}
          props={NOT_FOUND_PAGE_DUMMY_SECTIONS.pageNotFound.props}
          blocks={NOT_FOUND_PAGE_DUMMY_SECTIONS.pageNotFound.blocks}
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
      page: "not-found-page",
    },
    blocks: [
      {
        type: "page-not-found",
        name: "Page Not Found",
        props: [
          {
            type: "text",
            id: "heading",
            label: "Heading",
            default: "Page Not Found",
            value: "Page Not Found",
          },
          {
            type: "text",
            id: "message",
            label: "Message",
            default: "The page you are looking for does not exist.",
            value: "The page you are looking for does not exist.",
          },
          {
            type: "text",
            id: "button_text",
            label: "Button Text",
            default: "Return to Home",
            value: "Return to Home",
          },
        ],
      },
    ],
  },
]);

export default PageNotFound;

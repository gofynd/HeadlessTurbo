import React, { useMemo, useEffect } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import Loader from "../components/loader/loader";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import HeroImage from "../sections/hero-image";
import FeaturedCollection from "../sections/featured-collection";
import ImageSlideshow from "../sections/image-slideshow";
import MediaWithText from "../sections/media-with-text";
import Testimonials from "../sections/testimonials";
import { HOME_PAGE_DUMMY_SECTIONS } from "../helper/dummy-data";
import { globalDataResolver } from "../helper/lib";

function Home({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi, page: "home" });

  // Ensure global data (currencies, countries, etc.) is loaded on homepage via Storefront GraphQL
  useEffect(() => {
    const creds = typeof window !== "undefined" && (window.APP_DATA || window.__APP_CREDENTIALS__);
    if (fpi && creds?.applicationID && creds?.applicationToken) {
      globalDataResolver({
        fpi,
        applicationID: creds.applicationID,
        applicationToken: creds.applicationToken,
        preferStorefrontGraphql: true,
      });
    }
  }, [fpi]);
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
      seoData?.title || brandName || t("resource.common.page_titles.home"),
    );
    return baseTitle ? `${baseTitle} - Official Online Store` : "";
  }, [seoData?.title, brandName, t]);

  const description = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.description || t("resource.common.home_seo_description"),
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
        <HeroImage
          fpi={fpi}
          props={HOME_PAGE_DUMMY_SECTIONS.heroImage.props}
          blocks={HOME_PAGE_DUMMY_SECTIONS.heroImage.blocks}
          globalConfig={globalConfig}
        />
        <FeaturedCollection
          fpi={fpi}
          props={HOME_PAGE_DUMMY_SECTIONS.featuredCollection.props}
          globalConfig={globalConfig}
        />
        <ImageSlideshow
          fpi={fpi}
          props={HOME_PAGE_DUMMY_SECTIONS.imageSlideshow.props}
          blocks={HOME_PAGE_DUMMY_SECTIONS.imageSlideshow.blocks}
          globalConfig={globalConfig}
        />
        <MediaWithText
          fpi={fpi}
          props={HOME_PAGE_DUMMY_SECTIONS.mediaWithText.props}
          blocks={HOME_PAGE_DUMMY_SECTIONS.mediaWithText.blocks}
          globalConfig={globalConfig}
        />
        <Testimonials
          fpi={fpi}
          props={HOME_PAGE_DUMMY_SECTIONS.testimonials.props}
          blocks={HOME_PAGE_DUMMY_SECTIONS.testimonials.blocks}
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
      page: "home",
    },
  },
]);

export default Home;

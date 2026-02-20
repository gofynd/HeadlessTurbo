import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { isLoggedIn } from "../helper/auth-guard";
import { useThemeConfig } from "../helper/hooks";
import ProfileRoot from "../components/profile/profile-root";
import Loader from "../components/loader/loader";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import ProfileWishlist from "../sections/profile-wishlist";
import ProfileNavigationMenu from "../sections/profile-navigation-menu";
import { WISHLIST_PAGE_DUMMY_SECTIONS } from "../helper/dummy-data";
import "@gofynd/theme-template/components/profile-navigation/profile-navigation.css";

function WishlistPage({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi, page: "wishlist" });
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
      seoData?.title || t("resource.common.page_titles.wishlist")
    );
    if (raw && brandName) return `${raw} | ${brandName}`;
    return raw || brandName || "";
  }, [seoData?.title, brandName, t]);

  const description = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.description || t("resource.wishlist.seo_description")
    );
    const normalized = raw.replace(/\s+/g, " ").trim();
    return normalized || seoDescription;
  }, [seoData?.description, t, seoDescription]);

  const leftSections = useMemo(
    () => [
      {
        name: "profile-wishlist",
        props: WISHLIST_PAGE_DUMMY_SECTIONS.profileWishlist.props,
        blocks: [],
      },
    ],
    []
  );

  const rightSections = useMemo(
    () => [
      {
        name: "profile-navigation-menu",
        props: WISHLIST_PAGE_DUMMY_SECTIONS.profileNavigationMenu.props,
        blocks: [],
      },
    ],
    []
  );

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
      <ProfileRoot
        fpi={fpi}
        leftSections={leftSections}
        rightSections={rightSections}
        globalConfig={globalConfig}
      >
        <motion.div
          key="wishlist"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.5 } },
          }}
          initial="hidden"
          animate="visible"
          style={{ height: "100%" }}
        >
          <div className="margin0auto basePageContainer">
            <h1 className="visually-hidden">{title}</h1>
            <ProfileWishlist
              fpi={fpi}
              props={WISHLIST_PAGE_DUMMY_SECTIONS.profileWishlist.props}
              blocks={WISHLIST_PAGE_DUMMY_SECTIONS.profileWishlist.blocks}
              globalConfig={globalConfig}
            />
          </div>
        </motion.div>
      </ProfileRoot>
      {isLoading && <Loader />}
    </>
  );
}

WishlistPage.authGuard = isLoggedIn;

export const settings = JSON.stringify({
  props: [],
});

export const sections = JSON.stringify([
  {
    canvas: {
      value: "left_side",
      label: "Left Panel",
    },
    attributes: {
      page: "wishlist",
    },
    blocks: [
      {
        type: "profile-wishlist",
        name: "Profile Wishlist",
        props: [
          {
            type: "text",
            id: "title",
            value: "My Wishlist",
          },
        ],
      },
    ],
  },
  {
    canvas: {
      value: "right_side",
      label: "Right Panel",
    },
    attributes: {
      page: "wishlist",
    },
    blocks: [
      {
        type: "profile-navigation-menu",
        name: "Profile Navigation Menu",
        props: [],
      },
    ],
  },
]);

export default WishlistPage;

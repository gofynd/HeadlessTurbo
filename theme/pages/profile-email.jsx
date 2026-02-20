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
import ProfileEmailSection from "../sections/profile-email";
import { PROFILE_EMAIL_PAGE_DUMMY_SECTIONS } from "../helper/dummy-data";
import "@gofynd/theme-template/components/profile-navigation/profile-navigation.css";

function ProfileEmail({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi, page: "profile-email" });
  const seoData = page?.seo || {};
  const { error, isLoading } = page || {};
  const {
    brandName,
    canonicalUrl,
    pageUrl,
    description: seoDescription,
    socialImage,
  } = useSeoMeta({ fpi, seo: {} });

  const title = useMemo(() => {
    const base = brandName ? `My Account | ${brandName}` : "My Account";
    return sanitizeHTMLTag(base);
  }, [brandName]);

  const description = useMemo(() => {
    const base = t("resource.profile_details.seo_description");
    return (
      sanitizeHTMLTag(base).replace(/\s+/g, " ").trim() || seoDescription
    );
  }, [t, seoDescription]);

  const leftSections = useMemo(
    () => [
      {
        name: "profile-email",
        props: PROFILE_EMAIL_PAGE_DUMMY_SECTIONS.profileEmail.props,
        blocks: [],
      },
    ],
    []
  );

  const rightSections = useMemo(
    () => [
      {
        name: "profile-navigation-menu",
        props: PROFILE_EMAIL_PAGE_DUMMY_SECTIONS.profileNavigationMenu.props,
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
        robots: "noindex, nofollow",
        ogType: "website",
      })}
      <ProfileRoot
        fpi={fpi}
        leftSections={leftSections}
        rightSections={rightSections}
        globalConfig={globalConfig}
      >
        <motion.div
          key="profile-email"
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
            <ProfileEmailSection
              fpi={fpi}
              props={PROFILE_EMAIL_PAGE_DUMMY_SECTIONS.profileEmail.props}
              blocks={PROFILE_EMAIL_PAGE_DUMMY_SECTIONS.profileEmail.blocks}
              globalConfig={globalConfig}
            />
          </div>
        </motion.div>
      </ProfileRoot>
      {isLoading && <Loader />}
    </>
  );
}

ProfileEmail.authGuard = isLoggedIn;

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
      page: "profile-email",
    },
    blocks: [
      {
        type: "profile-email",
        name: "Profile Email",
        props: [
          {
            type: "text",
            id: "title",
            value: "Email Address",
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
      page: "profile-email",
    },
  },
]);

export default ProfileEmail;

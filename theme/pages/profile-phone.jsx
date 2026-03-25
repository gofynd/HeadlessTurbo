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
import ProfilePhoneSection from "../sections/profile-phone";
import { PROFILE_PHONE_PAGE_SECTIONS } from "../props/profile-phone";
import "@gofynd/theme-template/components/profile-navigation/profile-navigation.css";

function ProfilePhone({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi, page: "profile-phone" });
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
        name: "profile-phone",
        props: PROFILE_PHONE_PAGE_SECTIONS.profilePhone.props,
        blocks: [],
      },
    ],
    []
  );

  const rightSections = useMemo(
    () => [
      {
        name: "profile-navigation-menu",
        props: PROFILE_PHONE_PAGE_SECTIONS.profileNavigationMenu.props,
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
          key="profile-phone"
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
            <ProfilePhoneSection
              fpi={fpi}
              props={PROFILE_PHONE_PAGE_SECTIONS.profilePhone.props}
              blocks={PROFILE_PHONE_PAGE_SECTIONS.profilePhone.blocks}
              globalConfig={globalConfig}
            />
          </div>
        </motion.div>
      </ProfileRoot>
      {isLoading && <Loader />}
    </>
  );
}

ProfilePhone.authGuard = isLoggedIn;

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
      page: "profile-phone",
    },
    blocks: [
      {
        type: "profile-phone",
        name: "Profile Phone",
        props: [
          {
            type: "text",
            id: "title",
            value: "Phone Number",
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
      page: "profile-phone",
    },
  },
]);

export default ProfilePhone;

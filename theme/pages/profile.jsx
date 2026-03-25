import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useGlobalStore, useNavigate, useGlobalTranslation } from "fdk-core/utils";
import { isLoggedIn } from "../helper/auth-guard";
import { useThemeConfig } from "../helper/hooks";
import ProfileRoot from "../components/profile/profile-root";
import Loader from "../components/loader/loader";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import { PROFILE_PAGE_RIGHT_SECTIONS } from "../props/profile";
import "@gofynd/theme-template/components/profile-navigation/profile-navigation.css";

function Profile({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi, page: "profile" });
  const seoData = page?.seo || {};
  const { brandName, canonicalUrl, pageUrl, description: seoDescription, socialImage } =
    useSeoMeta({ fpi, seo: seoData });
  const { error, isLoading } = page || {};

  const title = useMemo(() => {
    const base = (seoData?.title?.value ?? seoData?.title) || (brandName ? `My Account | ${brandName}` : "My Account");
    return sanitizeHTMLTag(base);
  }, [seoData?.title, seoData?.value, brandName]);

  const description = useMemo(() => {
    const base = (seoData?.description?.value ?? seoData?.description) || "";
    return sanitizeHTMLTag(base).replace(/\s+/g, " ").trim() || seoDescription;
  }, [seoData?.description, seoDescription]);

  useEffect(() => {
    if (pathname === "/profile") {
      navigate("/profile/details");
    }
  }, [pathname, navigate]);

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
        rightSections={PROFILE_PAGE_RIGHT_SECTIONS}
        globalConfig={globalConfig}
      >
        <div className="margin0auto basePageContainer">
          <h1 className="visually-hidden">{title}</h1>
        </div>
      </ProfileRoot>
      {isLoading && <Loader />}
    </>
  );
}

Profile.authGuard = isLoggedIn;

export const settings = JSON.stringify({ props: [] });

export const sections = JSON.stringify([
  {
    canvas: {
      value: "Profile",
      label: "Profile Panel",
    },
    attributes: {
      page: "profile",
    },
    blocks: [
      {
        type: "profile-navigation-menu",
        name: "Profile Navigation Menu",
        props: [],
      },
    ],
    default: true,
  },
]);

export default Profile;

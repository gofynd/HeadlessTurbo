import React, { useMemo, useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { FDKLink } from "fdk-core/components";
import { convertActionToUrl } from "fdk-core/utils";
import styles from "./footer.less";
import useHeader from "../header/useHeader";
import SocialLinks from "../socail-media/socail-media";
import { useGlobalTranslation } from "fdk-core/utils";
import fallbackFooterLogo from "../../assets/images/logo-footer.png";
import { useThemeConfig } from "../../helper/hooks";
import { sanitizeHtml, safeUrl } from "../../helper/security/sanitize-html";
import FooterContactLogo from "../../assets/images/footer-call-icon.svg";
import FooterEmailLogo from "../../assets/images/footer-mail-icon.svg";
import AccordionArrow from "../../assets/images/accordion-arrow.svg";
function Footer({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const location = useLocation();
  const { globalConfig, FooterNavigation, contactInfo, supportInfo } =
    useHeader(fpi);
  const { email, phone } = supportInfo?.contact ?? {};
  const { active: emailActive = false, email: emailArray = [] } = email ?? {};
  const { active: phoneActive = false, phone: phoneArray = [] } = phone ?? {};
  const { pallete } = useThemeConfig({ fpi });
  const [isMobile, setIsMobile] = useState(false);
  const descriptionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);

  const isPDP = /^\/product\/[^/]+\/?$/.test(location.pathname); // ⬅️ PDP check

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(max-width: 767px)");
      setIsMobile(mq.matches);

      const handler = (e) => setIsMobile(e.matches);

      if (mq.addEventListener) {
        mq.addEventListener("change", handler);
      } else if (mq.addListener) {
        mq.addListener(handler);
      }

      return () => {
        if (mq.removeEventListener) {
          mq.removeEventListener("change", handler);
        } else if (mq.removeListener) {
          mq.removeListener(handler);
        }
      };
    }
  }, []);

  // SECURITY (report FND-02 / FND-05): footer_description used to extract
  // <style>/<script> blocks and re-inject the scripts as live DOM. Now the
  // entire CMS-provided HTML flows through DOMPurify; scripts and inline
  // event handlers are stripped, iframes from trusted media hosts are kept.
  const safeFooterDescription = useMemo(() => {
    const originalContent =
      typeof globalConfig?.footer_description === "string"
        ? globalConfig.footer_description
        : "";
    return originalContent
      ? sanitizeHtml(originalContent, { allowIframes: true })
      : "";
  }, [globalConfig?.footer_description]);

  const logoMaxHeightMobile = globalConfig?.footer_logo_max_height_mobile || 25;
  const logoMaxHeightDesktop =
    globalConfig?.footer_logo_max_height_desktop || 36;
  const { collapsible_footer_menu = false } = globalConfig || {};
  const footerLogoStyle = {
    "--footer-logo-height": `${
      (isMobile ? logoMaxHeightMobile : logoMaxHeightDesktop) || 0
    }px`,
  };

  const getArtWork = () => {
    if (globalConfig?.footer_image) {
      return {
        "--background-desktop": `url(${
          globalConfig?.footer_image_desktop ||
          "../../assets/images/placeholder19x6.png"
        })`,
        "--background-mobile": `url(${
          globalConfig?.footer_image_mobile ||
          "../../assets/images/placeholder4x5.png"
        })`,
        "--footer-opacity": 0.25,
        "--footer-opacity-background": `${pallete?.footer?.footer_bottom_background}40`, // The last two digits represents the opacity (0.25 is converted to hex)
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover ",
        backgroundPosition: "center",
      };
    }
    return {};
  };

  const getLogo = globalConfig?.logo
    ? globalConfig?.logo?.replace("original", "resize-h:100")
    : fallbackFooterLogo;

  const isSocialLinks = Object.values(contactInfo?.social_links ?? {}).some(
    (value) => value?.link?.trim?.()?.length > 0,
  );

  function hasOne() {
    return emailArray?.length || phoneArray?.length || isSocialLinks;
  }

  const footerStyle = {
    ...getArtWork(),
    ...(isMobile && isPDP ? { paddingBottom: "74px" } : {}),
  };
  const openInNewTab = globalConfig?.footer_social_open_same_tab;

  const isFooterHidden = useMemo(() => {
    const regex =
      /^\/refund\/order\/([^/]+)\/shipment\/([^/]+)$|^\/cart\/bag\/?$|^\/cart\/checkout\/?$/;
    const reattemptShipmentRegex = /^\/reattempt\/shipment\/[^/]+$/;
    return (
      regex.test(location?.pathname) ||
      reattemptShipmentRegex.test(location?.pathname)
    );
  }, [location?.pathname]);

  const toggleKey = (key, value) => {
    if (!collapsible_footer_menu) return;
    setActiveIndex((prev) => {
      const newObj = { ...prev };

      if (key in newObj) {
        delete newObj[key];
      } else {
        newObj[key] = value;
      }

      return newObj;
    });
  };
  return (
    !isFooterHidden && (
      <footer className={`${styles.footer} fontBody`} style={footerStyle}>
        <>
          <div className={styles.footer__top}>
            <div className={styles.footerContainer}>
              <div className={`${styles["footer__top--wrapper"]}`}>
                {(getLogo?.length > 0 || globalConfig?.footer_description) && (
                  <div
                    className={`${styles["footer__top--info"]} ${safeFooterDescription?.length < 83 ? styles["footer__top--unsetFlexWidth"] : ""}`}
                  >
                    {getLogo?.length > 0 && (
                      <div className={`fx-footer-logo ${styles.logo}`}>
                        <div
                          className={styles.logoShell}
                          style={footerLogoStyle}
                        >
                          <img
                            src={getLogo}
                            loading="lazy"
                            alt={t("resource.footer.footer_logo_alt_text")}
                            fetchpriority="low"
                          />
                        </div>
                      </div>
                    )}
                    {globalConfig?.footer_description && (
                      <div
                        ref={descriptionRef}
                        className={`${styles.description} b1 ${styles.fontBody}`}
                      >
                        <div
                          data-testid="footer-html-content"
                          dangerouslySetInnerHTML={{
                            __html: safeFooterDescription,
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`${styles["footer__top--menu"]} ${collapsible_footer_menu ? styles.collapsibleMenu : ""}`}
                >
                  {FooterNavigation?.map((item, index) => (
                    <div
                      className={`${styles.linkBlock} ${collapsible_footer_menu ? styles.collapsible : ""}`}
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleKey(index, index);
                      }}
                    >
                      <h5
                        className={`${styles.menuTitle} ${styles.fontBody} ${collapsible_footer_menu && activeIndex?.[index] !== undefined ? styles.bottomSpace : ""}`}
                      >
                        <div
                          className={`${collapsible_footer_menu ? styles.titleFlex : ""}`}
                        >
                          {item?.action?.page?.type === "external" ? (
                            openInNewTab ? (
                              <a
                                href={safeUrl(item?.action?.page?.query?.url[0])}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {item.display}
                              </a>
                            ) : (
                              <a href={safeUrl(item?.action?.page?.query?.url[0])}>
                                {item.display}
                              </a>
                            )
                          ) : convertActionToUrl(item?.action)?.length > 0 ? (
                            openInNewTab ? (
                              <FDKLink
                                to={convertActionToUrl(item?.action)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {item.display}
                              </FDKLink>
                            ) : (
                              <FDKLink action={item?.action}>
                                {item.display}
                              </FDKLink>
                            )
                          ) : (
                            <p>{item.display}</p>
                          )}
                          <AccordionArrow
                            className={`${styles.accordionArrow} ${collapsible_footer_menu ? styles.showAccordionArrow : ""} ${activeIndex?.[index] !== undefined ? styles.rotate : ""}`}
                          />
                        </div>
                      </h5>
                      <ul
                        className={`${styles.list} ${collapsible_footer_menu ? styles.accordionList : ""} ${collapsible_footer_menu && activeIndex?.[index] !== undefined ? styles.active : ""}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item?.sub_navigation?.map((subItem, subIndex) =>
                          subItem?.active ? (
                            <li
                              className={`${styles.menuItem} b1 ${styles.fontBody}`}
                              key={subIndex}
                            >
                              {subItem?.action?.page?.type === "external" ? (
                                <a
                                  href={safeUrl(subItem?.action?.page?.query?.url[0])}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {subItem.display}
                                </a>
                              ) : convertActionToUrl(subItem?.action)?.length >
                                0 ? (
                                openInNewTab ? (
                                  <FDKLink
                                    to={convertActionToUrl(subItem?.action)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {subItem.display}
                                  </FDKLink>
                                ) : (
                                  <FDKLink action={subItem?.action}>
                                    {subItem.display}
                                  </FDKLink>
                                )
                              ) : (
                                <p>{subItem.display} </p>
                              )}
                            </li>
                          ) : null,
                        )}
                      </ul>
                    </div>
                  ))}
                  {/* {FooterNavigation?.length === 1 && (
                    <div className={styles.lineBlock} />
                  )}
                  {FooterNavigation?.length === 2 && (
                    <div className={styles.lineBlock} />
                  )} */}
                </div>
              </div>
              {hasOne() && (
                <div
                  className={`${styles["footer__top--contactInfo"]} ${globalConfig?.footer_contact_background !== false ? "" : styles["footer__top--noBackground"]}`}
                >
                  {emailActive && emailArray?.length > 0 && (
                    <div className={styles.listData}>
                      {emailArray.map((item, idx) => (
                        <div
                          className={styles.footerSupportData}
                          key={`email-${idx}`}
                        >
                          <div className={styles.footerEmailCnt}>
                            <FooterEmailLogo className={styles.contactIcon} />
                            <h5
                              className={`${styles.title} ${styles.contacts} ${styles.fontBody}`}
                            >
                              {item?.key}
                            </h5>
                          </div>
                          <div>
                            <a
                              href={`mailto:${item?.value}`}
                              className={`${styles.detail} b1 ${styles.fontBody}`}
                            >
                              {item?.value}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {phoneActive && phoneArray?.length > 0 && (
                    <div className={styles.listData}>
                      {phoneArray.map((item, idx) => (
                        <div
                          className={styles.footerSupportData}
                          key={`phone-${idx}`}
                        >
                          <div className={styles.footerEmailCnt}>
                            <FooterContactLogo className={styles.contactIcon} />
                            <h5
                              className={`${styles.title} ${styles.contacts} ${styles.fontBody}`}
                            >
                              {item?.key}
                            </h5>
                          </div>
                          <div>
                            <a
                              dir="ltr"
                              href={`tel:${item?.number}`}
                              className={`${styles.detail} b1 ${styles.fontBody}`}
                            >
                              {`${item?.code ? `+${item.code}-` : ""}${item?.number}`}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={`${styles.list} ${styles.listSocial} `}>
                    {isSocialLinks && (
                      <>
                        <div className={`${styles.socialContainer}`}>
                          {globalConfig?.footer_social_text && (
                            <h5
                              className={`${styles.title} ${styles.socialTitle} ${styles.contacts} ${styles.fontBody}`}
                            >
                              {globalConfig?.footer_social_text}
                            </h5>
                          )}
                          <span>
                            <SocialLinks
                              fpi={fpi}
                              social_links={contactInfo?.social_links}
                            />
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {contactInfo?.copyright_text && (
            <div className={styles.footer__bottom}>
              <div className={styles.footerContainer}>
                <div className={`${styles.copyright} b1 ${styles.fontBody}`}>
                  {contactInfo?.copyright_text}
                </div>
                {globalConfig?.payments_logo && (
                  <div className={styles.paymentLogo}>
                    <img
                      src={globalConfig?.payments_logo}
                      alt={t("resource.footer.payment_logo_alt_text")}
                      loading="lazy"
                      fetchpriority="low"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      </footer>
    )
  );
}

export default Footer;

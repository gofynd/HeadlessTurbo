import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import CheckoutPayment from "@gofynd/theme-template/page-layouts/single-checkout/payment/checkout-payment.js";
import "@gofynd/theme-template/pages/checkout/checkout.css";
import usePayment from "../page-layouts/single-checkout/payment/usePayment";
import Loader from "../components/loader/loader";
import styles from "../styles/payment-link.less";
import GatewayIcon from "../assets/images/trust-gateway.png";
import LinkExpired from "../components/payment-link/link-expired";
import PaymentLinkLoader from "../components/payment-link/payment-link-loader";
import { currencyFormat, sanitizeHTMLTag } from "../helper/utils";
import CountDown from "../components/payment-link/countDown";
import { useThemeConfig } from "../helper/hooks";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import { Helmet } from "react-helmet-async";

function PaymentLink({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  useThemeConfig({ fpi, page: "payment-link" });
  const seoData = page?.seo || {};
  const {
    brandName,
    canonicalUrl,
    pageUrl,
    description: seoDescription,
    socialImage,
  } = useSeoMeta({ fpi, seo: seoData });
  const { error, isLoading: pageLoading } = page || {};

  const bagData = useGlobalStore(fpi?.getters?.CART_ITEMS) || {};
  const CONFIGURATION = useGlobalStore(fpi.getters.CONFIGURATION);
  const [showPayment, setShowPayment] = useState(false);
  const [linkExpired, setLinkExpired] = useState(false);

  const {
    setIsLoading,
    linkPaymentModeOptions,
    paymentLinkData,
    isApiLoading,
    getLinkOrderDetails,
    ...payment
  } = usePayment(fpi);

  const currencySymbol = useMemo(
    () => bagData?.currency?.symbol || "₹",
    [bagData?.currency?.symbol]
  );

  const title = useMemo(() => {
    const base =
      (seoData?.title?.value ?? seoData?.title) ||
      (brandName ? `Payment | ${brandName}` : "Payment");
    return sanitizeHTMLTag(base);
  }, [seoData?.title, brandName]);

  const description = useMemo(() => {
    const base = seoData?.description?.value ?? seoData?.description ?? "";
    return sanitizeHTMLTag(base).replace(/\s+/g, " ").trim() || seoDescription;
  }, [seoData?.description, seoDescription]);

  const memoizedPayment = useMemo(() => payment, [payment]);
  const memoizedLoader = useCallback(() => <Loader />, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        getLinkOrderDetails();
        linkPaymentModeOptions();
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [fpi]);

  if (error) {
    return (
      <>
        <h1>{t("resource.common.error_occurred")}</h1>
        <pre>{JSON.stringify(error, null, 4)}</pre>
      </>
    );
  }

  if (pageLoading) {
    return <Loader />;
  }

  if (isApiLoading) {
    return <PaymentLinkLoader />;
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
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <h1 className="visually-hidden">{title}</h1>
      {paymentLinkData?.external_order_id && !linkExpired ? (
        <div
          className={`${styles.mainContainer} basePageContainer margin0auto`}
        >
          <div className={`${styles.logoHeader} ${styles.paymentHeader}`}>
            <img
              src={CONFIGURATION.application.logo?.secure_url?.replace(
                "original",
                "resize-h:32"
              )}
              alt="name"
            />
            <div className={styles.logoTextContainer}>
              <p className={`fontHeader`}>{t("resource.common.fynd")}</p>
              <div className={styles.gatewayContainer}>
                <img src={GatewayIcon} alt="Gateway Icon" />
                <p className={`${styles.headerChildText} fontBody`}>
                  {t("resource.common.fynd_trusted_gateway")}
                </p>
              </div>
            </div>
            <CountDown
              customClassName={styles.timerBox}
              paymentLinkData={paymentLinkData}
              setLinkExpired={setLinkExpired}
            />
          </div>
          <div className={styles.paymentHeader}>
            <div className={styles.box}>
              <p className={`fontBody ${styles.text} ${styles.textWidth}`}>
                {t("resource.payment_link.order_id")}
              </p>
              <p className={`${styles.orderId} fontBody ${styles.text}`}>
                {paymentLinkData?.external_order_id ?? ""}
              </p>
            </div>
            <div className={styles.box}>
              <p className={`fontBody ${styles.text}  ${styles.textWidth}`}>
                {t("resource.common.amount")}
              </p>
              <p className={`${styles.orderId} fontBody ${styles.text}`}>
                {paymentLinkData?.amount
                  ? currencyFormat(paymentLinkData?.amount, currencySymbol)
                  : ""}
              </p>
            </div>
          </div>
          <CheckoutPayment
            customClassName={styles.borderTopUnset}
            fpi={fpi}
            currencySymbol={currencySymbol}
            payment={memoizedPayment}
            showShipment={false}
            showPayment={true}
            setShowPayment={setShowPayment}
            showPaymentOptions={true}
            loader={<Loader customClassName={styles.customizedLoader} />}
          />
        </div>
      ) : (
        <LinkExpired />
      )}
    </>
  );
}

export const settings = JSON.stringify({ props: [] });
export const sections = JSON.stringify([]);
export default PaymentLink;

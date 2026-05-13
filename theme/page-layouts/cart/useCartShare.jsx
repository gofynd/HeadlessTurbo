import React, { useState } from "react";
import { useSnackbar } from "../../helper/hooks";
import { addLocaleToShareCartUrl, copyToClipboard } from "../../helper/utils";
import { GET_CART_SHARE_LINK, GET_URL_QR_CODE } from "../../queries/cartQuery";
import { useGlobalTranslation, useGlobalStore } from "fdk-core/utils";
import { useParams } from "react-router-dom";

const useCartShare = ({ fpi, cartData }) => {
  const { locale } = useParams();
  const { t } = useGlobalTranslation("translation");
  const [isShareLoading, setIsShareLoading] = useState(true);
  const [shareLink, setShareLink] = useState("");
  const [qrCode, setQrCode] = useState("");
  const { supportedLanguages } = useGlobalStore(fpi.getters.CUSTOM_VALUE) || {};

  const { showSnackbar } = useSnackbar();

  const onShareClick = () => {
    setIsShareLoading(true);
    const payload = {
      getShareCartLinkRequestInput: {
        id: cartData?.id.toString(),
      },
    };
    fpi.executeGQL(GET_CART_SHARE_LINK, payload).then((res) => {
      if (res?.data?.getCartShareLink?.share_url) {
        const qrPayload = {
          url: addLocaleToShareCartUrl(res?.data?.getCartShareLink?.share_url, locale, supportedLanguages),
        };
        fpi.executeGQL(GET_URL_QR_CODE, qrPayload).then((qrRes) => {
          if (qrRes?.data?.getUrlQRCode?.svg) {
            setQrCode(qrRes?.data?.getUrlQRCode?.svg);
            setShareLink(addLocaleToShareCartUrl(res?.data?.getCartShareLink?.share_url, locale, supportedLanguages));
          }
          setIsShareLoading(false);
        });
      }
    });
  };

  const onCopyToClipboardClick = (e) => {
    e.stopPropagation();
    copyToClipboard(shareLink);
    showSnackbar(t("resource.cart.link_copied"), "success");
  };

  // SECURITY (report FND-10): URL-encode shareLink before interpolating into
  // third-party share endpoints (& and # in the URL would otherwise terminate
  // the query string or fragment), and harden popups against tab-nabbing
  // (popup.opener = null) so the opened share dialog cannot navigate this tab.
  const openSharePopup = (url, name) => {
    const popup = window.open(url, name, "height=350,width=600,noopener,noreferrer");
    if (popup) {
      try { popup.opener = null; } catch { /* cross-origin */ }
      if (popup.focus) popup.focus();
    }
    return false;
  };

  const onFacebookShareClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    return openSharePopup(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
      "facebook-popup",
    );
  };

  const onTwitterShareClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    return openSharePopup(
      `https://twitter.com/share?url=${encodeURIComponent(shareLink)}`,
      "twitter-popup",
    );
  };

  return {
    isShareLoading,
    qrCode,
    onShareClick,
    onCopyToClipboardClick,
    onFacebookShareClick,
    onTwitterShareClick,
  };
};

export default useCartShare;

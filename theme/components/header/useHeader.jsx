import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useGlobalStore } from "fdk-core/utils";
import { isRunningOnClient } from "../../helper/utils";
import { useThemeConfig } from "../../helper/hooks";
import { APP_INFO } from "../../props/app-info";
import { FOOTER_NAVIGATION } from "../../props/footer";
import { HEADER_NAVIGATION } from "../../props/header";
import {
  CONTACT_INFO as DEFAULT_CONTACT_INFO,
  SUPPORT_INFO as DEFAULT_SUPPORT_INFO,
} from "../../props/support";

function filterActiveNavigation(navigation = []) {
  return navigation.reduce((acc, item) => {
    if (!item?.active) return acc;

    const subNav = !!item?.sub_navigation?.length
      ? filterActiveNavigation(item?.sub_navigation || [])
      : item?.sub_navigation || [];
    acc.push({ ...item, sub_navigation: subNav });
    return acc;
  }, []);
}

const useHeader = (fpi) => {
  const FOLLOWED_IDS = useGlobalStore(fpi.getters.FOLLOWED_LIST);
  const wishlistIds = FOLLOWED_IDS?.items?.map((m) => m?.uid);
  const wishlistCount = FOLLOWED_IDS?.page?.item_total;
  const NAVIGATION = useGlobalStore(fpi.getters.NAVIGATION);
  const CART_ITEMS = useGlobalStore(fpi.getters.CART);
  const CONTACT_INFO = useGlobalStore(fpi.getters.CONTACT_INFO);
  const SUPPORT_INFO = useGlobalStore(fpi.getters.SUPPORT_INFORMATION);
  const CONFIGURATION = useGlobalStore(fpi.getters.CONFIGURATION);
  const loggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const BUY_NOW = useGlobalStore(fpi.getters.BUY_NOW_CART_ITEMS);
  const { globalConfig } = useThemeConfig({ fpi });
  const HeaderNavigation = useMemo(() => {
    // Always use hardcoded fallback navigation instead of API
    return HEADER_NAVIGATION;
  }, []);

  const FooterNavigation = useMemo(() => {
    const { navigation = [] } =
      NAVIGATION?.items?.find((item) =>
        item.orientation.landscape.includes("bottom"),
      ) || {};
    const activeNavigation = filterActiveNavigation(navigation);
    return activeNavigation.length > 0
      ? activeNavigation
      : FOOTER_NAVIGATION;
  }, [NAVIGATION]);

  const [buyNowParam, setBuyNowParam] = useState(null);
  const location = useLocation();
  useEffect(() => {
    if (isRunningOnClient()) {
      const queryParams = new URLSearchParams(location.search);
      setBuyNowParam((prev) => {
        if (prev === queryParams.get("buy_now")) return prev;
        return queryParams.get("buy_now");
      });
    }
  }, []);

  const cartItemCount = useMemo(() => {
    const bNowCount = BUY_NOW?.cart?.user_cart_items_count || 0;
    if (bNowCount && buyNowParam) {
      return bNowCount;
    } else {
      return CART_ITEMS?.cart_items?.user_cart_items_count || 0;
    }
  }, [CART_ITEMS, BUY_NOW, buyNowParam]);

  const hasContactInfo = useMemo(
    () => !!CONTACT_INFO && Object.keys(CONTACT_INFO).length > 0,
    [CONTACT_INFO],
  );

  const hasSupportInfo = useMemo(
    () => !!SUPPORT_INFO && Object.keys(SUPPORT_INFO).length > 0,
    [SUPPORT_INFO],
  );

  return {
    HeaderNavigation,
    FooterNavigation,
    cartItemCount,
    globalConfig,
    appInfo: CONFIGURATION?.application || APP_INFO,
    contactInfo: hasContactInfo ? CONTACT_INFO : DEFAULT_CONTACT_INFO,
    supportInfo: hasSupportInfo ? SUPPORT_INFO : DEFAULT_SUPPORT_INFO,
    wishlistIds,
    wishlistCount: wishlistCount ?? 0,
    loggedIn,
  };
};

export default useHeader;

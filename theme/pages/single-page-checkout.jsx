import React, { useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "../hooks";
import { SectionRenderer } from "fdk-core/components";

import { useThemeConfig } from "../helper/hooks";
import styles from "../styles/single-page-checkout.less";
import { getHelmet } from "../providers/global-provider";

// Fallback sections when PAGE is not populated (e.g. standalone localhost without themeId).
// pageDataResolver skips THEME_DATA when themeId is null, so PAGE never gets value/sections.
const CHECKOUT_FALLBACK_SECTIONS = [
  {
    name: "checkout",
    canvas: "left_panel",
    props: {},
    blocks: [
      { type: "stepper", name: "Stepper", props: {} },
      { type: "delivery_header", name: "Delivery Header", props: {} },
      { type: "order_summary", name: "Order Summary", props: {} },
      { type: "payment_method", name: "Payment Method", props: {} },
    ],
  },
  {
    name: "checkout",
    canvas: "right_panel",
    props: {},
    blocks: [
      { type: "coupons", name: "Coupons", props: {} },
      { type: "comment", name: "Comment", props: {} },
      { type: "price_breakup", name: "Price Breakup", props: {} },
      { type: "place_order", name: "Place Order Button", props: {} },
    ],
  },
];

function getCanvasValue(section) {
  const c = section?.canvas;
  return typeof c === "string" ? c : c?.value;
}

function SingleCheckoutPage({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { t } = useGlobalTranslation("translation");

  const sections = page?.sections ?? [];
  const useFallback =
    page?.value !== "single-page-checkout" ||
    !Array.isArray(sections) ||
    sections.length === 0;
  const effectiveSections = useFallback ? CHECKOUT_FALLBACK_SECTIONS : sections;

  const leftSections = useMemo(
    () => effectiveSections.filter((s) => getCanvasValue(s) === "left_panel"),
    [effectiveSections],
  );
  const rightSections = useMemo(
    () => effectiveSections.filter((s) => getCanvasValue(s) === "right_panel"),
    [effectiveSections],
  );

  return (
    <>
      {getHelmet({
        title: "Checkout",
        description: t("resource.checkout.seo_description"),
        robots: "noindex, nofollow",
        ogType: "website",
      })}
      <div className={`basePageContainer margin0auto fontBody`}>
        <div className={styles.checkoutContainer}>
          <div className={styles.leftPanel}>
            <SectionRenderer
              sections={leftSections}
              fpi={fpi}
              globalConfig={globalConfig}
            />
          </div>
          <div className={styles.rightPanel}>
            <SectionRenderer
              sections={rightSections}
              fpi={fpi}
              globalConfig={globalConfig}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export const sections = JSON.stringify([
  {
    canvas: {
      value: "left_panel",
      label: "Left Panel",
    },
    attributes: {
      page: "single-page-checkout",
    },
  },
  {
    canvas: {
      value: "right_panel",
      label: "Right Panel",
    },
    attributes: {
      page: "single-page-checkout",
    },
  },
]);

export default SingleCheckoutPage;

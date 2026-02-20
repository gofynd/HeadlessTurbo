import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGlobalStore, useGlobalTranslation, useNavigate } from "../hooks";
import { SectionRenderer } from "fdk-core/components";

import { useLoggedInUser, useThemeConfig } from "../helper/hooks";
import empty from "../assets/images/empty_state.png";
import { ORDER_BY_ID } from "../queries/checkoutQuery";
import EmptyState from "../components/empty-state/empty-state";
import OrderPendingIcon from "../assets/images/order-pending.svg";
import Modal from "../components/core/modal/modal";
import { getGroupedShipmentBags } from "../helper/utils";
import styles from "../styles/order-status.less";
import { getHelmet } from "../providers/global-provider";

// Fallback sections when PAGE is not populated (e.g. theme API not yet loaded or no order-status page in theme).
// Same pattern as single-page-checkout so order-status renders without waiting on THEME_DATA.
const ORDER_STATUS_FALLBACK_SECTIONS = [
  {
    name: "order-status",
    canvas: "header",
    props: {},
    blocks: [{ type: "order_header", name: "Order Header", props: {} }],
  },
  {
    name: "order-status",
    canvas: "left_panel",
    props: {},
    blocks: [{ type: "shipment_list", name: "Shipment List", props: {} }],
  },
  {
    name: "order-status",
    canvas: "right_panel",
    props: {},
    blocks: [
      { type: "price_breakup", name: "Price Breakup", props: {} },
      { type: "payment_info", name: "Payment Information", props: {} },
      { type: "delivery_address", name: "Delivery Address", props: {} },
    ],
  },
];

function OrderPolling() {
  const { t } = useGlobalTranslation("translation");
  return (
    <EmptyState
      description={t("resource.order.polling.description")}
      Icon={<OrderPendingIcon />}
      title={t("resource.order.polling.pending")}
      btnLink="/"
      btnTitle={t("resource.common.continue_shopping")}
    />
  );
}

function OrderStatus({ fpi }) {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("order_id");
  const [orderData, setOrderData] = useState(null);
  const { loggedIn: isLoggedIn } = useLoggedInUser(fpi);
  const [attempts, setAttempts] = useState(0);
  const [showPolling, setShowPolling] = useState(false);
  const navigate = useNavigate();
  const { t } = useGlobalTranslation("translation");
  const { globalConfig } = useThemeConfig({ fpi });
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { sections = [] } = page || {};

  const fetchOrder = useCallback(() => {
    if (!orderId) {
      return;
    }

    setTimeout(() => {
      fpi
        .executeGQL(ORDER_BY_ID, { orderId })
        .then((res) => {
          if (res?.data?.order && orderData === null) {
            setOrderData(res?.data?.order);
            setShowPolling(false);
          } else {
            setAttempts((prev) => prev + 1);
          }
        })
        .catch(() => {
          // Error fetching order, increment attempts to retry
          setAttempts((prev) => prev + 1);
        });
    }, 2000);
  }, [fpi, orderId, orderData]);

  useEffect(() => {
    if (success === "true") {
      if (attempts < 5 && orderData === null) {
        fetchOrder();
      } else if (attempts >= 5) {
        setShowPolling(true);
      }
    }
  }, [success, attempts, fetchOrder, orderData]);

  // Success state - render sections with multiple canvases
  if (success === "true" && orderData?.order_id) {
    const useFallback =
      !page?.value ||
      page.value !== "order-status" ||
      !Array.isArray(sections) ||
      sections.length === 0;
    const effectiveSections = useFallback
      ? ORDER_STATUS_FALLBACK_SECTIONS
      : sections;

    const getCanvasSections = (canvas) =>
      effectiveSections.filter(
        (s) =>
          (typeof s.canvas === "string" ? s.canvas : s.canvas?.value) ===
          canvas,
      );

    const customProps = {
      orderData,
      isLoggedIn,
      getGroupedShipmentBags,
    };

    return (
      <div className="basePageContainer margin0auto">
        <div className={styles.orderStatusContainer}>
          {/* Header sections (full width) */}
          <div className={styles.headerSection}>
            <SectionRenderer
              sections={getCanvasSections("header")}
              fpi={fpi}
              globalConfig={globalConfig}
              customProps={customProps}
            />
          </div>

          {/* Two column layout */}
          <div className={styles.mainContent}>
            {/* LEFT PANEL */}
            <div className={styles.leftPanel}>
              <SectionRenderer
                sections={getCanvasSections("left_panel")}
                fpi={fpi}
                globalConfig={globalConfig}
                customProps={customProps}
              />
            </div>

            {/* RIGHT PANEL */}
            <div className={styles.rightPanel}>
              <SectionRenderer
                sections={getCanvasSections("right_panel")}
                fpi={fpi}
                globalConfig={globalConfig}
                customProps={customProps}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Polling state
  if (success === "true" && showPolling) {
    return (
      <div className="basePageContainer margin0auto">
        <OrderPolling />
      </div>
    );
  }

  // Loading state - show order processing modal
  if (success === "true" && !orderData?.order_id && !showPolling) {
    return (
      <div className="basePageContainer margin0auto">
        <Modal isOpen={true} hideHeader={true}>
          <div className={styles.orderStatusModal}>
            <div className={styles.loader}></div>
            <p className={styles.title}>
              {t("resource.order.fetching_order_details")}
            </p>
            <p className={styles.message}>
              {t("resource.order.please_do_not_press_back_button")}
            </p>
          </div>
        </Modal>
      </div>
    );
  }

  // Failure state
  return (
    <div className="basePageContainer margin0auto">
      <div style={{ textAlign: "center", padding: "40px" }}>
        <img src={empty} alt="Order Failed" style={{ maxWidth: "300px" }} />
        <h2>We couldn’t load your order details</h2>
        <p>Please place an order to view your order status.</p>
        <button
          onClick={() => navigate("/cart/bag")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          GO TO CART
        </button>
      </div>
    </div>
  );
}

// Export 3 canvas definitions (like checkout)
export const sections = JSON.stringify([
  {
    canvas: {
      value: "header",
      label: "Header Section",
    },
    attributes: {
      page: "order-status",
    },
  },
  {
    canvas: {
      value: "left_panel",
      label: "Left Panel (Shipments)",
    },
    attributes: {
      page: "order-status",
    },
  },
  {
    canvas: {
      value: "right_panel",
      label: "Right Panel (Sidebar)",
    },
    attributes: {
      page: "order-status",
    },
  },
]);

export default OrderStatus;

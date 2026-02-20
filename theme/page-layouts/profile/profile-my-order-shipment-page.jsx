import React, { useMemo, Suspense } from "react";
import { motion } from "framer-motion";
import { useGlobalTranslation } from "../../hooks";
import ProfileRoot from "../../components/profile/profile-root";
import { useThemeConfig } from "../../helper/hooks";
import Breadcrumb from "../../components/breadcrumb/breadcrumb";
import Loader from "../../components/loader/loader";
import { SectionRenderer } from "fdk-core/components";
import {
  SHIPMENT_DETAILS_LEFT_SECTIONS,
  SHIPMENT_DETAILS_RIGHT_SECTIONS,
  SHIPMENT_DETAILS_SECTIONS_CONFIG,
} from "../../config/shipment-details-sections";

/**
 * Shipment details page layout.
 * Follows home.jsx pattern: config-driven sections, no theme engine (PAGE) dependency.
 */
function ProfileMyOrderShipmentPage({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const { globalConfig } = useThemeConfig({ fpi, page: "shipment-details" });

  const configuredLeftSections = useMemo(() => {
    return SHIPMENT_DETAILS_LEFT_SECTIONS.map((sectionName) => {
      const sectionConfig = SHIPMENT_DETAILS_SECTIONS_CONFIG[sectionName] || {};
      return {
        name: sectionName,
        props: sectionConfig.props || {},
        blocks: sectionConfig.blocks || [],
        preset: sectionConfig.preset ?? null,
      };
    });
  }, []);

  const configuredRightSections = useMemo(() => {
    return SHIPMENT_DETAILS_RIGHT_SECTIONS.map((sectionName) => {
      const sectionConfig = SHIPMENT_DETAILS_SECTIONS_CONFIG[sectionName] || {};
      return {
        name: sectionName,
        props: sectionConfig.props || {},
        blocks: sectionConfig.blocks || [],
        preset: sectionConfig.preset ?? null,
      };
    });
  }, []);

  const orderInfoLabel = useMemo(() => {
    const translated = t("resource.order.order_information");
    if (!translated || translated.startsWith("resource.")) {
      return "Order Information";
    }
    return translated;
  }, [t]);

  const breadcrumbItems = useMemo(
    () => [
      { label: t("resource.common.breadcrumb.home"), link: "/" },
      { label: t("resource.profile.profile"), link: "/profile/details" },
      { label: t("resource.common.my_orders"), link: "/profile/orders" },
      { label: orderInfoLabel },
    ],
    [t, orderInfoLabel],
  );

  return (
    <ProfileRoot
      fpi={fpi}
      leftSections={configuredLeftSections}
      rightSections={configuredRightSections}
      globalConfig={globalConfig}
    >
      <Breadcrumb breadcrumb={breadcrumbItems} />
      <motion.div
        key="shipment-details"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        }}
        initial="hidden"
        animate="visible"
        className="basePageContainer margin0auto"
      >
        {configuredLeftSections.length > 0 && (
          <Suspense fallback={<Loader />}>
            <SectionRenderer
              sections={configuredLeftSections}
              fpi={fpi}
              globalConfig={globalConfig}
              blocks={[]}
              preset={{}}
            />
          </Suspense>
        )}
      </motion.div>
    </ProfileRoot>
  );
}

export default ProfileMyOrderShipmentPage;

/**
 * Shipment Details Page Sections Configuration
 *
 * Configure which sections appear on the left (main content) and right (sidebar) panels.
 * Same pattern as config/home-sections.js — fully standalone, no theme engine dependency.
 *
 * Left panel: order-details (shipment content).
 * Right panel: profile-navigation-menu.
 */

/** Left panel section names (main content, in order) */
export const SHIPMENT_DETAILS_LEFT_SECTIONS = ["order-details"];

/** Right panel section names (sidebar, in order) */
export const SHIPMENT_DETAILS_RIGHT_SECTIONS = ["profile-navigation-menu"];

/**
 * Blocks for order-details section (main content).
 * Must match settings_data.json "shipment-details" page left_side section blocks
 * so Order Details renders: header, items, medias, tracking, address, payment, breakup, refund.
 */
const ORDER_DETAILS_BLOCKS = [
  { type: "order_header", name: "Order Header", props: {} },
  { type: "shipment_items", name: "Shipment Items", props: {} },
  { type: "shipment_medias", name: "Shipment Medias", props: {} },
  { type: "shipment_tracking", name: "Shipment Tracking", props: {} },
  { type: "shipment_address", name: "Shipment Address", props: {} },
  { type: "payment_details_card", name: "Payment Details Card", props: {} },
  { type: "shipment_breakup", name: "Shipment Breakup", props: {} },
  { type: "total_refund", name: "Total Refund", props: {} },
];

/** Section-specific configuration (props, blocks, preset) */
export const SHIPMENT_DETAILS_SECTIONS_CONFIG = {
  "order-details": {
    props: {},
    blocks: ORDER_DETAILS_BLOCKS,
    preset: null,
  },
  "profile-navigation-menu": {
    props: {},
    blocks: [],
    preset: null,
  },
};

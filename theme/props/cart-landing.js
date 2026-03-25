import { asField } from "./utils";

export const CART_PAGE_SECTIONS = {
  cartLanding: {
    props: {
      is_limited_stock: asField(true, "checkbox"),
      limited_stock_label: asField("Limited stock", "text"),
    },
    blocks: [
      { type: "coupon", props: {} },
      { type: "loyalty_points", props: {} },
      { type: "comment", props: {} },
      { type: "gst_card", props: {} },
      { type: "price_breakup", props: {} },
      { type: "checkout_buttons", props: {} },
      { type: "share_cart", props: {} },
    ],
  },
};

import { asField } from "./utils";

export const PDP_PAGE_SECTIONS = {
  productDescription: {
    props: {
      product: asField("", "product"),
      zoom_in: asField(false, "checkbox"),
      enable_sticky_images: asField(false, "checkbox"),
      enable_buy_now: asField(false, "checkbox"),
      show_sale_tag: asField(true, "checkbox"),
      product_details_bullets: asField(true, "checkbox"),
      icon_color: asField("#D6D6D6", "color"),
      mandatory_pincode: asField(true, "checkbox"),
      variant_position: asField("accordion", "radio"),
      show_products_breadcrumb: asField(true, "checkbox"),
      show_category_breadcrumb: asField(true, "checkbox"),
      show_brand_breadcrumb: asField(true, "checkbox"),
      first_accordian_open: asField(true, "checkbox"),
      img_resize: asField("700", "select"),
      img_resize_mobile: asField("700", "select"),
      display_mode: asField("carousel", "select"),
    },
    blocks: [
      {
        type: "product_name",
        props: { show_brand: asField(true, "checkbox") },
      },
      {
        type: "product_price",
        props: { mrp_label: asField(true, "checkbox") },
      },
      {
        type: "product_tax_label",
        props: { tax_label: asField("Tax included, where applicable", "text") },
      },
      { type: "product_variants", props: {} },
      {
        type: "size_wrapper",
        props: {
          hide_single_size: asField(false, "checkbox"),
          size_selection_style: asField("dropdown", "radio"),
        },
      },
      { type: "pincode", props: { show_logo: asField(false, "checkbox") } },
      { type: "product_description", props: {} },
    ],
  },
};

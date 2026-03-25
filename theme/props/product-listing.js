import { asField } from "./utils";

export const PLP_PAGE_SECTIONS = {
  productListing: {
    props: {
      desktop_banner: asField("", "image_picker"),
      mobile_banner: asField("", "image_picker"),
      banner_link: asField("", "url"),
      product_number: asField(true, "checkbox"),
      loading_options: asField("infinite", "select"),
      page_size: asField(12, "select"),
      back_top: asField(true, "checkbox"),
      in_new_tab: asField(false, "checkbox"),
      hide_brand: asField(false, "checkbox"),
      grid_desktop: asField("4", "select"),
      grid_tablet: asField("2", "select"),
      grid_mob: asField("1", "select"),
      description: asField("", "textarea"),
      img_resize: asField("300", "select"),
      img_resize_mobile: asField("500", "select"),
      show_add_to_cart: asField(true, "checkbox"),
      card_cta_text: asField("Add to Cart", "text"),
      show_size_guide: asField(false, "checkbox"),
      tax_label: asField("Tax included, where applicable", "text"),
      mandatory_pincode: asField(true, "checkbox"),
      hide_single_size: asField(false, "checkbox"),
      preselect_size: asField(false, "checkbox"),
      size_selection_style: asField("block", "radio"),
      filter_toggle_button: asField(false, "checkbox"),
    },
    blocks: [],
  },
};

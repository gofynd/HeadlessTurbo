import { asField } from "./utils";

export const COLLECTION_PAGE_SECTIONS = {
  collectionListing: {
    props: {
      collection: asField("", "collection"),
      desktop_banner: asField("", "image_picker"),
      mobile_banner: asField("", "image_picker"),
      button_link: asField("", "url"),
      product_number: asField(true, "checkbox"),
      loading_options: asField("pagination", "select"),
      page_size: asField(12, "select"),
      back_top: asField(true, "checkbox"),
      in_new_tab: asField(false, "checkbox"),
      hide_brand: asField(false, "checkbox"),
      grid_desktop: asField("4", "select"),
      grid_tablet: asField("3", "select"),
      grid_mob: asField("1", "select"),
      img_resize: asField("300", "select"),
      img_resize_mobile: asField("500", "select"),
      show_add_to_cart: asField(true, "checkbox"),
      card_cta_text: asField("Add to Cart", "text"),
      show_size_guide: asField(true, "checkbox"),
      tax_label: asField("Tax included, where applicable", "text"),
      mandatory_pincode: asField(true, "checkbox"),
      hide_single_size: asField(false, "checkbox"),
      preselect_size: asField(true, "checkbox"),
      size_selection_style: asField("dropdown", "radio"),
    },
    blocks: [],
  },
};

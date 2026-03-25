import { asField } from "./utils";

export const CATEGORIES_PAGE_SECTIONS = {
  categories: {
    props: {
      heading: asField("Categories", "text"),
      description: asField("Browse our product categories.", "textarea"),
      back_top: asField(true, "checkbox"),
      show_category_name: asField(true, "checkbox"),
      category_name_placement: asField("inside", "select"),
      category_name_position: asField("bottom", "select"),
      category_name_text_alignment: asField("text-center", "select"),
    },
    blocks: [],
  },
};


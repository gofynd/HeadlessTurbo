import { asField } from "./utils";

export const COLLECTIONS_PAGE_SECTIONS = {
  collections: {
    props: {
      title: asField("Collections", "text"),
      description: asField(
        "Discover our curated collections featuring the latest trends and must-have items.",
        "textarea",
      ),
      back_top: asField(true, "checkbox"),
      img_fill: asField(true, "checkbox"),
    },
    blocks: [],
  },
};


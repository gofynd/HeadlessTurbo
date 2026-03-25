import { asField } from "./utils";

export const BRANDS_PAGE_SECTIONS = {
  brandsLanding: {
    props: {
      infinite_scroll: asField(true, "checkbox"),
      back_top: asField(true, "checkbox"),
      logo_only: asField(false, "checkbox"),
      img_fill: asField(true, "checkbox"),
      title: asField("", "text"),
      description: asField("", "textarea"),
    },
    blocks: [],
  },
};


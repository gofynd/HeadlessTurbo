import { asField } from "./utils";

export const REGISTER_PAGE_SECTIONS = {
  register: {
    props: {
      image_layout: asField("no_banner", "select"),
      image_banner: asField("", "image_picker"),
    },
    blocks: [],
  },
};


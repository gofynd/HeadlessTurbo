import { asField } from "./utils";

export const LOGIN_PAGE_SECTIONS = {
  login: {
    props: {
      image_layout: asField("no_banner", "select"),
      image_banner: asField("", "image_picker"),
    },
    blocks: [],
  },
};


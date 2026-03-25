import { asField } from "./utils";

export const SET_PASSWORD_PAGE_SECTIONS = {
  setPassword: {
    props: {
      image_layout: asField("no_banner", "select"),
      image_banner: asField("", "image_picker"),
    },
    blocks: [],
  },
};


import { asField } from "./utils";

export const FORGOT_PASSWORD_PAGE_SECTIONS = {
  forgotPassword: {
    props: {
      image_layout: asField("no_banner", "select"),
      image_banner: asField("", "image_picker"),
    },
    blocks: [],
  },
};


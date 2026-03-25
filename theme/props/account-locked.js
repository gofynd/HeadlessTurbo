import { asField } from "./utils";

export const ACCOUNT_LOCKED_PAGE_SECTIONS = {
  accountLocked: {
    props: {
      image_layout: asField("no_banner", "select"),
      image_banner: asField("", "image_picker"),
    },
    blocks: [],
  },
};


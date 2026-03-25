import { asField } from "./utils";

export const ABOUT_US_PAGE_SECTIONS = {
  rawHtml: {
    props: {
      code: asField("<h2>About Us</h2><p>Welcome to our store.</p>", "code"),
      padding_top: asField(16, "range"),
      padding_bottom: asField(16, "range"),
    },
    blocks: [],
  },
};


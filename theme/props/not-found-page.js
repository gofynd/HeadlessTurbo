import { asField } from "./utils";

export const NOT_FOUND_PAGE_SECTIONS = {
  pageNotFound: {
    props: {
      heading: asField("Page Not Found", "text"),
      message: asField(
        "The page you are looking for does not exist.",
        "textarea",
      ),
      button_text: asField("Return to Home", "text"),
    },
    blocks: [],
  },
};


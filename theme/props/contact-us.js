import { asField } from "./utils";

export const CONTACT_US_PAGE_SECTIONS = {
  contactUs: {
    props: {
      align_image: asField("right", "select"),
      align_description: asField("below_header", "select"),
      image_desktop: asField("", "image_picker"),
      opacity: asField(20, "range"),
      show_description: asField(true, "checkbox"),
      show_address: asField(true, "checkbox"),
      show_phone: asField(true, "checkbox"),
      show_email: asField(true, "checkbox"),
      show_icons: asField(true, "checkbox"),
      show_working_hours: asField(true, "checkbox"),
    },
    blocks: [],
  },
};


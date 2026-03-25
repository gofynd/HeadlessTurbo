import { asField } from "./utils";

export const EDIT_PROFILE_PAGE_SECTIONS = {
  editProfile: {
    props: {
      image_layout: asField("no_banner", "select"),
      image_banner: asField("", "image_picker"),
    },
    blocks: [],
  },
};


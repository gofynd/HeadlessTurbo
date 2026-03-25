import { asField } from "./utils";

export const BLOG_DETAIL_PAGE_SECTIONS = {
  blogDetail: {
    props: {
      image: asField("", "image_picker"),
      show_recent_blog: asField(true, "checkbox"),
      recent_blogs: asField("", "blog-list"),
      show_top_blog: asField(true, "checkbox"),
      top_blogs: asField("", "blog-list"),
      title: asField("Blog Post", "text"),
      description: asField("Blog description.", "text"),
      button_text: asField("Shop Now", "text"),
      button_link: asField("", "url"),
      fallback_image: asField("", "image_picker"),
    },
    blocks: [],
  },
};


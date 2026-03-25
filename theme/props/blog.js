import { asField } from "./utils";

export const BLOG_PAGE_SECTIONS = {
  blog: {
    props: {
      show_blog_slide_show: asField(true, "checkbox"),
      filter_tags: asField("", "tags-list"),
      autoplay: asField(true, "checkbox"),
      slide_interval: asField(3, "range"),
      btn_text: asField("Read more", "text"),
      show_tags: asField(true, "checkbox"),
      show_search: asField(true, "checkbox"),
      show_recent_blog: asField(true, "checkbox"),
      recent_blogs: asField("", "blog-list"),
      show_top_blog: asField(true, "checkbox"),
      top_blogs: asField("", "blog-list"),
      show_filters: asField(true, "checkbox"),
      loading_options: asField("infinite", "select"),
    },
    blocks: [],
  },
};


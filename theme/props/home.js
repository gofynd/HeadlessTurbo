import { asField } from "./utils";

export const HOME_PAGE_SECTIONS = {
  heroImage: {
    props: {
      heading: asField("Where Daily Rituals Bloom"),
      description: asField(
        "Clean ingredients, visible results, and mindful skincare for everyday use.",
      ),
      button_text: asField("Shop Bestsellers"),
      button_link: asField("/collections"),
      desktop_banner: asField(
        "https://cdn.fynd.com/v2/falling-surf-7c8bb8/fyprod/wrkr/organization/6527750ff1060f72326269df/theme/assets/5a61961b46773dba81f8.jpg?auto=format&fit=crop&w=1920&q=80",
        "image_picker",
      ),
      mobile_banner: asField(
        "https://cdn.fynd.com/v2/falling-surf-7c8bb8/fyprod/wrkr/organization/6527750ff1060f72326269df/theme/assets/5a61961b46773dba81f8.jpg?auto=format&fit=crop&w=900&q=80",
        "image_picker",
      ),
      text_alignment_desktop: asField("left", "select"),
      text_alignment_mobile: asField("left", "select"),
      text_placement_desktop: asField("center_start", "select"),
      text_placement_mobile: asField("bottom_start", "select"),
      padding_top: asField(0, "range"),
      padding_bottom: asField(16, "range"),
      height_mode: asField("auto", "select"),
    },
    blocks: [],
  },
  featuredCollection: {
    props: {
      heading: asField("Featured Collection"),
      description: asField("Seasonal picks curated for your skincare shelf."),
      item_count: asField(4, "range"),
      item_count_mobile: asField(2, "range"),
      desktop_layout: asField("grid", "select"),
      mobile_layout: asField("horizontal_scroll", "select"),
      collection: asField("", "collection"),
      show_add_to_cart: asField(false, "checkbox"),
      card_cta_text: asField("Add to Cart"),
      show_view_all: asField(true, "checkbox"),
      button_text: asField("View All"),
      button_position: asField("right", "select"),
      max_count: asField(8, "range"),
      img_fill: asField(false, "checkbox"),
      img_container_bg: asField("#F7F7F7", "color"),
      text_alignment: asField("left", "select"),
      img_resize: asField("contain", "select"),
      img_resize_mobile: asField("contain", "select"),
      padding_top: asField(16, "range"),
      padding_bottom: asField(16, "range"),
      mandatory_pincode: asField(false, "checkbox"),
      hide_single_size: asField(false, "checkbox"),
      preselect_size: asField(false, "checkbox"),
    },
  },
  animatedDistortedText: {
    props: {
      line_1: asField("WE DON'T JUST MAKE HERE", "text"),
      line_2: asField("WE ENGINEER PERFORMANCE", "text"),
    },
  },
  imageSlideshow: {
    props: {
      autoplay: asField(true, "checkbox"),
      slide_interval: asField(4, "range"),
      open_in_new_tab: asField(false, "checkbox"),
      padding_top: asField(0, "range"),
      padding_bottom: asField(16, "range"),
      height_mode: asField("auto", "select"),
    },
    blocks: [
      {
        type: "gallery",
        props: {
          image: asField(
            "https://cdn.fynd.com/v2/falling-surf-7c8bb8/fyprod/wrkr/organization/6527750ff1060f72326269df/theme/assets/ff223fc1483415d96e68.jpg?auto=format&fit=crop&w=1920&q=80",
            "image_picker",
          ),
          mobile_image: asField(
            "https://cdn.fynd.com/v2/falling-surf-7c8bb8/fyprod/wrkr/organization/6527750ff1060f72326269df/theme/assets/ff223fc1483415d96e68.jpg?auto=format&fit=crop&w=900&q=80",
            "image_picker",
          ),
          image_text: asField("Glow starts with consistency."),
          button_text: asField("Explore"),
          redirect_link: asField("/collections"),
          text_placement_desktop: asField("center_start", "select"),
          text_alignment_desktop: asField("left", "select"),
          text_placement_mobile: asField("bottom_start", "select"),
          text_alignment_mobile: asField("left", "select"),
          invert_button_color: asField(false, "checkbox"),
        },
      },
      {
        type: "gallery",
        props: {
          image: asField(
            "https://cdn.fynd.com/v2/falling-surf-7c8bb8/fyprod/wrkr/company/10059/applications/68a80b2b10603c4ea596e252/theme/pictures/free/resize-w:700/photo-1573461160327-b450ce3d8e7f.jpeg?dpr=1",
            "image_picker",
          ),
          mobile_image: asField(
            "https://cdn.fynd.com/v2/falling-surf-7c8bb8/fyprod/wrkr/company/10059/applications/68a80b2b10603c4ea596e252/theme/pictures/free/resize-w:700/photo-1573461160327-b450ce3d8e7f.jpeg?dpr=1",
            "image_picker",
          ),
          image_text: asField("Hydration your skin will remember."),
          button_text: asField("Shop Now"),
          redirect_link: asField("/products"),
          text_placement_desktop: asField("bottom_start", "select"),
          text_alignment_desktop: asField("left", "select"),
          text_placement_mobile: asField("bottom_start", "select"),
          text_alignment_mobile: asField("left", "select"),
          invert_button_color: asField(false, "checkbox"),
        },
      },
    ],
  },
  mediaWithText: {
    props: {
      title: asField("Media with Text"),
      description: asField(
        "<p>Thoughtful formulas made for real routines, backed by ingredient transparency.</p>",
        "textarea",
      ),
      button_text: asField("Learn More"),
      banner_link: asField("/about-us", "url"),
      image_desktop: asField(
        "https://cdn.fynd.com/v2/falling-surf-7c8bb8/fyprod/wrkr/organization/6527750ff1060f72326269df/theme/assets/843f105cff6369377148.jpg?auto=format&fit=crop&w=1600&q=80",
        "image_picker",
      ),
      image_mobile: asField(
        "https://cdn.fynd.com/v2/falling-surf-7c8bb8/fyprod/wrkr/organization/6527750ff1060f72326269df/theme/assets/843f105cff6369377148.jpg?auto=format&fit=crop&w=900&q=80",
        "image_picker",
      ),
      align_text_desktop: asField(false, "checkbox"),
      text_alignment: asField("center_start", "select"),
      text_alignment_mobile: asField("left", "select"),
      padding_top: asField(16, "range"),
      padding_bottom: asField(16, "range"),
    },
    blocks: [],
  },
  testimonials: {
    props: {
      title: asField("What Customers Say"),
      autoplay: asField(false, "checkbox"),
      slide_interval: asField(3, "range"),
      padding_top: asField(16, "range"),
      padding_bottom: asField(16, "range"),
    },
    blocks: [
      {
        type: "testimonial",
        props: {
          author_testimonial: asField(
            "The texture is light, the results are visible, and my skin feels calmer in a week.",
          ),
          author_name: asField("Riya S."),
          author_description: asField("Verified Customer"),
          author_image: asField(
            "https://cdn.fynd.com/v2/falling-surf-7c8bb8/fyprod/wrkr/company/10059/applications/68a80b2b10603c4ea596e252/theme/pictures/free/resize-w:700/232.jpeg?auto=format&fit=crop&w=200&q=80",
            "image_picker",
          ),
        },
      },
      {
        type: "testimonial",
        props: {
          author_testimonial: asField(
            "Packaging, fragrance, and finish all feel premium without being harsh on skin.",
          ),
          author_name: asField("Divya M."),
          author_description: asField("Repeat Buyer"),
          author_image: asField(
            "https://cdn.fynd.com/v2/falling-surf-7c8bb8/fyprod/wrkr/company/10059/applications/68a80b2b10603c4ea596e252/theme/pictures/free/resize-w:700/232.jpeg?auto=format&fit=crop&w=200&q=80",
            "image_picker",
          ),
        },
      },
    ],
  },
};

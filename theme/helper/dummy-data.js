const asField = (value, type = "text") => ({ type, value });

export const CART_PAGE_DUMMY_SECTIONS = {
  cartLanding: {
    props: {
      is_limited_stock: asField(true, "checkbox"),
      limited_stock_label: asField("Limited stock", "text"),
    },
    blocks: [
      { type: "coupon", props: {} },
      { type: "loyalty_points", props: {} },
      { type: "comment", props: {} },
      { type: "gst_card", props: {} },
      { type: "price_breakup", props: {} },
      { type: "checkout_buttons", props: {} },
      { type: "share_cart", props: {} },
    ],
  },
};

export const PLP_PAGE_DUMMY_SECTIONS = {
  productListing: {
    props: {
      desktop_banner: asField("", "image_picker"),
      mobile_banner: asField("", "image_picker"),
      banner_link: asField("", "url"),
      product_number: asField(true, "checkbox"),
      loading_options: asField("infinite", "select"),
      page_size: asField(12, "select"),
      back_top: asField(true, "checkbox"),
      in_new_tab: asField(false, "checkbox"),
      hide_brand: asField(false, "checkbox"),
      grid_desktop: asField("4", "select"),
      grid_tablet: asField("2", "select"),
      grid_mob: asField("1", "select"),
      description: asField("", "textarea"),
      img_resize: asField("300", "select"),
      img_resize_mobile: asField("500", "select"),
      show_add_to_cart: asField(true, "checkbox"),
      card_cta_text: asField("Add to Cart", "text"),
      show_size_guide: asField(false, "checkbox"),
      tax_label: asField("Tax included, where applicable", "text"),
      mandatory_pincode: asField(true, "checkbox"),
      hide_single_size: asField(false, "checkbox"),
      preselect_size: asField(false, "checkbox"),
      size_selection_style: asField("block", "radio"),
      filter_toggle_button: asField(false, "checkbox"),
    },
    blocks: [],
  },
};

export const PDP_PAGE_DUMMY_SECTIONS = {
  productDescription: {
    props: {
      product: asField("", "product"),
      zoom_in: asField(false, "checkbox"),
      enable_sticky_images: asField(false, "checkbox"),
      enable_buy_now: asField(false, "checkbox"),
      show_sale_tag: asField(true, "checkbox"),
      product_details_bullets: asField(true, "checkbox"),
      icon_color: asField("#D6D6D6", "color"),
      mandatory_pincode: asField(true, "checkbox"),
      variant_position: asField("accordion", "radio"),
      show_products_breadcrumb: asField(true, "checkbox"),
      show_category_breadcrumb: asField(true, "checkbox"),
      show_brand_breadcrumb: asField(true, "checkbox"),
      first_accordian_open: asField(true, "checkbox"),
      img_resize: asField("700", "select"),
      img_resize_mobile: asField("700", "select"),
      display_mode: asField("carousel", "select"),
    },
    blocks: [
      {
        type: "product_name",
        props: { show_brand: asField(true, "checkbox") },
      },
      {
        type: "product_price",
        props: { mrp_label: asField(true, "checkbox") },
      },
      {
        type: "product_tax_label",
        props: { tax_label: asField("Tax included, where applicable", "text") },
      },
      { type: "product_variants", props: {} },
      {
        type: "size_wrapper",
        props: {
          hide_single_size: asField(false, "checkbox"),
          size_selection_style: asField("dropdown", "radio"),
        },
      },
      { type: "pincode", props: { show_logo: asField(false, "checkbox") } },
      { type: "product_description", props: {} },
    ],
  },
};

export const COLLECTION_PAGE_DUMMY_SECTIONS = {
  collectionListing: {
    props: {
      collection: asField("", "collection"),
      desktop_banner: asField("", "image_picker"),
      mobile_banner: asField("", "image_picker"),
      button_link: asField("", "url"),
      product_number: asField(true, "checkbox"),
      loading_options: asField("pagination", "select"),
      page_size: asField(12, "select"),
      back_top: asField(true, "checkbox"),
      in_new_tab: asField(false, "checkbox"),
      hide_brand: asField(false, "checkbox"),
      grid_desktop: asField("4", "select"),
      grid_tablet: asField("3", "select"),
      grid_mob: asField("1", "select"),
      img_resize: asField("300", "select"),
      img_resize_mobile: asField("500", "select"),
      show_add_to_cart: asField(true, "checkbox"),
      card_cta_text: asField("Add to Cart", "text"),
      show_size_guide: asField(true, "checkbox"),
      tax_label: asField("Tax included, where applicable", "text"),
      mandatory_pincode: asField(true, "checkbox"),
      hide_single_size: asField(false, "checkbox"),
      preselect_size: asField(true, "checkbox"),
      size_selection_style: asField("dropdown", "radio"),
    },
    blocks: [],
  },
};

export const BRANDS_PAGE_DUMMY_SECTIONS = {
  brandsLanding: {
    props: {
      infinite_scroll: asField(true, "checkbox"),
      back_top: asField(true, "checkbox"),
      logo_only: asField(false, "checkbox"),
      img_fill: asField(true, "checkbox"),
      title: asField("", "text"),
      description: asField("", "textarea"),
    },
    blocks: [],
  },
};

export const COLLECTIONS_PAGE_DUMMY_SECTIONS = {
  collections: {
    props: {
      title: asField("Collections", "text"),
      description: asField(
        "Discover our curated collections featuring the latest trends and must-have items.",
        "textarea",
      ),
      back_top: asField(true, "checkbox"),
      img_fill: asField(true, "checkbox"),
    },
    blocks: [],
  },
};

export const HOME_PAGE_DUMMY_SECTIONS = {
  heroImage: {
    props: {
      heading: asField("Where Daily Rituals Bloom"),
      description: asField(
        "Clean ingredients, visible results, and mindful skincare for everyday use.",
      ),
      button_text: asField("Shop Bestsellers"),
      button_link: asField("/collections"),
      desktop_banner: asField(
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1920&q=80",
        "image_picker",
      ),
      mobile_banner: asField(
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
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
            "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1920&q=80",
            "image_picker",
          ),
          mobile_image: asField(
            "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
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
            "https://images.unsplash.com/photo-1573461160327-b450ce3d8e7f?auto=format&fit=crop&w=1920&q=80",
            "image_picker",
          ),
          mobile_image: asField(
            "https://images.unsplash.com/photo-1573461160327-b450ce3d8e7f?auto=format&fit=crop&w=900&q=80",
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
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1600&q=80",
        "image_picker",
      ),
      image_mobile: asField(
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
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
            "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80",
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
          author_name: asField("Akshay M."),
          author_description: asField("Repeat Buyer"),
          author_image: asField(
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
            "image_picker",
          ),
        },
      },
    ],
  },
};

const externalAction = (url) => ({
  page: {
    type: "external",
    query: {
      url: [url],
    },
  },
});

// Helper function for internal client-side routing actions
const internalAction = (type, url = null) => {
  if (url) {
    return {
      page: {
        type: "page",
        query: {
          url: [url],
        },
      },
    };
  }
  return {
    page: {
      type: type,
    },
  };
};

export const DUMMY_HEADER_NAVIGATION = [
  {
    active: true,
    display: "Home",
    action: internalAction("home"),
    sub_navigation: [],
  },
  {
    active: true,
    display: "Brands",
    action: internalAction("brands"),
    sub_navigation: [],
  },
  {
    active: true,
    display: "Collections",
    action: internalAction("collections"),
    sub_navigation: [],
  },
  {
    active: true,
    display: "Categories",
    action: internalAction("categories"),
    sub_navigation: [],
  },
  {
    active: true,
    display: "Shop All",
    action: internalAction("products"),
    sub_navigation: [],
  },
];

export const DUMMY_FOOTER_NAVIGATION = [
  {
    active: true,
    display: "Company",
    action: externalAction("/about-us"),
    sub_navigation: [
      {
        active: true,
        display: "About Us",
        action: externalAction("/about-us"),
      },
      {
        active: true,
        display: "Contact Us",
        action: externalAction("/contact-us"),
      },
    ],
  },
  {
    active: true,
    display: "Support",
    action: externalAction("/faq"),
    sub_navigation: [
      { active: true, display: "FAQs", action: externalAction("/faq") },
      {
        active: true,
        display: "Shipping Policy",
        action: externalAction("/shipping-policy"),
      },
      {
        active: true,
        display: "Return Policy",
        action: externalAction("/return-policy"),
      },
    ],
  },
];

export const DUMMY_APP_INFO = {
  logo: { secure_url: "" },
  mobile_logo: { secure_url: "" },
};

export const DUMMY_CONTACT_INFO = {
  social_links: {
    instagram: { link: "https://instagram.com", title: "Instagram" },
    facebook: { link: "https://facebook.com", title: "Facebook" },
    youtube: { link: "https://youtube.com", title: "YouTube" },
  },
  copyright_text: "Copyright 2026 Bloom. All rights reserved.",
};

export const DUMMY_SUPPORT_INFO = {
  contact: {
    email: {
      active: true,
      email: [{ key: "Email", value: "support@example.com" }],
    },
    phone: {
      active: true,
      phone: [{ key: "Call Us", code: "1", number: "8001234567" }],
    },
  },
};

// ——— Page dummy sections (for refactored pages) ———

export const CATEGORIES_PAGE_DUMMY_SECTIONS = {
  categories: {
    props: {
      heading: asField("Categories", "text"),
      description: asField("Browse our product categories.", "textarea"),
      back_top: asField(true, "checkbox"),
      show_category_name: asField(true, "checkbox"),
      category_name_placement: asField("inside", "select"),
      category_name_position: asField("bottom", "select"),
      category_name_text_alignment: asField("text-center", "select"),
    },
    blocks: [],
  },
};

export const ABOUT_US_PAGE_DUMMY_SECTIONS = {
  rawHtml: {
    props: {
      code: asField("<h2>About Us</h2><p>Welcome to our store.</p>", "code"),
      padding_top: asField(16, "range"),
      padding_bottom: asField(16, "range"),
    },
    blocks: [],
  },
};

export const CONTACT_US_PAGE_DUMMY_SECTIONS = {
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

export const LOCATE_US_PAGE_DUMMY_SECTIONS = {
  storeLocator: {
    props: {
      section_title: asField("Find a Store Near You", "text"),
    },
    blocks: [],
  },
};

export const BLOG_PAGE_DUMMY_SECTIONS = {
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

export const BLOG_DETAIL_PAGE_DUMMY_SECTIONS = {
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

export const FAQ_PAGE_DUMMY_SECTIONS = {
  faq: {
    props: {},
    blocks: [],
  },
};

export const WISHLIST_PAGE_DUMMY_SECTIONS = {
  profileWishlist: {
    props: { title: asField("My Wishlist", "text") },
    blocks: [],
  },
  profileNavigationMenu: {
    props: {},
    blocks: [],
  },
};

export const POLICY_PAGE_DUMMY_SECTIONS = {
  privacyPolicy: {
    props: {},
    blocks: [],
  },
};

export const SHIPPING_POLICY_PAGE_DUMMY_SECTIONS = {
  shippingPolicy: {
    props: {},
    blocks: [],
  },
};

export const RETURN_POLICY_PAGE_DUMMY_SECTIONS = {
  returnPolicy: {
    props: {},
    blocks: [],
  },
};

export const TNC_PAGE_DUMMY_SECTIONS = {
  tnc: {
    props: {},
    blocks: [],
  },
};

export const LOGIN_PAGE_DUMMY_SECTIONS = {
  login: {
    props: {
      image_layout: asField("no_banner", "select"),
      image_banner: asField("", "image_picker"),
    },
    blocks: [],
  },
};

export const REGISTER_PAGE_DUMMY_SECTIONS = {
  register: {
    props: {
      image_layout: asField("no_banner", "select"),
      image_banner: asField("", "image_picker"),
    },
    blocks: [],
  },
};

export const FORGOT_PASSWORD_PAGE_DUMMY_SECTIONS = {
  forgotPassword: {
    props: {
      image_layout: asField("no_banner", "select"),
      image_banner: asField("", "image_picker"),
    },
    blocks: [],
  },
};

export const SET_PASSWORD_PAGE_DUMMY_SECTIONS = {
  setPassword: {
    props: {
      image_layout: asField("no_banner", "select"),
      image_banner: asField("", "image_picker"),
    },
    blocks: [],
  },
};

export const ACCOUNT_LOCKED_PAGE_DUMMY_SECTIONS = {
  accountLocked: {
    props: {
      image_layout: asField("no_banner", "select"),
      image_banner: asField("", "image_picker"),
    },
    blocks: [],
  },
};

export const EDIT_PROFILE_PAGE_DUMMY_SECTIONS = {
  editProfile: {
    props: {
      image_layout: asField("no_banner", "select"),
      image_banner: asField("", "image_picker"),
    },
    blocks: [],
  },
};

export const VERIFY_EMAIL_PAGE_DUMMY_SECTIONS = {
  verifyEmail: {
    props: {},
    blocks: [],
  },
};

export const VERIFY_EMAIL_LINK_PAGE_DUMMY_SECTIONS = {
  verifyEmailLink: {
    props: {},
    blocks: [],
  },
};

export const PROFILE_DETAILS_PAGE_DUMMY_SECTIONS = {
  profileDetailsForm: {
    props: { title: asField("Profile Details", "text") },
    blocks: [],
  },
  profileNavigationMenu: {
    props: {},
    blocks: [],
  },
};

export const PROFILE_ADDRESS_PAGE_DUMMY_SECTIONS = {
  profileAddress: {
    props: { title: asField("My Addresses", "text") },
    blocks: [],
  },
  profileNavigationMenu: {
    props: {},
    blocks: [],
  },
};

export const PROFILE_EMAIL_PAGE_DUMMY_SECTIONS = {
  profileEmail: {
    props: { title: asField("Email Address", "text") },
    blocks: [],
  },
  profileNavigationMenu: {
    props: {},
    blocks: [],
  },
};

export const PROFILE_PHONE_PAGE_DUMMY_SECTIONS = {
  profilePhone: {
    props: { title: asField("Phone Number", "text") },
    blocks: [],
  },
  profileNavigationMenu: {
    props: {},
    blocks: [],
  },
};

export const ORDERS_LIST_PAGE_DUMMY_SECTIONS = {
  profileOrders: {
    props: {
      title: asField("My Orders", "text"),
      show_empty_state: asField(true, "checkbox"),
    },
    blocks: [],
  },
  profileNavigationMenu: {
    props: {},
    blocks: [],
  },
};

export const ORDER_STATUS_PAGE_DUMMY_SECTIONS = {
  header: { props: {}, blocks: [] },
  leftPanel: { props: {}, blocks: [] },
  rightPanel: { props: {}, blocks: [] },
};

export const ORDER_TRACKING_PAGE_DUMMY_SECTIONS = {
  orderTracking: {
    props: {},
    blocks: [],
  },
};

export const ORDER_TRACKING_DETAILS_PAGE_DUMMY_SECTIONS = {
  orderTrackingDetails: {
    props: {},
    blocks: [],
  },
};

export const SINGLE_PAGE_CHECKOUT_PAGE_DUMMY_SECTIONS = {
  leftPanel: { props: {}, blocks: [] },
  rightPanel: { props: {}, blocks: [] },
};

export const NOT_FOUND_PAGE_DUMMY_SECTIONS = {
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

/** Right panel sections for profile page (ProfileRoot). Same shape as page.sections filter. */
export const PROFILE_PAGE_RIGHT_SECTIONS = [
  {
    canvas: { value: "Profile", label: "Profile Panel" },
    attributes: { page: "profile" },
    blocks: [
      {
        type: "profile-navigation-menu",
        name: "Profile Navigation Menu",
        props: [],
      },
    ],
    default: true,
  },
];

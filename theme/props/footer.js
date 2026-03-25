import { externalAction } from "./utils";

export const FOOTER_NAVIGATION = [
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


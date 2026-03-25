import { internalAction } from "./utils";

export const HEADER_NAVIGATION = [
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


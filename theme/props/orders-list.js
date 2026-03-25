import { asField } from "./utils";

export const ORDERS_LIST_PAGE_SECTIONS = {
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


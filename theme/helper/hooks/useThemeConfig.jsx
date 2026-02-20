import { useGlobalStore } from "fdk-core/utils";
import settingsData from "../../config/settings_data.json";

const DEFAULT_GLOBAL_CONFIG = {
  font_header: {},
  font_body: {},
  section_margin_bottom: 0,
  image_border_radius: 0,
  badge_border_radius: 24,
  button_border_radius: 0,
  enable_page_max_width: false,
  sticky_header: true,
  transparent_header: false,
};

const DEFAULT_PALETTE = {
  theme: { theme_accent: "#ABC9F6" },
  button: { button_primary: "#0E0E0E", button_link: "#0E0E0E" },
};

const getThemeMode = (themeData) => {
  const localList = settingsData?.list || [];
  const localCurrent = settingsData?.current;
  const localMode =
    localList.find((item) => item?.name === localCurrent) || localList?.[0] || {};

  if (!themeData?.config?.list?.length) {
    return localMode;
  }

  return (
    themeData.config.list.find((item) => item?.name === themeData?.config?.current) ||
    themeData.config.list[0] ||
    localMode
  );
};

export const useThemeConfig = ({ fpi, page = "" }) => {
  // Handle case when fpi or fpi.getters is undefined
  if (!fpi || !fpi.getters) {
    return {
      globalConfig: DEFAULT_GLOBAL_CONFIG,
      pageConfig: {},
      pallete: DEFAULT_PALETTE,
      listingPrice: "range",
    };
  }

  const { app_features } = useGlobalStore(fpi.getters.CONFIGURATION) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);
  const mode = getThemeMode(THEME);
  const globalConfig = {
    ...DEFAULT_GLOBAL_CONFIG,
    ...(mode?.global_config?.custom?.props || {}),
  };
  const { general_setting, advance_setting } =
    mode?.global_config?.static?.props?.palette || {};
  const palette = {
    ...DEFAULT_PALETTE,
    ...(general_setting || {}),
    ...(advance_setting || {}),
  };

  if (page) {
    const pageConfig =
      mode?.page?.find((f) => f.page === page)?.settings?.props || {};
    return {
      globalConfig,
      pageConfig,
      pallete: palette,
      listingPrice: app_features?.common?.listing_price?.value || "range",
    };
  }

  return {
    globalConfig,
    pallete: palette,
    listingPrice: app_features?.common?.listing_price?.value || "range",
  };
};

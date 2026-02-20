import React, { useEffect, useMemo } from "react";
import { Outlet, useLocation, useMatches } from "react-router-dom";
import { useFPI } from "fdk-core/utils";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";
import { pageDataResolver } from "../helper/lib";
import { ThemeProvider } from "../providers/global-provider";

export default function RootLayout() {
  const fpi = useFPI();
  const matches = useMatches();
  const location = useLocation();
  const currentMatch = matches.at(-1);

  const themeId = useMemo(() => {
    if (!fpi?.store || !fpi?.getters?.THEME) {
      const queryThemeId = new URLSearchParams(location.search).get("themeId");
      if (queryThemeId) return queryThemeId;
      if (typeof window !== "undefined") {
        return (
          window.APP_DATA?.themeId ||
          window.APP_DATA?.theme_id ||
          window.__APP_CREDENTIALS__?.themeId ||
          null
        );
      }
      return null;
    }
    const state = fpi.store.getState();
    const theme = fpi.getters.THEME(state) || {};
    const queryThemeId = new URLSearchParams(location.search).get("themeId");

    return (
      theme._id ||
      theme.id ||
      theme.uid ||
      theme.theme_id ||
      queryThemeId ||
      (typeof window !== "undefined" &&
        (window.APP_DATA?.themeId ||
          window.APP_DATA?.theme_id ||
          window.__APP_CREDENTIALS__?.themeId)) ||
      null
    );
  }, [fpi, location.search]);

  useEffect(() => {
    if (!fpi || !currentMatch) {
      return;
    }

    const filterQuery = Object.fromEntries(
      new URLSearchParams(location.search).entries(),
    );

    pageDataResolver({
      fpi,
      themeId,
      router: {
        ...currentMatch,
        route: {
          handle: currentMatch.handle || {},
        },
        filterQuery,
      },
    });
  }, [currentMatch, fpi, location.search, themeId]);

  return (
    <ThemeProvider>
      <div className="fdk-theme-header">
        <Header fpi={fpi} />
      </div>
      <main className="fdk-theme-outlet">
        <Outlet />
      </main>
      <div className="fdk-theme-footer">
        <Footer fpi={fpi} />
      </div>
    </ThemeProvider>
  );
}

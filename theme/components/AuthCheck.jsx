import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function AuthCheck({ Component, fpi }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAllowed, setIsAllowed] = useState(() => !Component?.authGuard);

  const loginPath = useMemo(() => {
    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    return `/auth/login?redirectUrl=${encodeURIComponent(currentPath)}`;
  }, [location.hash, location.pathname, location.search]);
  const shouldRedirectToLogin = !location.pathname.startsWith("/auth/");

  useEffect(() => {
    let cancelled = false;

    const runAuthGuard = async () => {
      if (!Component?.authGuard) {
        setIsAllowed(true);
        return;
      }

      setIsAllowed(false);

      try {
        const store = fpi?.store?.getState?.();
        const allowed = await Component.authGuard({ fpi, store });

        if (cancelled) return;

        if (allowed) {
          setIsAllowed(true);
          return;
        }

        if (shouldRedirectToLogin) {
          navigate(loginPath, { replace: true });
        }
      } catch (error) {
        if (cancelled) return;
        if (shouldRedirectToLogin) {
          navigate(loginPath, { replace: true });
        }
      }
    };

    runAuthGuard();

    return () => {
      cancelled = true;
    };
  }, [Component, fpi, loginPath, navigate, shouldRedirectToLogin]);

  if (!isAllowed) {
    return null;
  }

  return <Component fpi={fpi} />;
}

export default AuthCheck;

import { useGlobalStore } from "fdk-core/utils";
import { useRef, useState, useEffect } from "react";
import Snackbar from "awesome-snackbar";
import { marked } from "marked";
import { isRunningOnClient } from "../utils";
import { sanitizeHtml } from "../security/sanitize-html";

export function useLoggedInUser(fpi) {
  return {
    userData: useGlobalStore(fpi.getters.USER_DATA),
    loggedIn: useGlobalStore(fpi.getters.LOGGED_IN),
    userFetch: useGlobalStore(fpi.getters.USER_FETCHED),
  };
}

const getBgColor = (type) => {
  if (type === "success") {
    return "var(--successBackground)";
  }
  if (type === "error") {
    return "var(--errorBackground)";
  }
  return "var(--informationBackground)";
};

const getColor = (type) => {
  if (type === "success") {
    return "var(--successText)";
  }
  if (type === "error") {
    return "var(--errorText)";
  }
  return "var(--informationText)";
};

const getSnackbarDuration = (message = "") => {
  const baseTime = 1500;
  const threshold = 30; // Characters after which extra time is added
  const extraTimePerChar = baseTime / threshold;

  const extraTime = Math.max(
    0,
    ((message?.length || 0) - threshold) * extraTimePerChar,
  );

  return baseTime + extraTime;
};

function getSnackbarPosition(currentPosition) {
  const directionMap = {
    "top-left": "top-right",
    "top-center": "top-center",
    "top-right": "top-left",
    "bottom-left": "bottom-right",
    "bottom-center": "bottom-center",
    "bottom-right": "bottom-left",
  };
  let newPosition = currentPosition;
  if (isRunningOnClient()) {
    const direction = document.dir;
    if (direction === "rtl") {
      newPosition = directionMap[currentPosition];
    }
  }
  return newPosition;
}

export const useSnackbar = () => {
  const snackbarRef = useRef(null);

  const showSnackbar = (message, type, position = "top-right") => {
    // Dismiss the current snackbar if it exists
    if (snackbarRef?.current) {
      snackbarRef.current.hide();
    }
    const directivePosition = getSnackbarPosition(position);
    // Create a new snackbar and store it in the ref
    snackbarRef.current = new Snackbar(`${message}`, {
      position: directivePosition,
      style: {
        container: [
          ["background-color", getBgColor(type)],
          ["word-wrap", "break-word"],
        ],
        message: [
          ["color", getColor(type)],
          ["white-space", "normal"], // Ensure text wraps properly
          ["word-break", "break-word"],
        ],
        bold: [["font-weight", "bold"]],
        actionButton: [["color", "white"]],
      },
    });

    const id = setTimeout(() => {
      snackbarRef.current.hide();
      clearTimeout(id);
    }, getSnackbarDuration(message));
  };

  return { showSnackbar };
};

// SECURITY (report FND-16): the previous YouTube shortcode handler accepted
// any character in the captured id, so a value like `abc"></iframe><script>x`
// broke out of the iframe src attribute and injected arbitrary HTML.
// Validate the YouTube id strictly before substitution.
const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{6,15}$/;

export const useRichText = (htmlContent) => {
  const preprocessMarkdown = (markdown) => {
    return markdown
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.*?)__/g, "<strong>$1</strong>")
      .replace(/\+\+(.*?)\+\+/g, "<u>$1</u>")
      .replace(/==(.*?)==/g, "<mark>$1</mark>")
      .replace(/~~(.*?)~~/g, "<del>$1</del>")
      .replace(/\^\^([^^]+)\^\^/g, "<sup>$1</sup>")
      .replace(/,,(.*?),,/g, "<sub>$1</sub>")
      .replace(/{{youtube:(.*?)}}/g, (match, p1) => {
        if (!YOUTUBE_ID_RE.test(p1)) return "";
        return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${p1}" frameborder="0" allowfullscreen></iframe>`;
      });
  };

  const renderMarkdown = (content = "") => {
    if (!content) return "";
    const processedContent = preprocessMarkdown(content);
    const markedContent = marked(processedContent);
    // SECURITY (report FND-05): always sanitize, including on the SSR path.
    // Previously this short-circuited `if (!isRunningOnClient()) return marked`
    // which let an unsanitized payload reach SSR HTML if SSR were ever
    // enabled. iframes are allowed only for trusted media hosts (enforced
    // inside sanitizeHtml).
    return sanitizeHtml(markedContent, { allowIframes: true });
  };

  const [clientMarkedContent, setClientMarkedContent] = useState(() =>
    renderMarkdown(htmlContent),
  );

  useEffect(() => {
    setClientMarkedContent(renderMarkdown(htmlContent));
  }, [htmlContent]);

  return clientMarkedContent;
};

export const useSliderDotsWidth = (sliderRef, departmentCategories) => {
  const [dotsWidth, setDotsWidth] = useState(0);

  useEffect(() => {
    const updateDotsWidth = () => {
      if (sliderRef.current) {
        const slickDots = sliderRef.current.querySelector(".slick-dots");
        if (slickDots) {
          const { width } = slickDots.getBoundingClientRect();
          setDotsWidth(width);
        }
      }
    };
    setTimeout(() => {
      updateDotsWidth();
    }, 100);
    window.addEventListener("resize", updateDotsWidth);

    return () => {
      window.removeEventListener("resize", updateDotsWidth);
    };
  }, [sliderRef.current, departmentCategories]);

  return dotsWidth;
};

export const useViewport = (minBreakpoint = 0, maxBreakpoint = Infinity) => {
  const [isInRange, setIsInRange] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        const width = window?.innerWidth;
        setIsInRange(width >= minBreakpoint && width <= maxBreakpoint);
      }
    };

    handleResize();

    window?.addEventListener("resize", handleResize);
    return () => {
      window?.removeEventListener("resize", handleResize);
    };
  }, [minBreakpoint, maxBreakpoint]);

  return isInRange;
};

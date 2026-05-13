import React, { useCallback, useEffect, useState } from "react";
import parse from "html-react-parser";
import { isRunningOnClient } from "../../../helper/utils";
import { sanitizeHtml } from "../../../helper/security/sanitize-html";

// SECURITY (report FND-05): html-react-parser parses raw HTML into React
// elements. Even though it does not execute <script>, attribute-based vectors
// like <img onerror>, <svg onload>, and `href="javascript:..."` survive
// without sanitization. We sanitize first, then parse.
const FyHTMLRenderer = ({ htmlContent, customClass, showDots = false }) => {
  const [newContent, setNewContent] = useState(htmlContent);
  useEffect(() => {
    if (htmlContent && showDots) {
      setNewContent(String(htmlContent).concat("..."));
    }
  }, [htmlContent, showDots]);
  return (
    <div className={customClass}>
      {isRunningOnClient() ? parse(sanitizeHtml(newContent)) : null}
    </div>
  );
};

export default FyHTMLRenderer;

import React from "react";
import { sanitizeHtml } from "../../../helper/security/sanitize-html";

// SECURITY (report FND-05): generic HTML sink used across pages. Always
// pipe `content` through DOMPurify before reaching dangerouslySetInnerHTML.
export const HTMLContent = React.forwardRef(({ content }, ref) => (
  <>
    {/* eslint-disable-next-line react/no-danger */}
    <div
      data-testid="html-content"
      ref={ref}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
    />
  </>
));

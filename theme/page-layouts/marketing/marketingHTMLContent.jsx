import React from "react";
import { sanitizeHtml } from "../../helper/security/sanitize-html";

// SECURITY (report FND-05): the previous `stripScripts` helper only removed
// <script> elements via innerHTML parsing — it left <img onerror>,
// <svg onload>, <iframe src="javascript:...">, and `<a href="javascript:">`
// fully intact. Pipe through DOMPurify instead.
export const HTMLContent = React.forwardRef(({ content }, ref) => (
  <div
    ref={ref}
    data-testid="html-content"
    suppressHydrationWarning
    dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
  />
));

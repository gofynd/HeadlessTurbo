import React from "react";
import { sanitizeHtml } from "../../helper/security/sanitize-html";

// SECURITY (report FND-05): CMS marketing pages stripped <style> blocks but
// kept the rest of the HTML unsanitized. Pipe through DOMPurify; <style> is
// also forbidden by the sanitizer so we no longer need a manual extraction.
export const HTMLContent = React.forwardRef(({ content, className }, ref) => {
  const originalContent = typeof content === "string" ? content : "";

  // Preserve previous UX: when the CMS author writes plain text without HTML
  // tags, convert newlines to <br/> before sanitizing so paragraphs render.
  const hasHTMLTags =
    /<\/?(div|p|ul|li|table|h\d|br|span|section|article)[^>]*>/i.test(
      originalContent,
    );
  const normalized = hasHTMLTags
    ? originalContent
    : originalContent.replace(/\n/g, "<br />");

  return (
    <div ref={ref} className="cms-html-wrapper">
      <div
        data-testid="html-content"
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(normalized) }}
      />
    </div>
  );
});

import React from "react";
import { sanitizeHtml } from "../helper/security/sanitize-html";

// SECURITY (report FND-02): the previous implementation regex-extracted every
// <script>, <link>, and external <script src> from CMS-supplied HTML and
// re-injected them as live DOM nodes on the storefront origin. Any CMS author
// (or attacker compromising an upstream CMS) could ship arbitrary JavaScript to
// every shopper. The fix is to pipe content through DOMPurify and never invoke
// CMS-supplied <script>. If embeds are required, host the embed on a separate
// origin and load it via <iframe sandbox> from a vetted Fynd section.

export function Component({ props }) {
  const { code, padding_top, padding_bottom } = props;

  const originalContent = typeof code?.value === "string" ? code.value : "";

  // Allow iframes here so the raw-html section can still embed trusted video
  // hosts (YouTube/Vimeo). All <script>, <object>, <embed>, <form>, <style>,
  // inline event handlers, and javascript: URLs are stripped by sanitizeHtml.
  const safeHtml = sanitizeHtml(originalContent, { allowIframes: true });

  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 16}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
  };

  if (!code?.value) return null;

  return (
    <section className="basePageContainer margin0auto" style={dynamicStyles}>
      <div
        data-testid="html-content"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </section>
  );
}

export const settings = {
  label: "t:resource.sections.raw_html.custom_html",
  props: [
    {
      id: "code",
      label: "t:resource.sections.raw_html.your_code_here",
      type: "code",
      default: "",
      info: "t:resource.sections.raw_html.custom_html_code_editor",
    },
    {
      type: "range",
      id: "padding_top",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "Top padding",
      default: 16,
      info: "Top padding for section",
    },
    {
      type: "range",
      id: "padding_bottom",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "Bottom padding",
      default: 16,
      info: "Bottom padding for section",
    },
  ],
  blocks: [],
};

export default Component;

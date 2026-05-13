import React from "react";
import { Link } from "react-router-dom";
import sectionsMap from "../sections";
import { convertActionToUrl } from "./utils";
import { safeUrl } from "../helper/security/sanitize-html";

function isExternalUrl(url) {
  return /^(https?:)?\/\//i.test(url) || /^mailto:|^tel:/i.test(url);
}

function getSectionComponent(section) {
  if (!section?.name) {
    return null;
  }
  const sectionEntry = sectionsMap?.[section.name];
  if (!sectionEntry) {
    return null;
  }
  return sectionEntry.Component || sectionEntry.default || sectionEntry;
}

export function FDKLink({
  to,
  link,
  action,
  href,
  target,
  rel,
  children,
  ...rest
}) {
  const resolvedTo = to || link || href || convertActionToUrl(action) || "#";

  // SECURITY (report FND-10): central wrapper for every link in the theme.
  // Validate the URL via safeUrl (rejects javascript:/data:/backslash bypass)
  // and force rel="noopener noreferrer" on every _blank link so window.opener
  // tab-nabbing is impossible regardless of host.
  if (isExternalUrl(resolvedTo) || target === "_blank") {
    const safeHref = safeUrl(resolvedTo);
    const finalRel = target === "_blank"
      ? `noopener noreferrer${rel ? ` ${rel}` : ""}`.trim()
      : rel;
    return (
      <a
        href={safeHref}
        target={target}
        rel={finalRel}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={safeUrl(resolvedTo)} target={target} rel={rel} {...rest}>
      {children}
    </Link>
  );
}

export function BlockRenderer({
  block,
  globalConfig,
  fpi,
  pageConfig,
  blocks = [],
  preset,
}) {
  if (!block) {
    return null;
  }

  const sectionLike = {
    id: block.id,
    name: block.type || block.name,
    props: block.props || {},
    blocks: block.blocks || blocks,
    preset: block.preset || preset,
  };

  const Component = getSectionComponent(sectionLike);
  if (!Component) {
    return null;
  }

  return (
    <Component
      id={sectionLike.id}
      props={sectionLike.props}
      blocks={sectionLike.blocks}
      preset={sectionLike.preset}
      globalConfig={globalConfig}
      pageConfig={pageConfig}
      fpi={fpi}
    />
  );
}

export function SectionRenderer({
  sections = [],
  globalConfig,
  pageConfig,
  fpi,
  customClass = "",
  customProps,
}) {
  if (!Array.isArray(sections)) {
    return null;
  }

  return (
    <div className={customClass}>
      {sections.map((section, idx) => {
        const Component = getSectionComponent(section);
        if (!Component) {
          return null;
        }

        return (
          <Component
            key={section.id || `${section.name}-${idx}`}
            id={section.id}
            props={section.props || {}}
            blocks={section.blocks || []}
            preset={section.preset}
            globalConfig={globalConfig}
            pageConfig={pageConfig}
            fpi={fpi}
            customProps={customProps}
          />
        );
      })}
    </div>
  );
}

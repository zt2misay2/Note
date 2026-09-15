function normalizePathname(pathname) {
  let normalized = pathname.replace(/index\.html$/, "");
  if (!normalized.endsWith("/")) {
    normalized += "/";
  }
  return normalized;
}

function toAbsoluteUrl(href) {
  return new URL(href, window.location.href);
}

function createNavList(items, currentPath) {
  const list = document.createElement("ul");
  list.className = "md-nav__list";
  list.setAttribute("data-md-scrollfix", "");

  for (const item of items) {
    const li = document.createElement("li");
    li.className = "md-nav__item";

    const link = document.createElement("a");
    link.className = "md-nav__link";
    link.href = item.href;

    if (normalizePathname(toAbsoluteUrl(item.href).pathname) === currentPath) {
      li.classList.add("md-nav__item--active");
      link.classList.add("md-nav__link--active");
    }

    const span = document.createElement("span");
    span.className = "md-ellipsis";
    span.textContent = item.text;
    link.appendChild(span);

    li.appendChild(link);
    list.appendChild(li);
  }

  return list;
}

async function hydrateSidebarFromSectionIndex() {
  const currentPath = normalizePathname(window.location.pathname);
  const primaryNav = document.querySelector(".md-nav--primary");
  const article = document.querySelector(".md-content article");

  if (!primaryNav || !article) {
    return;
  }

  if (primaryNav.querySelector(`a[href="${window.location.pathname}"], a[href="${window.location.pathname.replace(/\/$/, "")}"]`)) {
    return;
  }

  const pathParts = currentPath.split("/").filter(Boolean);
  if (pathParts.length < 3) {
    return;
  }

  const sectionIndexUrl = new URL("../", window.location.href);

  try {
    const response = await fetch(sectionIndexUrl);
    if (!response.ok) {
      return;
    }

    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const content = parsed.querySelector(".md-content article");
    if (!content) {
      return;
    }

    const items = [];
    for (const link of content.querySelectorAll('a[href]:not(.headerlink)')) {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) {
        continue;
      }

      const absolute = new URL(href, sectionIndexUrl);
      if (normalizePathname(absolute.pathname).startsWith(normalizePathname(sectionIndexUrl.pathname)) &&
          normalizePathname(absolute.pathname) !== normalizePathname(sectionIndexUrl.pathname)) {
        items.push({
          href: absolute.pathname,
          text: link.textContent.trim()
        });
      }
    }

    const deduped = [];
    const seen = new Set();
    for (const item of items) {
      if (!item.text || seen.has(item.href)) {
        continue;
      }
      seen.add(item.href);
      deduped.push(item);
    }

    if (!deduped.length) {
      return;
    }

    const parentLink = primaryNav.querySelector(`a[href="${sectionIndexUrl.pathname}"], a[href="${sectionIndexUrl.pathname.replace(/\/$/, "")}"]`);
    if (!parentLink) {
      return;
    }

    let parentItem = parentLink.closest(".md-nav__item");
    if (!parentItem) {
      return;
    }

    parentItem.classList.add("md-nav__item--active", "md-nav__item--section", "md-nav__item--nested");

    const existingNestedNav = parentItem.querySelector(":scope > nav.md-nav");
    if (existingNestedNav && existingNestedNav.querySelector(".codex-generated-nav")) {
      existingNestedNav.remove();
    }

    const nestedNav = document.createElement("nav");
    nestedNav.className = "md-nav codex-generated-nav";
    nestedNav.setAttribute("data-md-level", "2");
    nestedNav.setAttribute("aria-expanded", "true");
    nestedNav.appendChild(createNavList(deduped, currentPath));

    parentItem.appendChild(nestedNav);
  } catch {
    // Ignore fetch/parse failures and leave default sidebar as-is.
  }
}

document$.subscribe(() => {
  hydrateSidebarFromSectionIndex();
});

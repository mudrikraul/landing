export function initScrollSpy(): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-menu-link]"));
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-section][id]"));

  if (links.length === 0 || sections.length === 0) {
    return;
  }

  const setActiveLink = (sectionId: string): void => {
    const currentHref = `#${sectionId}`;
    links.forEach((link) => link.classList.toggle("is-active", link.hash === currentHref));
  };

  document.addEventListener("vertical-scroll:active", (event) => {
    const sectionId = event instanceof CustomEvent && typeof event.detail?.id === "string"
      ? event.detail.id
      : "";

    if (sectionId) {
      setActiveLink(sectionId);
    }
  });

  if (!("IntersectionObserver" in window)) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

    if (!visible) {
      return;
    }

    setActiveLink(visible.target.id);
  }, { threshold: [0.25, 0.5, 0.75] });

  sections.forEach((section) => observer.observe(section));
}

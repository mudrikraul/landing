const DESKTOP_QUERY = "(min-width: 1025px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const TRANSITION_MS = 760;
const WHEEL_THRESHOLD = 8;
const EDGE_TOLERANCE = 12;
const KEY_SCROLL_STEP_RATIO = 0.72;

const NEXT_KEYS = new Set(["ArrowDown", "PageDown"]);
const PREVIOUS_KEYS = new Set(["ArrowUp", "PageUp"]);

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function hasOpenDialog(): boolean {
  return document.querySelector("dialog[open]") !== null;
}

function hasEditableFocus(): boolean {
  const activeElement = document.activeElement;

  if (!(activeElement instanceof HTMLElement)) {
    return false;
  }

  return activeElement.matches("input, textarea, select, [contenteditable='true']");
}

function getAnchorFromEvent(event: MouseEvent): HTMLAnchorElement | null {
  const target = event.target;

  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest<HTMLAnchorElement>('a[href^="#"]');
}

export function initVerticalScroll(): void {
  const desktopMedia = window.matchMedia(DESKTOP_QUERY);
  const reducedMotionMedia = window.matchMedia(REDUCED_MOTION_QUERY);
  let isEnabled = false;
  let isTransitioning = false;
  let sections: HTMLElement[] = [];
  let activeIndex = 0;
  let activeId = "";
  let releaseTimer = 0;
  let animationFrame = 0;

  const canEnable = (): boolean => desktopMedia.matches && !reducedMotionMedia.matches;
  const canIntercept = (): boolean => isEnabled && !hasOpenDialog() && !hasEditableFocus();

  const dispatchActiveSection = (section: HTMLElement): void => {
    if (section.id === activeId) {
      return;
    }

    activeId = section.id;
    document.dispatchEvent(new CustomEvent("vertical-scroll:active", { detail: { id: activeId } }));
  };

  const measureSections = (): void => {
    sections = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-section][id]"));
  };

  const getSectionTop = (section: HTMLElement): number => section.getBoundingClientRect().top + window.scrollY;

  const getSectionBottom = (section: HTMLElement): number => getSectionTop(section) + section.offsetHeight;

  const getClosestSectionIndex = (): number => {
    if (sections.length === 0) {
      return 0;
    }

    const viewportCenter = window.scrollY + window.innerHeight / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    sections.forEach((section, index) => {
      const sectionTop = getSectionTop(section);
      const sectionCenter = sectionTop + section.offsetHeight / 2;
      const distance = Math.abs(viewportCenter - sectionCenter);

      if (distance < closestDistance) {
        closestIndex = index;
        closestDistance = distance;
      }
    });

    return closestIndex;
  };

  const setActiveFromScroll = (): void => {
    animationFrame = 0;

    if (!isEnabled || sections.length === 0) {
      return;
    }

    activeIndex = getClosestSectionIndex();
    const activeSection = sections[activeIndex];

    if (activeSection) {
      dispatchActiveSection(activeSection);
    }
  };

  const requestActiveUpdate = (): void => {
    if (animationFrame !== 0) {
      return;
    }

    animationFrame = window.requestAnimationFrame(setActiveFromScroll);
  };

  const releaseTransition = (): void => {
    window.clearTimeout(releaseTimer);
    releaseTimer = window.setTimeout(() => {
      isTransitioning = false;
      setActiveFromScroll();
    }, TRANSITION_MS);
  };

  const scrollToIndex = (index: number): boolean => {
    if (!isEnabled || sections.length === 0) {
      return false;
    }

    const nextIndex = clamp(index, 0, sections.length - 1);
    const section = sections[nextIndex];

    if (!section) {
      return false;
    }

    activeIndex = nextIndex;
    isTransitioning = true;
    dispatchActiveSection(section);
    window.scrollTo({ top: getSectionTop(section), behavior: "smooth" });
    releaseTransition();
    return true;
  };

  const moveBy = (direction: 1 | -1): boolean => {
    const targetIndex = getClosestSectionIndex() + direction;

    if (targetIndex < 0 || targetIndex >= sections.length) {
      return false;
    }

    return scrollToIndex(targetIndex);
  };

  const isAtSectionStart = (section: HTMLElement): boolean => window.scrollY <= getSectionTop(section) + EDGE_TOLERANCE;

  const isAtSectionEnd = (section: HTMLElement): boolean => {
    const sectionEndScrollY = getSectionBottom(section) - window.innerHeight;
    const lowerBoundary = Math.max(getSectionTop(section), sectionEndScrollY);
    return window.scrollY >= lowerBoundary - EDGE_TOLERANCE;
  };

  const scrollWithinSection = (section: HTMLElement, direction: 1 | -1): void => {
    const sectionTop = getSectionTop(section);
    const sectionBottom = getSectionBottom(section);
    const sectionEndScrollY = Math.max(sectionTop, sectionBottom - window.innerHeight);
    const step = Math.max(180, window.innerHeight * KEY_SCROLL_STEP_RATIO);
    const nextTop = clamp(window.scrollY + step * direction, sectionTop, sectionEndScrollY);

    window.scrollTo({ top: nextTop, behavior: "smooth" });
    releaseTransition();
  };

  const handleWheel = (event: WheelEvent): void => {
    if (!canIntercept() || Math.abs(event.deltaY) <= WHEEL_THRESHOLD || Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
      return;
    }

    if (isTransitioning) {
      event.preventDefault();
      return;
    }

    const activeSection = sections[getClosestSectionIndex()];

    if (!activeSection) {
      return;
    }

    const direction = event.deltaY > 0 ? 1 : -1;
    const isAtBoundary = direction > 0 ? isAtSectionEnd(activeSection) : isAtSectionStart(activeSection);

    if (!isAtBoundary) {
      return;
    }

    const moved = moveBy(direction);

    if (moved) {
      event.preventDefault();
    }
  };

  const handleKeydown = (event: KeyboardEvent): void => {
    if (!canIntercept()) {
      return;
    }

    const currentSection = sections[getClosestSectionIndex()];
    let direction: 1 | -1 | undefined;
    let targetIndex: number | undefined;

    if (NEXT_KEYS.has(event.key) || (event.key === " " && !event.shiftKey)) {
      direction = 1;
    } else if (PREVIOUS_KEYS.has(event.key) || (event.key === " " && event.shiftKey)) {
      direction = -1;
    } else if (event.key === "Home") {
      targetIndex = 0;
    } else if (event.key === "End") {
      targetIndex = sections.length - 1;
    }

    if (targetIndex === undefined && direction === undefined) {
      return;
    }

    event.preventDefault();

    if (isTransitioning) {
      return;
    }

    if (targetIndex !== undefined) {
      scrollToIndex(targetIndex);
      return;
    }

    if (!currentSection || direction === undefined) {
      return;
    }

    const isAtBoundary = direction > 0 ? isAtSectionEnd(currentSection) : isAtSectionStart(currentSection);

    if (isAtBoundary) {
      moveBy(direction);
    } else {
      isTransitioning = true;
      scrollWithinSection(currentSection, direction);
    }
  };

  const handleAnchorClick = (event: MouseEvent): void => {
    if (!canIntercept() || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    const anchor = getAnchorFromEvent(event);
    const hash = anchor?.hash;

    if (!hash || hash.length <= 1) {
      return;
    }

    const sectionId = decodeURIComponent(hash.slice(1));
    const targetIndex = sections.findIndex((section) => section.id === sectionId);

    if (targetIndex === -1) {
      return;
    }

    event.preventDefault();
    scrollToIndex(targetIndex);
  };

  const enable = (): void => {
    isEnabled = true;
    document.body.classList.add("vertical-scroll-enabled");
    document.body.setAttribute("data-vertical-scroll-enabled", "true");
    measureSections();
    setActiveFromScroll();
  };

  const disable = (): void => {
    isEnabled = false;
    isTransitioning = false;
    sections = [];
    activeId = "";
    window.clearTimeout(releaseTimer);
    document.body.classList.remove("vertical-scroll-enabled");
    document.body.removeAttribute("data-vertical-scroll-enabled");

    if (animationFrame !== 0) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  };

  const syncEnabledState = (): void => {
    if (canEnable()) {
      enable();
    } else {
      disable();
    }
  };

  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("scroll", requestActiveUpdate, { passive: true });
  window.addEventListener("resize", () => {
    if (!isEnabled) {
      return;
    }

    measureSections();
    setActiveFromScroll();
  });
  window.addEventListener("load", () => {
    if (!isEnabled) {
      return;
    }

    measureSections();
    setActiveFromScroll();
  });
  document.addEventListener("click", handleAnchorClick, true);
  desktopMedia.addEventListener("change", syncEnabledState);
  reducedMotionMedia.addEventListener("change", syncEnabledState);

  syncEnabledState();
}

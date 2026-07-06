const DEFAULT_SCROLL_DURATION_MS = 780;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

let activeAnimationFrame = 0;
let activeResolve: (() => void) | undefined;
let previousScrollBehavior: string | undefined;

function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

function finishActiveAnimation(): void {
  if (activeAnimationFrame !== 0) {
    window.cancelAnimationFrame(activeAnimationFrame);
    activeAnimationFrame = 0;
  }

  if (previousScrollBehavior !== undefined) {
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
    previousScrollBehavior = undefined;
  }

  activeResolve?.();
  activeResolve = undefined;
}

function forceInstantScrollBehavior(): void {
  if (previousScrollBehavior !== undefined) {
    return;
  }

  previousScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
}

export function scrollWindowTo(top: number, duration = DEFAULT_SCROLL_DURATION_MS): Promise<void> {
  finishActiveAnimation();

  if (window.matchMedia(REDUCED_MOTION_QUERY).matches || duration <= 0) {
    window.scrollTo(0, top);
    return Promise.resolve();
  }

  const startTop = window.scrollY;
  const distance = top - startTop;

  if (Math.abs(distance) < 1) {
    window.scrollTo(0, top);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const startTime = window.performance.now();
    activeResolve = resolve;
    forceInstantScrollBehavior();

    const step = (currentTime: number): void => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startTop + distance * easeOutCubic(progress));

      if (progress < 1) {
        activeAnimationFrame = window.requestAnimationFrame(step);
        return;
      }

      activeAnimationFrame = 0;
      if (previousScrollBehavior !== undefined) {
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
        previousScrollBehavior = undefined;
      }
      activeResolve = undefined;
      resolve();
    };

    activeAnimationFrame = window.requestAnimationFrame(step);
  });
}

export function scrollElementToTop(element: Element, duration?: number): Promise<void> {
  return scrollWindowTo(element.getBoundingClientRect().top + window.scrollY, duration);
}

function hasOpenDialog(): boolean {
  return document.querySelector("dialog[open]") !== null;
}

export function initSideMenu(): void {
  const sideMenu = document.querySelector<HTMLElement>("#sideMenu");
  const openButton = document.querySelector<HTMLButtonElement>("#menuToggle");
  const closeButton = document.querySelector<HTMLButtonElement>("#menuClose");
  const menuOverlay = document.querySelector<HTMLElement>("#menuOverlay");

  if (!sideMenu || !openButton || !closeButton || !menuOverlay) {
    return;
  }

  const syncBodyLock = (): void => {
    document.body.classList.toggle("is-locked", sideMenu.classList.contains("is-open") || hasOpenDialog());
  };

  const setMenuOpen = (isOpen: boolean): void => {
    sideMenu.classList.toggle("is-open", isOpen);
    menuOverlay.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    openButton.setAttribute("aria-expanded", String(isOpen));
    openButton.setAttribute("aria-hidden", String(isOpen));
    sideMenu.setAttribute("aria-hidden", String(!isOpen));
    syncBodyLock();
  };

  const closeMenu = (): void => setMenuOpen(false);

  openButton.addEventListener("click", () => setMenuOpen(true));
  closeButton.addEventListener("click", closeMenu);
  menuOverlay.addEventListener("click", closeMenu);

  sideMenu.querySelectorAll<HTMLAnchorElement>("[data-menu-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (href?.startsWith("#") && href.length > 1) {
        if (!event.defaultPrevented) {
          event.preventDefault();
          document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }

      closeMenu();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sideMenu.classList.contains("is-open")) {
      closeMenu();
    }
  });

  document.addEventListener(
    "close",
    () => {
      window.setTimeout(syncBodyLock, 0);
    },
    true
  );
}

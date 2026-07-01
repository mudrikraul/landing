function createYoutubeFrame(url: string, title: string): HTMLIFrameElement {
  const frame = document.createElement("iframe");
  const embedUrl = new URL(url);
  embedUrl.searchParams.set("autoplay", "1");
  embedUrl.searchParams.set("rel", "0");
  embedUrl.searchParams.set("playsinline", "1");
  frame.src = embedUrl.href;
  frame.title = title;
  frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.allowFullscreen = true;
  return frame;
}

export function initGallery(): void {
  const dialog = document.querySelector<HTMLDialogElement>("#media-dialog");
  const body = dialog?.querySelector<HTMLElement>("[data-media-body]");
  const closeButton = dialog?.querySelector<HTMLButtonElement>("[data-close-media]");
  const heroMobileGalleryTrack = document.querySelector<HTMLElement>("#heroMobileGalleryTrack");
  const heroMobileGalleryPrev = document.querySelector<HTMLButtonElement>("#heroMobileGalleryPrev");
  const heroMobileGalleryNext = document.querySelector<HTMLButtonElement>("#heroMobileGalleryNext");
  const gallerySection = document.querySelector<HTMLElement>("#gallery");
  const galleryTrack = document.querySelector<HTMLElement>("#galleryTrack");
  const galleryPrev = document.querySelector<HTMLButtonElement>("#galleryPrev");
  const galleryNext = document.querySelector<HTMLButtonElement>("#galleryNext");

  if (heroMobileGalleryTrack && heroMobileGalleryPrev && heroMobileGalleryNext) {
    heroMobileGalleryPrev.addEventListener("click", () => {
      heroMobileGalleryTrack.scrollBy({ left: -(heroMobileGalleryTrack.clientWidth * 0.88), behavior: "smooth" });
    });

    heroMobileGalleryNext.addEventListener("click", () => {
      heroMobileGalleryTrack.scrollBy({ left: heroMobileGalleryTrack.clientWidth * 0.88, behavior: "smooth" });
    });
  }

  if (gallerySection && galleryTrack && galleryPrev && galleryNext) {
    const updateGalleryControls = (): void => {
      const isDesktopGallery = window.matchMedia("(min-width: 1025px)").matches;
      const hasOverflow = galleryTrack.scrollWidth > galleryTrack.clientWidth + 1;
      const shouldShowControls = isDesktopGallery && (galleryTrack.children.length > 3 || hasOverflow);
      gallerySection.classList.toggle("has-controls", shouldShowControls);
    };

    galleryPrev.addEventListener("click", () => {
      galleryTrack.scrollBy({ left: -(galleryTrack.clientWidth * 0.88), behavior: "smooth" });
    });

    galleryNext.addEventListener("click", () => {
      galleryTrack.scrollBy({ left: galleryTrack.clientWidth * 0.88, behavior: "smooth" });
    });

    window.addEventListener("resize", updateGalleryControls);
    window.addEventListener("load", updateGalleryControls);
    updateGalleryControls();
  }

  const scrollButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-scroll-prev], [data-scroll-next]"));
  const updateScrollControls = (track: HTMLElement): void => {
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    scrollButtons.forEach((button) => {
      if ((button.dataset.scrollPrev ?? button.dataset.scrollNext) !== track.id) {
        return;
      }
      button.disabled = button.hasAttribute("data-scroll-prev") ? atStart : atEnd;
    });
  };

  scrollButtons.forEach((button) => {
    const targetId = button.dataset.scrollPrev ?? button.dataset.scrollNext;
    const track = targetId ? document.getElementById(targetId) : null;
    if (!track) {
      return;
    }

    button.addEventListener("click", () => {
      const direction = button.hasAttribute("data-scroll-prev") ? -1 : 1;
      track.scrollBy({ left: track.clientWidth * 0.88 * direction, behavior: "smooth" });
    });
    track.addEventListener("scroll", () => updateScrollControls(track), { passive: true });
    window.addEventListener("resize", () => updateScrollControls(track));
    updateScrollControls(track);
  });

  if (!dialog || !body || !closeButton) {
    return;
  }

  const clear = (): void => {
    body.replaceChildren();
    document.body.classList.remove("is-locked");
  };

  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", clear);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  document.querySelectorAll<HTMLButtonElement>("[data-media-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const type = trigger.dataset.mediaType;
      const url = trigger.dataset.mediaUrl;
      const title = trigger.dataset.mediaTitle ?? "Материал RMFlow";
      if (!url || (type !== "youtube" && type !== "image")) {
        return;
      }

      const media = type === "youtube" ? createYoutubeFrame(url, title) : new Image();
      if (media instanceof HTMLImageElement) {
        media.src = url;
        media.alt = title;
      }
      body.replaceChildren(media);
      dialog.showModal();
      document.body.classList.add("is-locked");
    });
  });
}

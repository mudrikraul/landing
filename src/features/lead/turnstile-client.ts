export interface TurnstileApi {
  render(container: HTMLElement, options: {
    sitekey: string;
    theme: "light";
    callback: (token: string) => void;
    "expired-callback": () => void;
    "error-callback": () => void;
  }): string;
  reset(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let turnstilePromise: Promise<TurnstileApi> | undefined;

export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  turnstilePromise ??= new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-turnstile-script]");
    const script = existing ?? document.createElement("script");
    const handleLoad = (): void => window.turnstile
      ? resolve(window.turnstile)
      : reject(new Error("Turnstile API unavailable"));

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", () => reject(new Error("Turnstile script failed")), { once: true });

    if (!existing) {
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.turnstileScript = "true";
      document.head.appendChild(script);
    }
  });

  return turnstilePromise;
}

import type { LeadRequest } from "./lead-contract";
import { submitLead } from "./lead-api";
import { validateLeadFields } from "./lead-validation";
import { loadTurnstile } from "./turnstile-client";

const DIALOG_ANIMATION_MS = 280;

interface LeadFormBinding {
  abortRequest: () => void;
  focusName: () => void;
  initializeTurnstile: () => Promise<void>;
  prepareForm: () => void;
  resetAfterClose: () => void;
}

function bindLeadForm(root: ParentNode): LeadFormBinding | undefined {
  const form = root.querySelector<HTMLFormElement>("[data-lead-form]");
  const errorElement = root.querySelector<HTMLElement>("[data-lead-error]");
  const statusMessage = root.querySelector<HTMLElement>("[data-lead-status-message]");
  const retryButton = root.querySelector<HTMLButtonElement>("[data-lead-retry]");
  const submitButton = form?.querySelector<HTMLButtonElement>("button[type='submit']");
  const turnstileContainer = form?.querySelector<HTMLElement>("[data-turnstile-container]");
  const nameInput = form?.elements.namedItem("name");
  const phoneInput = form?.elements.namedItem("phone");
  const consentInput = form?.elements.namedItem("consent");

  if (
    !form ||
    !errorElement ||
    !submitButton ||
    !turnstileContainer ||
    !(nameInput instanceof HTMLInputElement) ||
    !(phoneInput instanceof HTMLInputElement) ||
    !(consentInput instanceof HTMLInputElement)
  ) {
    return undefined;
  }

  let turnstileToken = "";
  let widgetId: string | undefined;
  let activeRequest: AbortController | undefined;

  const setView = (name: "form" | "success" | "error"): void => {
    root.querySelectorAll<HTMLElement>("[data-lead-view]").forEach((view) => {
      view.hidden = view.dataset.leadView !== name;
    });
  };

  const updateFieldState = (input: HTMLInputElement): void => {
    input.closest("[data-lead-field]")?.classList.toggle("is-filled", input.value.trim().length > 0);
  };

  const updateSubmitState = (): void => {
    const validation = validateLeadFields({
      name: nameInput.value,
      phone: phoneInput.value,
      consent: consentInput.checked
    });
    submitButton.classList.toggle("is-ready", validation.valid);
    submitButton.disabled = activeRequest !== undefined;
  };

  const resetTurnstile = (): void => {
    turnstileToken = "";
    if (widgetId && window.turnstile) {
      window.turnstile.reset(widgetId);
    }
  };

  const initializeTurnstile = async (): Promise<void> => {
    if (widgetId) {
      resetTurnstile();
      return;
    }

    try {
      const api = await loadTurnstile();
      turnstileContainer.replaceChildren();
      widgetId = api.render(turnstileContainer, {
        sitekey: turnstileContainer.dataset.turnstileSiteKey ?? "",
        theme: "light",
        callback: (token) => {
          turnstileToken = token;
          errorElement.textContent = "";
        },
        "expired-callback": () => {
          turnstileToken = "";
        },
        "error-callback": () => {
          turnstileToken = "";
          errorElement.textContent = "Не удалось выполнить проверку безопасности.";
        }
      });
    } catch {
      errorElement.textContent = "Не удалось загрузить проверку безопасности. Обновите страницу.";
    }
  };

  const prepareForm = (): void => {
    setView("form");
    errorElement.textContent = "";
    updateFieldState(nameInput);
    updateFieldState(phoneInput);
    updateSubmitState();
  };

  const focusName = (): void => {
    window.setTimeout(() => nameInput.focus(), 50);
  };

  const abortRequest = (): void => {
    activeRequest?.abort();
    activeRequest = undefined;
  };

  const resetAfterClose = (): void => {
    abortRequest();
    submitButton.disabled = false;
    submitButton.textContent = "Отправить";
    updateSubmitState();
  };

  [nameInput, phoneInput].forEach((input) => {
    input.addEventListener("input", () => {
      updateFieldState(input);
      updateSubmitState();
      errorElement.textContent = "";
    });
    input.addEventListener("blur", () => updateFieldState(input));
  });

  consentInput.addEventListener("change", () => {
    updateSubmitState();
    errorElement.textContent = "";
  });

  retryButton?.addEventListener("click", () => {
    setView("form");
    resetTurnstile();
    updateSubmitState();
    focusName();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (activeRequest) {
      return;
    }

    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "");
    const phone = String(formData.get("phone") ?? "");
    const consent = formData.get("consent") === "on";
    const validation = validateLeadFields({ name, phone, consent });

    updateFieldState(nameInput);
    updateFieldState(phoneInput);
    updateSubmitState();

    if (!validation.valid) {
      errorElement.textContent = validation.message;
      return;
    }

    if (!turnstileToken) {
      errorElement.textContent = "Подтвердите, что вы не робот.";
      return;
    }

    const payload: LeadRequest = {
      name: name.trim(),
      phone: phone.trim(),
      consent: true,
      company: String(formData.get("company") ?? ""),
      turnstileToken
    };

    activeRequest = new AbortController();
    submitButton.disabled = true;
    submitButton.textContent = "Отправляем...";
    errorElement.textContent = "";
    updateSubmitState();

    try {
      const result = await submitLead(payload, activeRequest.signal);

      if (!result.ok) {
        if (statusMessage) {
          statusMessage.textContent = result.message;
        }
        setView("error");
        resetTurnstile();
        return;
      }

      form.reset();
      updateFieldState(nameInput);
      updateFieldState(phoneInput);
      updateSubmitState();
      setView("success");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        if (statusMessage) {
          statusMessage.textContent = "Попробуйте перезагрузить страницу.";
        }
        setView("error");
        resetTurnstile();
      }
    } finally {
      activeRequest = undefined;
      submitButton.disabled = false;
      submitButton.textContent = "Отправить";
      updateSubmitState();
    }
  });

  prepareForm();

  return { abortRequest, focusName, initializeTurnstile, prepareForm, resetAfterClose };
}

export function initLeadForm(): void {
  const dialog = document.querySelector<HTMLDialogElement>("#lead-dialog");
  const stage = dialog?.querySelector<HTMLElement>(".lead-dialog__stage");

  if (!dialog || !stage) {
    return;
  }

  const binding = bindLeadForm(dialog);
  if (!binding) {
    return;
  }

  let opener: HTMLElement | undefined;
  let closeTimer: number | undefined;
  let openFrame: number | undefined;

  const closeDialog = (): void => {
    if (!dialog.open || dialog.classList.contains("is-closing")) {
      return;
    }

    if (openFrame !== undefined) {
      window.cancelAnimationFrame(openFrame);
      openFrame = undefined;
    }

    dialog.classList.remove("is-open");
    dialog.classList.add("is-closing");
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      dialog.close();
    }, DIALOG_ANIMATION_MS);
  };

  const open = (trigger: HTMLElement): void => {
    opener = trigger;
    window.clearTimeout(closeTimer);
    if (openFrame !== undefined) {
      window.cancelAnimationFrame(openFrame);
      openFrame = undefined;
    }
    dialog.classList.remove("is-closing", "is-open");
    binding.prepareForm();

    if (!dialog.open) {
      dialog.showModal();
    }

    openFrame = window.requestAnimationFrame(() => {
      dialog.classList.add("is-open");
      openFrame = undefined;
    });

    document.body.classList.add("is-locked");
    binding.initializeTurnstile().catch(() => undefined);
    binding.focusName();
  };

  document.querySelectorAll<HTMLElement>("[data-open-lead]").forEach((trigger) => {
    trigger.addEventListener("click", () => open(trigger));
  });

  dialog.querySelectorAll<HTMLButtonElement>("[data-close-lead]").forEach((button) => {
    button.addEventListener("click", closeDialog);
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog || event.target === stage) {
      closeDialog();
    }
  });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog();
  });

  dialog.addEventListener("close", () => {
    window.clearTimeout(closeTimer);
    if (openFrame !== undefined) {
      window.cancelAnimationFrame(openFrame);
      openFrame = undefined;
    }
    dialog.classList.remove("is-closing", "is-open");
    document.body.classList.remove("is-locked");
    binding.resetAfterClose();
    opener?.focus();
  });
}

export function initInlineLeadForm(): void {
  const root = document.querySelector<HTMLElement>("#info-lead");
  if (!root) {
    return;
  }

  const binding = bindLeadForm(root);
  if (!binding) {
    return;
  }

  binding.initializeTurnstile().catch(() => undefined);
}

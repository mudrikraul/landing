import type { LeadRequest, LeadResponse } from "./lead-contract";

export type LeadSubmissionResult =
  | { ok: true }
  | { ok: false; message: string };

function isLeadResponse(value: unknown): value is LeadResponse {
  if (typeof value !== "object" || value === null || !("ok" in value)) {
    return false;
  }

  const ok = Reflect.get(value, "ok");
  return ok === true || (ok === false && typeof Reflect.get(value, "message") === "string");
}

export async function submitLead(payload: LeadRequest, signal: AbortSignal): Promise<LeadSubmissionResult> {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal
  });
  const result: unknown = await response.json();

  if (response.ok && isLeadResponse(result) && result.ok) {
    return { ok: true };
  }

  return {
    ok: false,
    message: isLeadResponse(result) && !result.ok
      ? result.message
      : "Не удалось отправить заявку."
  };
}

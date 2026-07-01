import type { LeadRequest } from "@/features/lead/lead-contract";

const MAX_BODY_BYTES = 8_192;

export type LeadParseResult =
  | { ok: true; value: LeadRequest }
  | { ok: false; status: 400 | 422; message: string; spam?: boolean };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function parseLeadRequest(request: Request): Promise<LeadParseResult> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim();
  if (contentType !== "application/json") {
    return { ok: false, status: 400, message: "Ожидается JSON-запрос." };
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return { ok: false, status: 400, message: "Запрос слишком большой." };
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return { ok: false, status: 400, message: "Запрос слишком большой." };
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return { ok: false, status: 400, message: "Некорректный JSON." };
  }

  if (!isPlainObject(body)) {
    return { ok: false, status: 400, message: "Некорректный формат данных." };
  }

  const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const phoneDigits = phone.replace(/\D/g, "");
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken.trim() : "";

  if (company) {
    return { ok: false, status: 422, message: "Заявка отклонена.", spam: true };
  }
  if (name.length < 2 || name.length > 80) {
    return { ok: false, status: 422, message: "Имя должно содержать от 2 до 80 символов." };
  }
  if (phoneDigits.length < 10 || phoneDigits.length > 15 || phone.length > 32) {
    return { ok: false, status: 422, message: "Введите корректный номер телефона." };
  }
  if (body.consent !== true) {
    return { ok: false, status: 422, message: "Необходимо согласие на обработку данных." };
  }
  if (!turnstileToken || turnstileToken.length > 2_048) {
    return { ok: false, status: 422, message: "Не пройдена проверка безопасности." };
  }

  return {
    ok: true,
    value: { name, phone, consent: true, company: "", turnstileToken }
  };
}


import type { APIRoute } from "astro";
import type { LeadResponse } from "@/features/lead/lead-contract";
import { parseLeadRequest } from "@/server/lead-request";
import { sendTelegramLead } from "@/server/telegram";
import { verifyTurnstile } from "@/server/turnstile";

export const prerender = false;

function json(body: LeadResponse, status: number): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const parsed = await parseLeadRequest(request);
    if (!parsed.ok) {
      return json({
        ok: false,
        code: parsed.spam ? "SPAM_DETECTED" : parsed.status === 400 ? "INVALID_REQUEST" : "VALIDATION_FAILED",
        message: parsed.message
      }, parsed.status);
    }

    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TURNSTILE_SECRET_KEY } = process.env;
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID || !TURNSTILE_SECRET_KEY) {
      console.error(JSON.stringify({ message: "lead endpoint is missing required secrets" }));
      return json({ ok: false, code: "SERVER_MISCONFIGURED", message: "Сервис временно не настроен." }, 500);
    }

    const verified = await verifyTurnstile(parsed.value.turnstileToken, TURNSTILE_SECRET_KEY);
    if (!verified) {
      return json({ ok: false, code: "TURNSTILE_FAILED", message: "Не пройдена проверка безопасности." }, 422);
    }

    const sent = await sendTelegramLead(parsed.value, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID);
    if (!sent) {
      console.error(JSON.stringify({ message: "telegram rejected lead delivery" }));
      return json({ ok: false, code: "TELEGRAM_FAILED", message: "Не удалось отправить заявку. Попробуйте позже." }, 502);
    }

    return json({ ok: true }, 200);
  } catch (error) {
    console.error(JSON.stringify({
      message: "unhandled lead endpoint error",
      error: error instanceof Error ? error.name : "UnknownError"
    }));
    return json({ ok: false, code: "TELEGRAM_FAILED", message: "Не удалось отправить заявку. Попробуйте позже." }, 502);
  }
};

export const ALL: APIRoute = () => new Response(null, {
  status: 405,
  headers: { Allow: "POST", "Cache-Control": "no-store" }
});

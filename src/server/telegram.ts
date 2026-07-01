interface TelegramResult {
  ok: boolean;
}

function isTelegramResult(value: unknown): value is TelegramResult {
  return typeof value === "object" && value !== null && typeof Reflect.get(value, "ok") === "boolean";
}

interface TelegramLead {
  name: string;
  phone: string;
}

export async function sendTelegramLead(lead: TelegramLead, token: string, chatId: string): Promise<boolean> {
  const submittedAt = new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Almaty"
  }).format(new Date());
  const text = [
    "Новая заявка с RMFlow website",
    "",
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    `Дата: ${submittedAt}`
  ].join("\n");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });
  if (!response.ok) {
    return false;
  }

  const result: unknown = await response.json();
  return isTelegramResult(result) && result.ok;
}


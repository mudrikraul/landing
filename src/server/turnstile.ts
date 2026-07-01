interface TurnstileResult {
  success: boolean;
}

function isTurnstileResult(value: unknown): value is TurnstileResult {
  return typeof value === "object" && value !== null && Reflect.get(value, "success") === true;
}

export async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  const body = new FormData();
  body.set("secret", secret);
  body.set("response", token);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body
  });
  if (!response.ok) {
    return false;
  }

  const result: unknown = await response.json();
  return isTurnstileResult(result);
}


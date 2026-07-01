import type { LeadFormFields } from "./lead-contract";

export interface ClientValidationResult {
  valid: boolean;
  message: string;
}

export function validateLeadFields(fields: LeadFormFields): ClientValidationResult {
  const name = fields.name.trim().replace(/\s+/g, " ");
  const phoneDigits = fields.phone.replace(/\D/g, "");

  if (name.length < 2 || name.length > 80) {
    return { valid: false, message: "Введите имя длиной от 2 до 80 символов." };
  }

  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    return { valid: false, message: "Введите номер телефона с 10–15 цифрами." };
  }

  if (!fields.consent) {
    return { valid: false, message: "Подтвердите согласие на обработку персональных данных." };
  }

  return { valid: true, message: "" };
}


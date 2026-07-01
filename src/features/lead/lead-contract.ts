export interface LeadRequest {
  name: string;
  phone: string;
  consent: true;
  company: string;
  turnstileToken: string;
}

export type LeadErrorCode =
  | "INVALID_REQUEST"
  | "VALIDATION_FAILED"
  | "SPAM_DETECTED"
  | "TURNSTILE_FAILED"
  | "TELEGRAM_FAILED"
  | "SERVER_MISCONFIGURED";

export type LeadResponse =
  | { ok: true }
  | { ok: false; code: LeadErrorCode; message: string };

export interface LeadFormFields {
  name: string;
  phone: string;
  consent: boolean;
}


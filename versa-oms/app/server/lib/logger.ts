/**
 * Structured, privacy-safe logger. Emits one JSON line per event and redacts
 * sensitive keys (secrets + classified domain fields) at up to two levels.
 */
const REDACT = new Set([
  "password", "token", "secret", "authorization", "cookie",
  "aadhaar", "passport", "bank_account", "account_number", "ifsc", "pan", "ssn",
  "provider_payload", "answer_key", "raw_omr", "signed_url", "private_file_url",
  "parent_phone", "parent_email", "payment_reference",
]);

function redactValue(obj: unknown, depth: number): unknown {
  if (depth > 2 || obj === null || typeof obj !== "object") return obj;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = REDACT.has(k.toLowerCase()) ? "[redacted]" : redactValue(v, depth + 1);
  }
  return out;
}

function emit(level: "info" | "warn" | "error", event: string, data?: Record<string, unknown>): void {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, event, ...(redactValue(data ?? {}, 0) as Record<string, unknown>) });
  if (level === "error") console.error(line);
  else console.log(line);
}

export const logger = {
  info: (event: string, data?: Record<string, unknown>) => emit("info", event, data),
  warn: (event: string, data?: Record<string, unknown>) => emit("warn", event, data),
  error: (event: string, data?: Record<string, unknown>) => emit("error", event, data),
  redact: (data: Record<string, unknown>) => redactValue(data, 0),
};

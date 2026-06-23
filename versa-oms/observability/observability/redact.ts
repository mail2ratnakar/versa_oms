const sensitiveKeys = [
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "signed_url",
  "download_url",
  "private_file_url",
  "answer_key",
  "raw_omr",
  "provider_payload",
  "webhook_signature",
  "parent_phone",
  "parent_email"
];

export function redactValue(key: string, value: unknown): unknown {
  const lower = key.toLowerCase();
  if (sensitiveKeys.some((sensitive) => lower.includes(sensitive))) {
    return "[REDACTED]";
  }

  if (typeof value === "string" && value.includes("X-Amz-Signature")) {
    return "[REDACTED_SIGNED_URL]";
  }

  return value;
}

export function redactObject(input: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      output[key] = redactObject(value as Record<string, unknown>);
    } else {
      output[key] = redactValue(key, value);
    }
  }

  return output;
}

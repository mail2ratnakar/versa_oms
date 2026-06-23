const sensitiveFields = new Set([
  "parent_phone",
  "parent_email",
  "payment_reference",
  "provider_payload",
  "answer_key",
  "raw_omr",
  "private_file_url",
  "signed_url",
  "audit_snapshot",
  "internal_note"
]);

export function maskValue(key: string, value: unknown) {
  if (!sensitiveFields.has(key)) return value;
  if (value == null) return value;

  if (key.includes("email") && typeof value === "string") {
    const [name, domain] = value.split("@");
    return `${name.slice(0, 2)}***@${domain ?? "masked"}`;
  }

  if (key.includes("phone") && typeof value === "string") {
    return `******${value.slice(-4)}`;
  }

  return "[MASKED]";
}

export function maskRecord<T extends Record<string, unknown>>(record: T): T {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    output[key] = maskValue(key, value);
  }
  return output as T;
}

export function maskRecords<T extends Record<string, unknown>>(records: T[]): T[] {
  return records.map(maskRecord);
}

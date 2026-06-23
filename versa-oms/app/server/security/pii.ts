/**
 * Forbidden PII fields. The platform must NEVER store national-ID / financial
 * identity numbers on student/business records. Any payload carrying these keys
 * (in any casing/separator) is rejected.
 */
const FORBIDDEN = [
  "aadhaar",
  "aadhar",
  "passport",
  "passport_no",
  "passport_number",
  "bank_account",
  "bank_acct",
  "account_number",
  "ifsc",
  "pan",
  "pan_card",
  "ssn",
  "national_id",
];

function normalize(key: string): string {
  return key.toLowerCase().replace(/[\s_-]/g, "");
}
const FORBIDDEN_NORM = FORBIDDEN.map(normalize);

function matchesForbidden(normKey: string): boolean {
  return FORBIDDEN_NORM.some(
    (t) => normKey === t || normKey.startsWith(t) || (t.length >= 5 && normKey.includes(t))
  );
}

/** Return the list of forbidden field names present in a payload. */
export function forbiddenFieldsIn(payload: Record<string, unknown>): string[] {
  const hits: string[] = [];
  for (const k of Object.keys(payload ?? {})) {
    if (matchesForbidden(normalize(k))) hits.push(k);
  }
  return hits;
}

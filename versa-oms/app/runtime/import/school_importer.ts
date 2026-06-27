// FROZEN-KERNEL — directory import: map ANY source's columns -> prospect schools (linked to the batch).
// Mapping-driven (not source-hardcoded): a row's columns map -> CANONICAL fields -> schools fields. The mapping
// is, in priority: an explicit override, else the batch's stored mapping (JSON), else auto-detected from headers.
// EMAIL is the only required field (it's also Brevo's only mandatory). Everything else enriches if present.
import { db } from "@/runtime/db";

// the canonical import template — header row downloadable from OJ-O1 (email required, rest optional)
export const CANONICAL = ["email", "school_name", "school_code", "contact_name", "phone", "address", "city", "state", "pincode", "website", "board"];
const TO_SCHOOL: Record<string, string> = {
  email: "coordinator_email", school_name: "name", school_code: "school_code", contact_name: "coordinator_name",
  phone: "coordinator_mobile", address: "address_line1", city: "city", state: "state", pincode: "pincode", website: "website", board: "board",
};
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function importTemplateCsv(): string {
  return CANONICAL.join(",") + "\n";   // a ready-to-fill header row; only `email` is required
}

// guess source-column -> canonical field from header names (so most files map with zero config)
export function detectMapping(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const h of headers) {
    const k = String(h).toLowerCase();
    if (k.includes("email") || k.includes("e-mail")) map[h] = "email";
    else if (k.includes("pin") || k.includes("zip") || k.includes("postal")) map[h] = "pincode";
    else if (k.includes("city") || k.includes("town")) map[h] = "city";
    else if (k.includes("state") || k.includes("region")) map[h] = "state";
    else if (k.includes("website") || k.includes("url") || k.includes("web")) map[h] = "website";
    else if (k.includes("phone") || k.includes("mobile") || k.includes("contact no") || k.includes("tel")) map[h] = "phone";
    else if (k.includes("address")) map[h] = "address";
    else if (k.includes("board") || k.includes("affiliation") || k.includes("level")) map[h] = "board";
    else if (k.includes("principal") || (k.includes("contact") && k.includes("name"))) map[h] = "contact_name";
    else if (k.includes("code") || k.includes("udise")) map[h] = "school_code";
    else if (k.includes("school") && k.includes("name")) map[h] = "school_name";
    else if (k === "name" || k.includes("school") || k.includes("institution")) map[h] = "school_name";
  }
  return map;
}

function rowToSchool(row: Record<string, unknown>, mapping: Record<string, string>, importId: string): Record<string, unknown> {
  const school: Record<string, unknown> = { source: "import", status: "prospect", import_id: importId };
  for (const [col, canon] of Object.entries(mapping)) {
    const field = TO_SCHOOL[canon];
    if (field && row[col] != null && String(row[col]).trim()) school[field] = String(row[col]).trim();
  }
  return school;
}

// pre-import classification (the wizard's Validate step): valid / missing-email / duplicate. Dedup = skip.
export function analyze(rows: Record<string, unknown>[], mapping: Record<string, string>, existing: Set<string>): { total: number; valid: number; missing: number; duplicates: number } {
  let valid = 0, missing = 0, duplicates = 0; const seen = new Set<string>();
  for (const row of rows) {
    const e = String(rowToSchool(row, mapping, "").coordinator_email ?? "").toLowerCase();
    if (!EMAIL_RE.test(e)) { missing++; continue; }
    if (existing.has(e) || seen.has(e)) { duplicates++; continue; }
    seen.add(e); valid++;
  }
  return { total: rows.length, valid, missing, duplicates };
}

export async function processImport(importId: string, rows: Record<string, unknown>[], mappingOverride?: Record<string, string>): Promise<{ imported: number; failed: number; duplicates: number }> {
  const imp = (await db.get("school_imports", importId)) as Record<string, any> | null;
  const headers = Object.keys(rows[0] || {});
  let stored: Record<string, string> | null = null;
  try { if (imp?.mapping) stored = JSON.parse(imp.mapping); } catch { /* not valid JSON -> auto-detect */ }
  const mapping = mappingOverride || stored || detectMapping(headers);
  const existing = new Set(((await db.list("schools")) as Record<string, any>[]).map((s) => String(s.coordinator_email ?? "").toLowerCase()).filter(Boolean));
  let imported = 0, failed = 0, duplicates = 0; const seen = new Set<string>();
  for (const row of rows) {
    const school = rowToSchool(row, mapping, importId);
    const e = String(school.coordinator_email ?? "").toLowerCase();
    if (!EMAIL_RE.test(e)) { failed++; continue; }                  // no email -> skip
    if (existing.has(e) || seen.has(e)) { duplicates++; continue; } // dedup = skip existing (preserve funnel state)
    seen.add(e);
    if (!school.name) school.name = school.coordinator_email;
    await db.insert("schools", school);
    imported++;
  }
  const summary = [failed && `${failed} skipped (no email)`, duplicates && `${duplicates} duplicate(s) skipped`].filter(Boolean).join("; ");
  await db.update("school_imports", importId, { total_rows: rows.length, imported_count: imported, failed_count: failed + duplicates, error_summary: summary });
  return { imported, failed, duplicates };
}

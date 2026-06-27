// FROZEN-KERNEL — directory import: map source rows -> prospect schools (linked to the import batch).
// Called by the OJ-O1 upload flow with parsed rows (CSV/XLSX parsing is a thin front; mapping + create live here).
// Email is the outreach key: rows without a valid email are skipped (counted as failed). Per-source column maps below.
import { db } from "@/runtime/db";

const MAPPINGS: Record<string, Record<string, string>> = {
  kvs: { "School Code": "school_code", "Principal's Name": "principal_name", "Office Address": "address_line1", "Email Address": "coordinator_email", "Phone No": "coordinator_mobile", "Website": "website", "State": "state", "Pin Code": "pincode" },
  cbse: { "School Name": "name", "City": "city", "State": "state", "Level": "level", "Contact": "coordinator_mobile", "Email": "coordinator_email", "Website": "website" },
};
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function processImport(importId: string, rows: Record<string, unknown>[]): Promise<{ imported: number; failed: number }> {
  const imp = (await db.get("school_imports", importId)) as Record<string, any> | null;
  const map = MAPPINGS[String(imp?.source ?? "").toLowerCase()] || {};
  let imported = 0, failed = 0;
  for (const row of rows) {
    const school: Record<string, unknown> = { source: "import", status: "prospect", import_id: importId };
    for (const [col, field] of Object.entries(map)) if (row[col] != null && String(row[col]).trim()) school[field] = String(row[col]).trim();
    if (!EMAIL_RE.test(String(school.coordinator_email ?? ""))) { failed++; continue; }  // email = the outreach key
    if (!school.name) school.name = school.coordinator_email;                            // fall back to email for display
    await db.insert("schools", school);
    imported++;
  }
  await db.update("school_imports", importId, { total_rows: rows.length, imported_count: imported, failed_count: failed });
  return { imported, failed };
}

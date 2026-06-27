// FROZEN-KERNEL — import wizard API: upload -> validate -> run. Parsed rows are held in-memory by token
// between steps. The dev server (and a Next.js app/api/import/* route) call these. No data typed by hand.
import { db } from "@/runtime/db";
import { parseRows } from "./parse";
import { CANONICAL, detectMapping, analyze, processImport } from "./school_importer";
import { createSchoolImports, transitionSchoolImports } from "@/services/school_imports.service";

const uploads = new Map<string, Record<string, unknown>[]>();

// 1. UPLOAD — decode (xlsx/csv) -> rows; return headers, auto-detected mapping, the canonical targets, a preview
export function importUpload(body: { dataB64?: string; csv?: string }): { token: string; headers: string[]; mapping: Record<string, string>; canonical: string[]; preview: Record<string, unknown>[]; total: number } {
  const data: Buffer | string = body.csv != null ? body.csv : Buffer.from(body.dataB64 || "", "base64");
  const rows = parseRows(data);
  const token = "up-" + crypto.randomUUID().slice(0, 12);
  uploads.set(token, rows);
  const headers = Object.keys(rows[0] || {});
  return { token, headers, mapping: detectMapping(headers), canonical: CANONICAL, preview: rows.slice(0, 5), total: rows.length };
}

// 2. VALIDATE — classify against the live directory (dedup = skip), no writes
export async function importValidate(body: { token: string; mapping: Record<string, string> }): Promise<{ total: number; valid: number; missing: number; duplicates: number }> {
  const rows = uploads.get(body.token) || [];
  const existing = new Set(((await db.list("schools")) as Record<string, any>[]).map((s) => String(s.coordinator_email ?? "").toLowerCase()).filter(Boolean));
  return analyze(rows, body.mapping, existing);
}

// 3. RUN — create the batch, walk its lifecycle (uploaded -> validating -> imported), import the rows
export async function importRun(body: { token: string; mapping: Record<string, string>; source?: string }): Promise<{ importId: string; imported: number; failed: number; duplicates: number }> {
  const rows = uploads.get(body.token) || [];
  const imp = (await createSchoolImports({
    import_code: "IMP-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    source: body.source || "upload", file: body.token, status: "uploaded", mapping: JSON.stringify(body.mapping),
  } as never)) as Record<string, any>;
  await transitionSchoolImports(imp.data.id, "validate_rows" as never);
  const r = await processImport(imp.data.id, rows, body.mapping);
  await transitionSchoolImports(imp.data.id, "complete_import" as never);
  uploads.delete(body.token);
  return { importId: imp.data.id, ...r };
}

/**
 * Export generation. Produces a CSV with a confidentiality/watermark metadata
 * header (generated_by, timestamp, scope) per the spec's sensitive-export rule.
 * Values are masked BEFORE reaching here (caller passes masked rows). Pure.
 */
function esc(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function toCsv(
  rows: Array<Record<string, unknown>>,
  columns: string[],
  meta: { generated_by: string; scope: string; classification?: string }
): string {
  const ts = new Date().toISOString();
  const header = [
    `# generated_by: ${meta.generated_by}`,
    `# generated_at: ${ts}`,
    `# scope: ${meta.scope}`,
    `# classification: ${meta.classification ?? "internal"}`,
    `# confidential — handle per data classification policy`,
  ].join("\n");
  const head = columns.map(esc).join(",");
  const body = rows.map((r) => columns.map((c) => esc(r[c])).join(",")).join("\n");
  return `${header}\n${head}\n${body}\n`;
}

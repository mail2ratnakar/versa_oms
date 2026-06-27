// FROZEN-KERNEL — decode an uploaded directory file (XLSX or CSV) into rows for processImport().
// Uses SheetJS (xlsx) which parses both formats; first sheet, header row -> array of {column: value}.
import * as XLSX from "xlsx";

export function parseRows(data: Buffer | ArrayBuffer | string): Record<string, unknown>[] {
  const wb = XLSX.read(data, { type: typeof data === "string" ? "string" : "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { defval: "" }) as Record<string, unknown>[];
}

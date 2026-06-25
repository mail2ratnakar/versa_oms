// Roster ingestion engine (FRAMEWORK — hand-written, reusable by both portals).
// Pure functions: parse a CSV/XLSX student file, validate each row against the
// students/validations.json + student_roster_ops/validation_policy.json rules,
// detect duplicates within school+participation, and return a structured result
// (valid / invalid / duplicate rows + counts + reports) that the ingest service
// persists. No DB, no I/O here — fully unit-testable.
//
// Spec sources: students/validations.json (file type/size, required cols, name,
// grade, duplicate rule, consent), student_roster_ops/validation_policy.json
// (forbidden MVP fields, invalid/duplicate block lock), data_classification.json.
import * as XLSX from "xlsx";

export const ALLOWED_FILE_TYPES = ["csv", "xlsx"] as const;
export type RosterFileType = (typeof ALLOWED_FILE_TYPES)[number];
export const DEFAULT_MAX_BYTES = 10 * 1024 * 1024; // students/validations.json: 10 MB default

// validation_policy.json forbidden_mvp_fields + common aliases — presence of any
// of these columns rejects the whole upload (government IDs are forbidden in MVP).
export const FORBIDDEN_COLUMNS = [
  "government_id", "govt_id", "gov_id", "national_id",
  "aadhaar", "aadhar", "uid",
  "passport", "passport_no", "passport_number",
  "bank_account", "bank_acct", "account_number", "ifsc",
  "pan", "pan_number", "ssn",
];

const REQUIRED_COLUMNS = ["student_name", "grade", "consent_obtained"];
// Recognised optional columns; anything else is ignored (not stored).
const OPTIONAL_COLUMNS = ["section", "school_roll_number", "parent_guardian_name", "parent_contact"];

export type RawRow = Record<string, string>;

export type IngestRow = {
  student_name: string;
  grade: string;
  section: string | null;
  school_roll_number: string | null;
  parent_guardian_name: string | null;
  parent_contact: string | null;
  consent_obtained: boolean;
  normalized_name: string;
  dedupe_key: string;
  source_row: number; // 1-based data row number (excludes header)
};

export type InvalidRow = { source_row: number; data: RawRow; errors: string[] };
export type DuplicateRow = { source_row: number; dedupe_key: string; data: RawRow; conflicts_with: number };

export type IngestResult = {
  ok: boolean; // file-level checks passed (format, size, required + forbidden columns)
  file_errors: string[]; // blocking file-level errors (empty when ok)
  valid_rows: IngestRow[];
  invalid_rows: InvalidRow[];
  duplicate_rows: DuplicateRow[];
  counts: { total: number; valid: number; invalid: number; duplicate: number };
  validation_report: {
    file_errors: string[];
    invalid: Array<{ row: number; errors: string[] }>;
    summary: { total: number; valid: number; invalid: number; duplicate: number };
  };
  duplicate_report: {
    keys: string[];
    rows: Array<{ row: number; key: string; conflicts_with: number }>;
  };
};

export function normalizeName(s?: string | null): string {
  return (s ?? "").toString().toLowerCase().trim().replace(/\s+/g, " ");
}

function normHeader(s: string): string {
  return s.toString().toLowerCase().trim().replace(/\s+/g, "_");
}

const TRUTHY = new Set(["true", "yes", "y", "1", "obtained", "given", "consent", "consented"]);
const FALSY = new Set(["false", "no", "n", "0", "", "not_obtained", "pending"]);
export function parseConsent(v: string | undefined): boolean | null {
  const t = (v ?? "").toString().trim().toLowerCase();
  if (TRUTHY.has(t)) return true;
  if (FALSY.has(t)) return false;
  return null; // unrecognised → row error
}

// --- Minimal RFC-4180-ish CSV tokenizer (quotes, embedded commas + newlines) ---
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  const s = text.replace(/^﻿/, ""); // strip BOM
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* ignore; \n handles EOL */ }
    else field += c;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((cell) => cell.trim() !== "")); // drop blank lines
}

// Parse raw file content into a header list + array of row objects keyed by normalized header.
export function parseRosterFile(content: string, fileType: RosterFileType): { headers: string[]; rows: RawRow[] } {
  let matrix: string[][];
  if (fileType === "csv") {
    matrix = parseCsv(content);
  } else {
    // xlsx: content is base64-encoded binary
    const wb = XLSX.read(content, { type: "base64" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    matrix = (XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" }) as unknown[][])
      .map((r) => r.map((c) => (c == null ? "" : String(c))))
      .filter((r) => r.some((cell) => cell.trim() !== ""));
  }
  if (matrix.length === 0) return { headers: [], rows: [] };
  const headers = matrix[0].map(normHeader);
  const rows: RawRow[] = matrix.slice(1).map((cells) => {
    const obj: RawRow = {};
    headers.forEach((h, idx) => { obj[h] = (cells[idx] ?? "").toString().trim(); });
    return obj;
  });
  return { headers, rows };
}

export type IngestOptions = {
  fileType: string;
  byteLength?: number;
  maxBytes?: number;
  allowedGrades?: string[] | null; // olympiad-eligible grades; null/undefined → any non-blank grade accepted
  existingKeys?: Set<string>; // dedupe keys already locked/uploaded in this school+participation
};

// Top-level ingest: parse + validate + dedupe. `content` is CSV text or base64 xlsx.
export function ingestRoster(content: string, opts: IngestOptions): IngestResult {
  const file_errors: string[] = [];
  const fileType = (opts.fileType ?? "").toLowerCase();
  const max = opts.maxBytes ?? DEFAULT_MAX_BYTES;

  if (!(ALLOWED_FILE_TYPES as readonly string[]).includes(fileType)) {
    file_errors.push(`Unsupported file type '${opts.fileType}'. Only CSV and XLSX are allowed.`);
  }
  if (opts.byteLength != null && opts.byteLength > max) {
    file_errors.push(`File exceeds the ${Math.round(max / (1024 * 1024))} MB limit.`);
  }
  if (file_errors.length) return emptyResult(file_errors);

  let headers: string[];
  let rows: RawRow[];
  try {
    ({ headers, rows } = parseRosterFile(content, fileType as RosterFileType));
  } catch {
    return emptyResult(["File could not be parsed. Ensure it is a valid CSV or XLSX."]);
  }

  // Forbidden columns reject the whole upload (privacy / mass-assignment).
  const forbidden = headers.filter((h) => FORBIDDEN_COLUMNS.includes(h));
  if (forbidden.length) {
    file_errors.push(`Forbidden column(s) present and must be removed: ${forbidden.join(", ")}.`);
  }
  // Required columns must be present.
  const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  if (missing.length) {
    file_errors.push(`Missing required column(s): ${missing.join(", ")}.`);
  }
  if (file_errors.length) return emptyResult(file_errors);
  if (rows.length === 0) return emptyResult(["File has no data rows."]);

  const allowedGrades = opts.allowedGrades && opts.allowedGrades.length
    ? new Set(opts.allowedGrades.map((g) => g.toString().trim().toLowerCase()))
    : null;

  const valid_rows: IngestRow[] = [];
  const invalid_rows: InvalidRow[] = [];
  const duplicate_rows: DuplicateRow[] = [];
  const seen = new Map<string, number>(); // dedupe_key -> first data-row number
  const existing = opts.existingKeys ?? new Set<string>();

  rows.forEach((data, idx) => {
    const source_row = idx + 1;
    const errors: string[] = [];

    const student_name = (data.student_name ?? "").trim();
    if (!student_name) errors.push("student_name is required.");

    const grade = (data.grade ?? "").trim();
    if (!grade) errors.push("grade is required.");
    else if (allowedGrades && !allowedGrades.has(grade.toLowerCase())) errors.push(`grade '${grade}' is not an eligible grade.`);

    const consent = parseConsent(data.consent_obtained);
    if (consent === null) errors.push("consent_obtained must be a yes/no value.");

    if (errors.length) {
      invalid_rows.push({ source_row, data, errors });
      return;
    }

    const normalized_name = normalizeName(student_name);
    const roll = (data.school_roll_number ?? "").trim();
    const dedupe_key = roll ? `roll:${roll.toLowerCase()}` : `name:${normalized_name}|grade:${grade.toLowerCase()}`;

    if (existing.has(dedupe_key) || seen.has(dedupe_key)) {
      duplicate_rows.push({ source_row, dedupe_key, data, conflicts_with: seen.get(dedupe_key) ?? 0 });
      return;
    }
    seen.set(dedupe_key, source_row);

    valid_rows.push({
      student_name,
      grade,
      section: (data.section ?? "").trim() || null,
      school_roll_number: roll || null,
      parent_guardian_name: (data.parent_guardian_name ?? "").trim() || null,
      parent_contact: (data.parent_contact ?? "").trim() || null,
      consent_obtained: consent as boolean,
      normalized_name,
      dedupe_key,
      source_row,
    });
  });

  const counts = {
    total: rows.length,
    valid: valid_rows.length,
    invalid: invalid_rows.length,
    duplicate: duplicate_rows.length,
  };

  return {
    ok: true,
    file_errors: [],
    valid_rows,
    invalid_rows,
    duplicate_rows,
    counts,
    validation_report: {
      file_errors: [],
      invalid: invalid_rows.map((r) => ({ row: r.source_row, errors: r.errors })),
      summary: counts,
    },
    duplicate_report: {
      keys: Array.from(new Set(duplicate_rows.map((d) => d.dedupe_key))),
      rows: duplicate_rows.map((d) => ({ row: d.source_row, key: d.dedupe_key, conflicts_with: d.conflicts_with })),
    },
  };
}

function emptyResult(file_errors: string[]): IngestResult {
  const counts = { total: 0, valid: 0, invalid: 0, duplicate: 0 };
  return {
    ok: false,
    file_errors,
    valid_rows: [],
    invalid_rows: [],
    duplicate_rows: [],
    counts,
    validation_report: { file_errors, invalid: [], summary: counts },
    duplicate_report: { keys: [], rows: [] },
  };
}

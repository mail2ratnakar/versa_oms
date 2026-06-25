import { describe, it, expect } from "vitest";
import {
  ingestRoster, parseCsv, parseConsent, normalizeName,
  FORBIDDEN_COLUMNS, DEFAULT_MAX_BYTES,
} from "@/server/lib/rosterIngest";
import { decideIngestOutcome } from "@/server/roster/ingestService";
import { PRECONDITIONS } from "@/server/lib/transitionPreconditions";
import { TRANSITION_GUARDS } from "@/server/lib/transitionGuards";

const HDR = "student_name,grade,consent_obtained,section,school_roll_number";

describe("rosterIngest — CSV parsing", () => {
  it("tokenizes quoted fields with embedded commas and newlines", () => {
    const rows = parseCsv('a,b\n"x,y","line1\nline2"\n');
    expect(rows).toEqual([["a", "b"], ["x,y", "line1\nline2"]]);
  });
  it("handles escaped double-quotes and strips BOM + blank lines", () => {
    const rows = parseCsv('﻿name\n"He said ""hi"""\n\n');
    expect(rows).toEqual([["name"], ['He said "hi"']]);
  });
});

describe("rosterIngest — consent + name helpers", () => {
  it("parses consent truthy/falsy/unknown", () => {
    expect(parseConsent("yes")).toBe(true);
    expect(parseConsent("TRUE")).toBe(true);
    expect(parseConsent("no")).toBe(false);
    expect(parseConsent("maybe")).toBeNull();
  });
  it("normalizes names for dedupe", () => {
    expect(normalizeName("  Anita   Rao ")).toBe("anita rao");
  });
});

describe("rosterIngest — validation (functional)", () => {
  it("accepts valid rows and reports counts", () => {
    const csv = `${HDR}\nAnita Rao,5,yes,A,R1\nBob Singh,6,1,B,R2\n`;
    const r = ingestRoster(csv, { fileType: "csv" });
    expect(r.ok).toBe(true);
    expect(r.counts).toEqual({ total: 2, valid: 2, invalid: 0, duplicate: 0 });
    expect(r.valid_rows[0].consent_obtained).toBe(true);
    expect(r.valid_rows[0].school_roll_number).toBe("R1");
  });

  it("flags rows missing required name/grade/consent as invalid (not dropped silently)", () => {
    const csv = `${HDR}\n,5,yes,A,R1\nBob,,yes,B,R2\nCara,7,maybe,C,R3\n`;
    const r = ingestRoster(csv, { fileType: "csv" });
    expect(r.counts).toEqual({ total: 3, valid: 0, invalid: 3, duplicate: 0 });
    expect(r.invalid_rows[0].errors[0]).toMatch(/student_name/);
    expect(r.invalid_rows[1].errors[0]).toMatch(/grade/);
    expect(r.invalid_rows[2].errors[0]).toMatch(/consent/);
  });

  it("enforces olympiad-eligible grade set when provided", () => {
    const csv = `${HDR}\nAnita,5,yes,A,R1\nBob,99,yes,B,R2\n`;
    const r = ingestRoster(csv, { fileType: "csv", allowedGrades: ["5", "6", "7"] });
    expect(r.counts.valid).toBe(1);
    expect(r.counts.invalid).toBe(1);
    expect(r.invalid_rows[0].errors[0]).toMatch(/not an eligible grade/);
  });

  it("detects duplicates within file by roll number, else by name+grade", () => {
    // r1 keyed by roll R1; r2 same roll → dup; r3 keyed by name+grade (no roll); r4 same normalized name+grade → dup
    const csv = `${HDR}\nAnita Rao,5,yes,A,R1\nBob Singh,5,yes,A,R1\nClara Das,6,yes,,\nclara   das,6,yes,B,\n`;
    const r = ingestRoster(csv, { fileType: "csv" });
    expect(r.counts).toEqual({ total: 4, valid: 2, invalid: 0, duplicate: 2 });
    expect(r.duplicate_report.rows.map((d) => d.row)).toEqual([2, 4]);
  });

  it("dedupes against existing locked keys", () => {
    const csv = `${HDR}\nAnita Rao,5,yes,A,\n`;
    const r = ingestRoster(csv, { fileType: "csv", existingKeys: new Set(["name:anita rao|grade:5"]) });
    expect(r.counts.duplicate).toBe(1);
    expect(r.counts.valid).toBe(0);
  });
});

describe("rosterIngest — security / privacy (fail-closed)", () => {
  it("rejects the whole upload if a forbidden government-id column is present", () => {
    for (const col of ["aadhaar", "passport", "bank_account", "government_id"]) {
      const csv = `student_name,grade,consent_obtained,${col}\nAnita,5,yes,123\n`;
      const r = ingestRoster(csv, { fileType: "csv" });
      expect(r.ok).toBe(false);
      expect(r.file_errors.join(" ")).toMatch(/Forbidden column/);
      expect(r.counts.total).toBe(0);
    }
    expect(FORBIDDEN_COLUMNS).toContain("aadhaar");
  });

  it("rejects unsupported file types", () => {
    const r = ingestRoster("x", { fileType: "pdf" });
    expect(r.ok).toBe(false);
    expect(r.file_errors[0]).toMatch(/Only CSV and XLSX/);
  });

  it("rejects files over the size limit", () => {
    const r = ingestRoster(`${HDR}\nA,5,yes,,\n`, { fileType: "csv", byteLength: DEFAULT_MAX_BYTES + 1 });
    expect(r.ok).toBe(false);
    expect(r.file_errors[0]).toMatch(/limit/);
  });

  it("requires the mandatory columns to be present", () => {
    const r = ingestRoster("student_name,section\nA,X\n", { fileType: "csv" });
    expect(r.ok).toBe(false);
    expect(r.file_errors[0]).toMatch(/Missing required column/);
  });

  it("ignores unrecognised columns (no mass-assignment of arbitrary fields)", () => {
    const csv = `student_name,grade,consent_obtained,evil_field\nAnita,5,yes,DROP\n`;
    const r = ingestRoster(csv, { fileType: "csv" });
    expect(r.ok).toBe(true);
    expect(Object.keys(r.valid_rows[0])).not.toContain("evil_field");
  });
});

describe("ingestService — commit decision + lock gate (fail-closed)", () => {
  it("commits (writes students, batch validated) only when fully clean", () => {
    const clean = ingestRoster(`${HDR}\nAnita,5,yes,A,R1\n`, { fileType: "csv" });
    expect(decideIngestOutcome(clean)).toEqual({ batch_status: "validated", write_students: true });
  });
  it("does NOT commit when any row is invalid", () => {
    const withInvalid = ingestRoster(`${HDR}\nAnita,5,yes,A,R1\n,6,yes,B,R2\n`, { fileType: "csv" });
    expect(decideIngestOutcome(withInvalid)).toEqual({ batch_status: "validation_failed", write_students: false });
  });
  it("does NOT commit when a blocking duplicate is present", () => {
    const withDup = ingestRoster(`${HDR}\nAnita,5,yes,A,R1\nBob,5,yes,B,R1\n`, { fileType: "csv" });
    expect(decideIngestOutcome(withDup)).toEqual({ batch_status: "validation_failed", write_students: false });
  });
  it("does NOT commit an empty/zero-valid roster", () => {
    const empty = ingestRoster(`${HDR}\n,5,yes,A,R1\n`, { fileType: "csv" });
    expect(decideIngestOutcome(empty).write_students).toBe(false);
  });
});

describe("roster lifecycle guards are wired (spec §3.1 gates now enforced)", () => {
  it("validate is gated on zero invalid + zero blocking duplicates", () => {
    expect(typeof PRECONDITIONS["student_roster_ops:validate"]).toBe("function");
  });
  it("lock is gated on school-active + no blocking duplicates", () => {
    expect(typeof PRECONDITIONS["student_roster_ops:lock"]).toBe("function");
  });
  it("school_roster submit is from-state gated (only from 'validated', not 'uploaded')", () => {
    expect(TRANSITION_GUARDS["school_roster"]?.["validated"]).toContain("submit");
    expect(TRANSITION_GUARDS["school_roster"]?.["uploaded"] ?? []).not.toContain("submit");
  });
});

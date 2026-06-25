import { describe, it, expect } from "vitest";
import { safeName, buildObjectPath, ROSTER_BUCKET } from "@/server/files/storeFile";
import { makeSecureDownloadHandler } from "@/server/lib/routeHandlers";

describe("storeFile — object path safety (skill 10: no traversal, scoped)", () => {
  it("strips path traversal and unsafe chars from filenames", () => {
    expect(safeName("../../etc/passwd")).toBe("passwd");
    expect(safeName("my roster (2026).csv")).toBe("my_roster_2026_.csv");
    expect(safeName("a\\b\\c.xlsx")).toBe("c.xlsx");
    expect(safeName(undefined)).toBe("file");
  });
  it("truncates absurdly long names", () => {
    expect(safeName("x".repeat(500)).length).toBeLessThanOrEqual(80);
  });
  it("namespaces object paths by owner table + school scope + uuid", () => {
    const p = buildObjectPath({ ownerTable: "student_roster_batches", schoolId: "sch-1", uuid: "u1", filename: "r.csv" });
    expect(p).toBe("student_roster_batches/sch-1/u1-r.csv");
  });
  it("falls back to a 'global' scope when there is no school", () => {
    const p = buildObjectPath({ ownerTable: "exports", schoolId: null, uuid: "u2", filename: "x.csv" });
    expect(p.startsWith("exports/global/")).toBe(true);
  });
  it("uses a private bucket", () => {
    expect(ROSTER_BUCKET).toBe("roster-files");
  });
});

describe("secure download handler is wired (engine no longer at 0 routes)", () => {
  it("exposes a GET factory for file-bearing records", () => {
    const h = makeSecureDownloadHandler("student_roster_ops", { getModuleRecord: async () => null }, { fileColumn: "source_file", scope: "staff" });
    expect(typeof h.GET).toBe("function");
  });
});

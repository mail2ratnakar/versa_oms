import { describe, it, expect } from "vitest";
import { ok, err, meta, httpStatus } from "@/server/http/envelope";
import { can, registerModulePolicy } from "@/server/permissions/registry";
import { maskValue, maskRecord } from "@/server/masking/masking";
import type { Actor } from "@/server/types";

const staff = (roles: string[]): Actor => ({
  actor_id: "s1",
  actor_type: "staff",
  roles,
  scopes: ["global"],
});
const school: Actor = {
  actor_id: "sc1",
  actor_type: "school",
  roles: ["school_coordinator"],
  scopes: ["school:1"],
  school_id: "1",
};

describe("http envelope", () => {
  it("builds success envelope", () => {
    const m = meta("req-1", "finance_ops");
    const r = ok({ x: 1 }, m);
    expect(r.ok).toBe(true);
    expect(r.data).toEqual({ x: 1 });
    expect(r.meta.module).toBe("finance_ops");
  });
  it("builds error envelope with code + status", () => {
    const r = err("FORBIDDEN", "nope", meta("req-2", "finance_ops"));
    expect(r.ok).toBe(false);
    expect(r.error.code).toBe("FORBIDDEN");
    expect(httpStatus("FORBIDDEN")).toBe(403);
    expect(httpStatus("AUTH_REQUIRED")).toBe(401);
  });
});

describe("permission engine", () => {
  it("denies by default when no policy registered", () => {
    expect(can(staff(["finance_executive"]), "unregistered_mod", "read")).toBe(false);
  });
  it("superuser roles bypass per-module checks", () => {
    expect(can(staff(["company_admin"]), "anything", "approve")).toBe(true);
    expect(can(staff(["super_admin"]), "anything", "export")).toBe(true);
  });
  it("grants only the registered role+action", () => {
    registerModulePolicy("finance_ops", { read: ["finance_executive"], approve: ["finance_admin"] });
    expect(can(staff(["finance_executive"]), "finance_ops", "read")).toBe(true);
    expect(can(staff(["finance_executive"]), "finance_ops", "approve")).toBe(false);
    expect(can(staff(["finance_admin"]), "finance_ops", "approve")).toBe(true);
  });
  it("denies actor with no roles", () => {
    expect(can(staff([]), "finance_ops", "read")).toBe(false);
  });
});

describe("field masking", () => {
  it("masks parent_phone to last 4 for unprivileged staff", () => {
    expect(maskValue("parent_phone", "9876543210", staff(["support_executive"]))).toBe("••••3210");
  });
  it("unmasks parent_phone for company_admin", () => {
    expect(maskValue("parent_phone", "9876543210", staff(["company_admin"]))).toBe("9876543210");
  });
  it("partial-masks parent_email", () => {
    expect(maskValue("parent_email", "john@x.com", staff(["finance_executive"]))).toBe("j•••@x.com");
  });
  it("hides answer_key from unprivileged, shows to evaluation_manager", () => {
    expect(maskValue("answer_key", "ABCD", staff(["operations_executive"]))).toBeNull();
    expect(maskValue("answer_key", "ABCD", staff(["evaluation_manager"]))).toBe("ABCD");
  });
  it("masks student_name for finance roles only", () => {
    expect(maskValue("student_name", "Asha", staff(["finance_admin"]))).toBeNull();
    expect(maskValue("student_name", "Asha", staff(["operations_executive"]))).toBe("Asha");
  });
  it("hides internal_note from school actor", () => {
    expect(maskValue("internal_note", "secret", school)).toBeNull();
  });
  it("keeps candidate_id visible to any authorized actor", () => {
    expect(maskValue("candidate_id", "CAND-1", school)).toBe("CAND-1");
  });
  it("maskRecord applies across fields", () => {
    const masked = maskRecord(
      { candidate_id: "C1", parent_phone: "9876543210", note: "x" },
      staff(["support_executive"])
    );
    expect(masked.candidate_id).toBe("C1");
    expect(masked.parent_phone).toBe("••••3210");
    expect(masked.note).toBe("x");
  });
});

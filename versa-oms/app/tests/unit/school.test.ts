import { describe, it, expect } from "vitest";
import * as students from "@/server/modules/school_students/service";
import * as payments from "@/server/modules/school_payments/service";
import { ValidationError } from "@/server/lib/defineModule";
import type { Actor } from "@/server/types";

const school: Actor = {
  actor_id: "school-actor",
  actor_type: "school",
  roles: ["school_coordinator"],
  scopes: ["school:s-1"],
  school_id: "s-1",
};

describe("school portal services (school-scoped)", () => {
  it("rejects an invalid roster upload", async () => {
    await expect(
      students.createModuleRecord({ actor: school, payload: {}, idempotencyKey: "sk-1" })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("accepts a valid roster upload and stamps the school's id", async () => {
    const rec = await students.createModuleRecord({
      actor: school,
      payload: { student_name: "Ravi", grade: "5", consent_obtained: true },
      idempotencyKey: "sk-2",
    });
    expect(typeof rec.id).toBe("string");
    expect(rec.school_id).toBe("s-1");
  });

  it("payments list returns the standard pagination envelope", async () => {
    const res = (await payments.listModuleRecords({
      actor: school,
      searchParams: new URLSearchParams(),
    })) as { pagination: { page: number } };
    expect(res.pagination.page).toBe(1);
  });
});

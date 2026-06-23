import { describe, it, expect } from "vitest";
import { ok, err, meta, httpStatus } from "@/server/http/envelope";

describe("API contract: standard envelopes", () => {
  it("success envelope has ok/data/meta with required meta fields", () => {
    const m = meta("req-1", "finance_ops", "audit-1");
    const r = ok({ x: 1 }, m);
    expect(r.ok).toBe(true);
    expect(r.data).toEqual({ x: 1 });
    expect(r.meta).toMatchObject({ request_id: "req-1", module: "finance_ops", audit_event_id: "audit-1" });
    expect(typeof r.meta.server_time).toBe("string");
  });

  it("error envelope is standardized with code/message/details/field_errors", () => {
    const r = err("VALIDATION_FAILED", "bad", meta("req-2", "staff_users"), {
      field_errors: [{ field: "email", message: "Required" }],
    });
    expect(r.ok).toBe(false);
    expect(r.error.code).toBe("VALIDATION_FAILED");
    expect(Array.isArray(r.error.details)).toBe(true);
    expect(Array.isArray(r.error.field_errors)).toBe(true);
    expect(r.error.field_errors[0]).toEqual({ field: "email", message: "Required" });
  });

  it("maps error codes to the correct HTTP status", () => {
    expect(httpStatus("AUTH_REQUIRED")).toBe(401);
    expect(httpStatus("FORBIDDEN")).toBe(403);
    expect(httpStatus("NOT_FOUND")).toBe(404);
    expect(httpStatus("VALIDATION_FAILED")).toBe(422);
    expect(httpStatus("CONFLICT")).toBe(409);
    expect(httpStatus("RATE_LIMITED")).toBe(429);
  });
});

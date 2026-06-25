import { test, expect } from "@playwright/test";

// Negative pack GLOBAL-VALID-002 / GLOBAL-FILE-002 — oversized request body. A body over the JSON limit
// (1MB) is rejected with 413 before reaching the handler; a normal body is processed (not 413).
test("oversized JSON body is rejected with 413 (GLOBAL-VALID-002)", async ({ request }) => {
  const huge = "x".repeat(1_200_000); // ~1.2MB > 1MB JSON cap
  const res = await request.post("/api/staff/reports/exports", {
    headers: { "content-type": "application/json", "x-idempotency-key": `big-${Date.now()}` },
    data: { reason: huge, sensitivity_level: "restricted" },
  });
  expect(res.status(), "oversized body blocked").toBe(413);
  const body = await res.json();
  expect(body.error.code).toBe("PAYLOAD_TOO_LARGE");
});

test("a normal-sized body is NOT blocked by the size guard (GLOBAL-VALID-002 control)", async ({ request }) => {
  const res = await request.post("/api/staff/reports/exports", {
    headers: { "content-type": "application/json", "x-idempotency-key": `ok-${Date.now()}` },
    data: { reason: "normal sized reason", sensitivity_level: "restricted" },
  });
  expect(res.status(), "normal body passes the size guard").not.toBe(413);
});

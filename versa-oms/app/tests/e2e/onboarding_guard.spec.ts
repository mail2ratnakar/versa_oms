import { test, expect } from "@playwright/test";

// Fix #2 — lifecycle guard: an action invalid from the current status is rejected server-side.
test("cannot re-submit an already-submitted onboarding case", async ({ request }) => {
  const list = (await (await request.get("/api/staff/schools/onboarding")).json()).data;
  const submitted = (list.items as Array<Record<string, unknown>>).find((c) => c.onboarding_status === "submitted");
  test.skip(!submitted, "no submitted case available");

  const res = await request.post(`/api/staff/schools/onboarding/${submitted!.id}/actions/submit`, {
    headers: { "content-type": "application/json" },
    data: { reason: "x" },
  });
  const body = await res.json();
  expect(body.ok).toBe(false);
  expect(JSON.stringify(body.error)).toContain("submitted"); // "Cannot 'submit' from status 'submitted'."
});

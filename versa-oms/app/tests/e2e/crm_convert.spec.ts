import { test, expect } from "@playwright/test";

// JRN / CHAIN-001 — converting a CRM lead must open the downstream onboarding case + task
// and surface it in the onboarding queue (not just create a school).
const idem = () => ({ "content-type": "application/json", "x-idempotency-key": crypto.randomUUID() });

test("CHAIN-001: convert lead → school + onboarding case + task + queue update", async ({ request }) => {
  const name = "E2E Convert " + crypto.randomUUID().slice(0, 8);

  // create a lead
  const cr = await request.post("/api/staff/schools/crm", { headers: idem(), data: { school_name: name, city: "Delhi", state: "Delhi", lead_source: "referral" } });
  expect(cr.status()).toBe(201);
  const leadId = (await cr.json()).data.lead.id as string;

  // onboarding queue size before
  const beforeCount = (await (await request.get("/api/staff/schools/onboarding")).json()).data.pagination.total_count as number;

  // convert
  const conv = await request.post(`/api/staff/schools/crm/${leadId}/convert`, { headers: idem() });
  expect(conv.status()).toBe(200);
  const cd = (await conv.json()).data;
  expect(cd.lead_status).toBe("converted");      // 1
  expect(cd.converted_school_id).toBeTruthy();    // 2
  expect(cd.onboarding_case_id).toBeTruthy();     // 3
  expect(cd.task_id).toBeTruthy();                // 4

  // 5 — the onboarding queue grew and the new case is visible + submitted + linked to the lead
  const after = (await (await request.get("/api/staff/schools/onboarding")).json()).data;
  expect(after.pagination.total_count).toBe(beforeCount + 1);
  const found = after.items.find((c: Record<string, unknown>) => c.school_name === name);
  expect(found).toBeTruthy();
  expect(found.onboarding_status).toBe("submitted");
  expect(found.source_lead_id).toBe(leadId);
});

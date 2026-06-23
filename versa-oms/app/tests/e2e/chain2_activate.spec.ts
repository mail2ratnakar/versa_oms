import { test, expect } from "@playwright/test";

// CHAIN-002 — onboarding activation → school portal access.
const idem = () => ({ "content-type": "application/json", "x-idempotency-key": crypto.randomUUID() });
const json = { "content-type": "application/json" };

test("CHAIN-002: approve + activate onboarding → school active + portal + roster enabled", async ({ request }) => {
  const name = "E2E Chain2 " + crypto.randomUUID().slice(0, 8);

  // lead → convert (CHAIN-001 gives us the onboarding case + school)
  const leadId = (await (await request.post("/api/staff/schools/crm", { headers: idem(), data: { school_name: name, city: "Delhi", state: "Delhi", lead_source: "referral" } })).json()).data.lead.id as string;
  const conv = (await (await request.post(`/api/staff/schools/crm/${leadId}/convert`, { headers: idem() })).json()).data;
  const caseId = conv.onboarding_case_id as string;
  const schoolId = conv.converted_school_id as string;
  expect(caseId).toBeTruthy();

  // approve (reason required) → activate
  const ap = await request.post(`/api/staff/schools/onboarding/${caseId}/actions/approve`, { headers: json, data: { reason: "documents verified" } });
  expect((await ap.json()).ok).toBe(true);
  const act = await request.post(`/api/staff/schools/onboarding/${caseId}/actions/activate`, { headers: json, data: {} });
  expect((await act.json()).ok).toBe(true);

  // effects: school is active, portal + roster upload enabled
  const schools = (await (await request.get("/api/staff/core/schools?page_size=100")).json()).data.items as Array<Record<string, unknown>>;
  const school = schools.find((s) => s.id === schoolId);
  expect(school).toBeTruthy();
  expect(school!.status).toBe("active");
  expect(school!.portal_enabled).toBe(true);
  expect(school!.roster_upload_enabled).toBe(true);
});

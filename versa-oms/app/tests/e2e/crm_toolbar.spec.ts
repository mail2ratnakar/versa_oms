import { test, expect } from "@playwright/test";

// Unit tests for the CRM list toolbar + pagination (P4.6: test each unit).
// Covers the bug class that shipped: a record past page 1 must remain reachable; counts != visibility.
const idem = () => ({ "content-type": "application/json", "x-idempotency-key": crypto.randomUUID() });
const CRM = "/api/staff/schools/crm";
type Row = Record<string, unknown>;
const get = async (request: any, qs: string) => (await (await request.get(`${CRM}?${qs}`)).json()).data;

test("CRM toolbar: stage filter, facets, search, and pagination all surface a new lead", async ({ request }) => {
  const tag = `TB${Date.now().toString().slice(-7)}`;
  const name = `Zzz ${tag} School`; // 'Zzz' so it sorts last by name — must still be reachable
  const cr = await request.post(CRM, { headers: idem(), data: { school_name: name, city: "Pune", state: "Maharashtra", country: "India", board: "CBSE", lead_source: "referral" } });
  expect(cr.status()).toBe(201);

  // unit 1 — stage=new_lead filter surfaces the fresh lead
  const byStage = await get(request, "stage=new_lead&page_size=100&facet=stage");
  expect((byStage.items as Row[]).some((i) => i.school_name === name)).toBe(true);

  // unit 2 — facet counts present + internally consistent (sum of stage counts == _all)
  const f = byStage.facets as Record<string, number>;
  expect(f.new_lead).toBeGreaterThanOrEqual(1);
  const sum = Object.entries(f).filter(([k]) => k !== "_all").reduce((a, [, v]) => a + v, 0);
  expect(sum).toBe(f._all);

  // unit 3 — search finds it by the distinctive tag
  const bySearch = await get(request, `q=${encodeURIComponent(tag)}`);
  expect((bySearch.items as Row[]).some((i) => i.school_name === name)).toBe(true);

  // unit 4 — pagination: with a small page size the total exceeds the page and page 2 is reachable + distinct
  const p1 = await get(request, "page_size=5&page=1");
  expect(p1.pagination.total_count).toBeGreaterThan(5);
  expect(p1.pagination.has_next).toBe(true);
  const ids1 = (p1.items as Row[]).map((i) => i.id);
  const p2 = await get(request, "page_size=5&page=2");
  expect((p2.items as Row[]).some((i) => !ids1.includes(i.id))).toBe(true);

  // unit 5 — sort direction actually changes ordering
  const asc = (await get(request, "sort=created_at:asc&page_size=5")).items as Row[];
  const desc = (await get(request, "sort=created_at:desc&page_size=5")).items as Row[];
  expect(String(asc[0]?.id)).not.toBe(String(desc[0]?.id));
});

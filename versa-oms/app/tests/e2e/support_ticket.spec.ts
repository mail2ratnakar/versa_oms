import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// WF-010 Support Ticket to Resolution (FR-SUPPORT-CHAIN-2026-0023). A school raises a ticket; staff work
// it (internal note + a school-visible reply) and resolve it; the school sees the resolution + the
// school-visible reply but NEVER the internal note. Own-school only. Fixture: seed_chain3.sql
// (E2E-CH3-SCH + an active support category E2E-SUPCAT).
function admin() {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

test("support: school raises a ticket; resolution + school-visible reply shown, internal note hidden, cross-school blocked", async ({ request }) => {
  const sb = admin();
  const sch = (await sb.from("schools").select("id").eq("school_code", "E2E-CH3-SCH").maybeSingle()).data?.id as string | undefined;
  const other = (await sb.from("schools").select("id").neq("school_code", "E2E-CH3-SCH").limit(1)).data?.[0]?.id as string | undefined;
  const cat = (await sb.from("support_ticket_categories").select("id").eq("category_status", "active").limit(1).maybeSingle()).data?.id as string | undefined;
  test.skip(!sch || !other || !cat, "run _validation/seed_chain3.sql (school + active support category)");

  // School raises a ticket (server-generated code).
  const create = await (await request.post("/api/school/support", { headers: { "content-type": "application/json", "x-dev-school": sch! }, data: { subject: "Cannot download materials", description: "The link expired before the exam." } })).json();
  expect(create.ok, "ticket raised").toBe(true);
  expect(String(create.data.ticket_code)).toMatch(/^TIC-/);
  const tid = String(create.data.id);

  // Staff work it: an INTERNAL note (staff_only) + a SCHOOL-VISIBLE reply, then resolve.
  const secret = `SECRET internal ${Date.now()}`;
  const reply = `We re-sent your link ${Date.now()}`;
  await sb.from("support_ticket_messages").insert([
    { ticket_id: tid, message_type: "internal_note", visibility: "staff_only", body: secret, author_type: "staff", message_status: "active" },
    { ticket_id: tid, message_type: "staff_reply", visibility: "school_visible", body: reply, author_type: "staff", message_status: "active" },
  ]);
  await sb.from("support_tickets").update({ ticket_status: "resolved", resolution_summary: "Link re-sent" }).eq("id", tid);

  // The school sees the resolution + the school-visible reply, but NOT the internal note.
  const view = (await (await request.get(`/api/school/support/${tid}`, { headers: { "x-dev-school": sch! } })).json()).data as { ticket: Record<string, unknown>; messages: Array<Record<string, unknown>> };
  expect(view.ticket.ticket_status, "school sees resolved").toBe("resolved");
  const bodies = view.messages.map((m) => String(m.body));
  expect(bodies, "school-visible reply shown").toContain(reply);
  expect(bodies.some((b) => b.includes("SECRET")), "internal note NEVER leaked to the school").toBe(false);
  expect(view.ticket.school_id, "no internal routing echoed").toBeUndefined();

  // Another school cannot read this ticket.
  expect((await request.get(`/api/school/support/${tid}`, { headers: { "x-dev-school": other! } })).status(), "cross-school 404").toBe(404);
});

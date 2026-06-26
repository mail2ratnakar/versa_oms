"use client";
// WF-010 Support (FR-SUPPORT-CHAIN-2026-0023; design-conformant FR-DESIGN-SYSTEM-2026-0043) — school portal:
// raise a support request (UPSTREAM) and track its status + resolution (DOWNSTREAM). Internal staff notes
// are never shown here. Composed from the Versa design system (PageHeader/Card/Section/Field/StatusBadge).
import { useCallback, useEffect, useState } from "react";
import { PageHeader, Card, Section, FormSection, Field, StatusBadge, EmptyState } from "@/components/design";

type Ticket = { id: string; ticket_code: string; subject: string; ticket_status: string; resolution_summary?: string | null };

export function SchoolSupportView() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/school/support");
    const json = await res.json();
    if (json.ok) setTickets(json.data.items as Ticket[]);
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/school/support", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ subject, description }) });
      const json = await res.json();
      if (json.ok) { setMsg(`Ticket ${json.data.ticket_code} raised — we'll respond here.`); setSubject(""); setDescription(""); }
      else setMsg(json.error?.message ?? "Could not raise the ticket.");
    } finally { setBusy(false); void load(); }
  }

  return (
    <section className="ds-page">
      <PageHeader
        eyebrow="school · support"
        title="Support"
        description="Raise a support request and track its status and resolution. Our team replies here; you only see your own school's tickets."
        breadcrumbs={[{ label: "School", href: "/school/dashboard" }, { label: "Support" }]}
        nextAction="→ Describe your issue below to raise a ticket."
      />

      <Card>
        <Section title="Raise a ticket">
          <form onSubmit={submit}>
            <FormSection>
              <Field label="Subject"><input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Short summary of the issue" required /></Field>
              <Field label="Describe your issue" help="Include any reference codes (invoice, roster, slot) so we can help faster.">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
              </Field>
              <div><button className="btn btn-blue" type="submit" disabled={busy}>{busy ? "Raising…" : "Raise ticket"}</button></div>
            </FormSection>
          </form>
          {msg && <p role="status" style={{ marginTop: 8 }}>{msg}</p>}
        </Section>
      </Card>

      <Card>
        <Section title="Your tickets">
          {tickets.length === 0 ? (
            <EmptyState>You haven&apos;t raised any tickets yet. Use the form above if you need help.</EmptyState>
          ) : (
            <table className="ds-stack">
              <thead><tr><th>Ticket</th><th>Subject</th><th>Status</th><th>Resolution</th></tr></thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td data-label="Ticket">{t.ticket_code}</td>
                    <td data-label="Subject">{t.subject}</td>
                    <td data-label="Status"><StatusBadge status={t.ticket_status} /></td>
                    <td data-label="Resolution">{t.resolution_summary ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      </Card>
    </section>
  );
}

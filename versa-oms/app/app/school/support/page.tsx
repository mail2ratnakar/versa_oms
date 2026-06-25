"use client";
// WF-010 Support (FR-SUPPORT-CHAIN-2026-0023) — school portal: raise a support ticket (UPSTREAM) and
// see your tickets' status + resolution (DOWNSTREAM). Internal staff notes are never shown here.
import { useCallback, useEffect, useState } from "react";

type Ticket = { id: string; ticket_code: string; subject: string; ticket_status: string; sla_status?: string; resolution_summary?: string | null };

export default function Page() {
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
      if (json.ok) { setMsg(`Ticket ${json.data.ticket_code} raised.`); setSubject(""); setDescription(""); }
      else setMsg(json.error?.message ?? "Could not raise the ticket.");
    } finally { setBusy(false); void load(); }
  }

  return (
    <section className="module-view">
      <header>
        <p className="eyebrow">school · support</p>
        <h1>Support</h1>
      </header>
      <form onSubmit={submit} style={{ display: "grid", gap: "0.5rem", maxWidth: 520 }}>
        <input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        <textarea placeholder="Describe your issue" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required />
        <button className="btn btn-blue" type="submit" disabled={busy}>{busy ? "Raising…" : "Raise ticket"}</button>
      </form>
      {msg && <p role="status">{msg}</p>}
      <table>
        <thead><tr><th>Ticket</th><th>Subject</th><th>Status</th><th>Resolution</th></tr></thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id}><td>{t.ticket_code}</td><td>{t.subject}</td><td>{t.ticket_status}</td><td>{t.resolution_summary ?? "—"}</td></tr>
          ))}
          {tickets.length === 0 && <tr><td colSpan={4}>No tickets yet.</td></tr>}
        </tbody>
      </table>
    </section>
  );
}

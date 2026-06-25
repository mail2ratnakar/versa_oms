"use client";
// WF-011 Sensitive Export (FR-EXPORT-CHAIN-0024) — staff: request a sensitive export (UPSTREAM) and,
// once two staff have approved (maker-checker), generate + securely download it (DOWNSTREAM).
import { useCallback, useEffect, useState } from "react";

type Req = { id: string; export_code: string; sensitivity_level: string; reason: string; export_status: string };

export default function Page() {
  const [items, setItems] = useState<Req[]>([]);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/staff/reports/exports");
    const j = await r.json();
    if (j.ok) setItems(j.data.items as Req[]);
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function request(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/staff/reports/exports", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ reason, sensitivity_level: "restricted" }) });
      const j = await r.json();
      setMsg(j.ok ? `Requested ${j.data.export_code} — awaiting maker-checker approval.` : (j.error?.message ?? "Request failed."));
      if (j.ok) setReason("");
    } finally { setBusy(false); void load(); }
  }
  async function generate(id: string) {
    setMsg(null);
    const j = await (await fetch(`/api/staff/reports/exports/${id}/generate`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).json();
    setMsg(j.ok ? `Generated ${j.data.file_code}.` : (j.error?.message ?? "Generate failed."));
    void load();
  }
  async function download(id: string) {
    setMsg(null);
    const j = await (await fetch(`/api/staff/reports/exports/${id}/download`)).json();
    if (j.ok && j.data.download_url) window.open(j.data.download_url as string, "_blank");
    else setMsg(j.error?.message ?? "Download unavailable.");
  }

  return (
    <section className="module-view">
      <header><p className="eyebrow">staff · reports</p><h1>Sensitive Exports</h1></header>
      <p>Request a sensitive export. It must be approved by two staff (maker-checker) before it can be generated, then it is downloaded via a short-lived signed URL.</p>
      <form onSubmit={request} style={{ display: "grid", gap: "0.5rem", maxWidth: 520 }}>
        <input placeholder="Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} required />
        <button className="btn btn-blue" type="submit" disabled={busy}>{busy ? "Requesting…" : "Request export"}</button>
      </form>
      {msg && <p role="status">{msg}</p>}
      <table>
        <thead><tr><th>Export</th><th>Sensitivity</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td>{it.export_code}</td><td>{it.sensitivity_level}</td><td>{it.export_status}</td>
              <td>
                {it.export_status === "approved" && <button onClick={() => generate(it.id)}>Generate</button>}
                {it.export_status === "generated" && <button onClick={() => download(it.id)}>Download</button>}
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={4}>No export requests yet.</td></tr>}
        </tbody>
      </table>
    </section>
  );
}

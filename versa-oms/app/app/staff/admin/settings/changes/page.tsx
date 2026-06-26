"use client";
// WF-014 Admin Setting Change Governance (FR-ADMIN-SETTINGS-CHAIN-0025) — staff propose a governed
// setting change (UPSTREAM) and track its status (DOWNSTREAM). Approve + apply are two-person actions.
import { useCallback, useEffect, useState } from "react";
import { PageHeader, StatusBadge } from "@/components/design";

type CR = { id: string; change_request_code: string; change_type: string; reason: string; request_status: string };

export default function Page() {
  const [items, setItems] = useState<CR[]>([]);
  const [key, setKey] = useState("");
  const [val, setVal] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const j = await (await fetch("/api/staff/admin/settings/changes")).json();
    if (j.ok) setItems(j.data.items as CR[]);
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function propose(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim() || !val.trim() || !reason.trim()) return;
    setBusy(true); setMsg(null);
    try {
      const j = await (await fetch("/api/staff/admin/settings/changes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ setting_key: key, new_value: val, reason }) })).json();
      setMsg(j.ok ? `Proposed ${j.data.change_request_code} — awaiting maker-checker approval + apply.` : (j.error?.message ?? "Propose failed."));
      if (j.ok) { setKey(""); setVal(""); setReason(""); }
    } finally { setBusy(false); void load(); }
  }

  return (
    <section className="ds-page">
      <PageHeader eyebrow="staff · admin settings" title="Setting Changes" description="Propose a governed setting change. It must be approved and applied by two staff (maker-checker); applying activates the new version." breadcrumbs={[{ label: "Staff", href: "/staff/dashboard" }, { label: "Admin Settings", href: "/staff/admin/settings" }, { label: "Setting Changes" }]} />
      <p>Propose a governed setting change. It must be approved AND applied by two staff each (maker-checker); applying activates the new version and supersedes the old.</p>
      <form onSubmit={propose} style={{ display: "grid", gap: "0.5rem", maxWidth: 520 }}>
        <input placeholder="Setting key" value={key} onChange={(e) => setKey(e.target.value)} required />
        <input placeholder="New value" value={val} onChange={(e) => setVal(e.target.value)} required />
        <input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} required />
        <button className="btn btn-blue" type="submit" disabled={busy}>{busy ? "Proposing…" : "Propose change"}</button>
      </form>
      {msg && <p role="status">{msg}</p>}
      <table>
        <thead><tr><th>Request</th><th>Type</th><th>Reason</th><th>Status</th></tr></thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}><td>{it.change_request_code}</td><td>{it.change_type.replace(/_/g, " ")}</td><td>{it.reason}</td><td><StatusBadge status={it.request_status} /></td></tr>
          ))}
          {items.length === 0 && <tr><td colSpan={4}>No change requests yet.</td></tr>}
        </tbody>
      </table>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";

const STAGES = ["new_lead", "contacted", "brochure_sent", "demo_scheduled", "demo_completed", "proposal_sent", "follow_up", "payment_pending", "converted", "lost"];
const LEAD_SOURCES = ["manual", "csv_import", "xlsx_import", "website", "referral", "event", "social", "email_campaign", "partner", "other"];
type Lead = Record<string, unknown>;
const idem = () => ({ "content-type": "application/json", "x-idempotency-key": crypto.randomUUID() });

function chip(status: string): string {
  const s = (status || "").toLowerCase();
  if (/(converted|active|paid|done)/.test(s)) return "chip-green";
  if (/(lost|stale|rejected)/.test(s)) return "chip-red";
  if (/(proposal|demo|payment|followup|contacted)/.test(s)) return "chip-yellow";
  return "chip-blue";
}

export function CrmView() {
  const [tab, setTab] = useState<"leads" | "import">("leads");
  const [rows, setRows] = useState<Lead[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const [commsFor, setCommsFor] = useState<string | null>(null);
  const [comms, setComms] = useState<Lead[]>([]);
  const [note, setNote] = useState("");

  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await fetch("/api/staff/schools/crm", { headers: { "x-request-id": crypto.randomUUID() } });
      const b = await r.json();
      if (b.ok) setRows(b.data?.items ?? []);
      else setError(b.error?.message ?? "Load failed");
    } catch {
      setError("Network error");
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const call = async (url: string, body?: unknown, method = "POST") => {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(url, { method, headers: idem(), body: body ? JSON.stringify(body) : undefined });
      const b = await r.json();
      if (!b.ok) {
        const fe = b.error?.field_errors?.map((f: { field: string; message: string }) => `${f.field}: ${f.message}`).join(", ");
        setError(fe || b.error?.message || "Action failed");
        return null;
      }
      return b;
    } finally {
      setBusy(false);
    }
  };

  const createLead = async () => {
    const b = await call("/api/staff/schools/crm", form);
    if (b) {
      setNotice(b.data?.duplicate_warning ? "Lead created — ⚠ possible duplicate of an existing lead." : "Lead created.");
      setShowNew(false);
      setForm({});
      await load();
    }
  };
  const setStage = async (id: string, stage: string) => { if (await call(`/api/staff/schools/crm/${id}/stage`, { stage })) await load(); };
  const assign = async (id: string) => { const o = window.prompt("Owner staff UUID:"); if (o && (await call(`/api/staff/schools/crm/${id}/assign`, { lead_owner_id: o }))) await load(); };
  const convert = async (id: string) => { if (window.confirm("Convert this lead to a school?") && (await call(`/api/staff/schools/crm/${id}/convert`))) { setNotice("Lead converted — school record created."); await load(); } };
  const lost = async (id: string) => { const reason = window.prompt("Lost reason (required):"); if (reason && (await call(`/api/staff/schools/crm/${id}/lost`, { reason }))) await load(); };

  const openComms = async (id: string) => {
    setCommsFor(id);
    const r = await fetch(`/api/staff/schools/crm/${id}/interactions`);
    const b = await r.json();
    setComms(b.ok ? b.data?.items ?? [] : []);
  };
  const addComm = async () => { if (commsFor && (await call(`/api/staff/schools/crm/${commsFor}/interactions`, { channel: "note", note }))) { setNote(""); await openComms(commsFor); } };

  const runImport = async () => {
    const leads = importText.split("\n").map((l) => l.trim()).filter(Boolean).map((line) => {
      const [school_name, city, email, phone] = line.split(",").map((x) => x.trim());
      return { school_name, city, email, phone };
    });
    const b = await call("/api/staff/schools/crm/import", { leads });
    if (b) {
      setImportResult(`Imported ${b.data?.imported}, skipped ${b.data?.duplicates_skipped} duplicate(s).`);
      await load();
    }
  };

  const id = (r: Lead) => String(r.id ?? "");

  return (
    <section className="module-view">
      <div className="page-head">
        <div>
          <span className="eyebrow"><span className="dot" />staff · school_crm</span>
          <h1 style={{ marginTop: 10 }}>School CRM</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className={`btn ${tab === "leads" ? "btn-dark" : "btn-light"}`} onClick={() => setTab("leads")}>Leads</button>
          <button className={`btn ${tab === "import" ? "btn-dark" : "btn-light"}`} onClick={() => setTab("import")}>Import</button>
          {tab === "leads" ? <button className="btn btn-blue" onClick={() => setShowNew(true)}>New lead</button> : null}
        </div>
      </div>

      {error ? <div className="chip chip-red" style={{ alignSelf: "flex-start" }}>{error}</div> : null}
      {notice ? <div className="chip chip-green" style={{ alignSelf: "flex-start" }}>{notice}</div> : null}

      {tab === "leads" ? (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr><th>Lead code</th><th>School</th><th>City</th><th>Stage</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={6} className="state">No leads yet. Add one or import a list.</td></tr>
              ) : rows.map((r) => (
                <tr key={id(r)}>
                  <td>{String(r.lead_code ?? "—")}</td>
                  <td>{String(r.school_name ?? "—")}</td>
                  <td>{String(r.city ?? "—")}</td>
                  <td>
                    <select className="input" style={{ height: 30, padding: "0 8px", minWidth: 130 }} value={String(r.stage ?? "new_lead")} disabled={busy} onChange={(e) => void setStage(id(r), e.target.value)}>
                      {STAGES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                    </select>
                  </td>
                  <td><span className={`chip ${chip(String(r.lead_status ?? ""))}`}>{String(r.lead_status ?? "active").replace(/_/g, " ")}</span></td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-light" disabled={busy} onClick={() => void openComms(id(r))}>Comms</button>
                      <button className="btn btn-light" disabled={busy} onClick={() => void assign(id(r))}>Assign</button>
                      <button className="btn btn-blue" disabled={busy} onClick={() => void convert(id(r))}>Convert</button>
                      <button className="btn btn-light" disabled={busy} onClick={() => void lost(id(r))}>Lost</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <h2>Import leads</h2>
          <p>One lead per line: <code>School name, City, email, phone</code>. Duplicates are detected and skipped.</p>
          <textarea className="input" style={{ height: 160, padding: 12, width: "100%", resize: "vertical" }} value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={"Delhi Public School, Delhi, dps@x.com, 9876543210\nSt Marys, Mumbai, sm@x.com, 9811111111"} />
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button className="btn btn-dark" disabled={busy} onClick={() => void runImport()}>Import</button>
            {importResult ? <span className="chip chip-green">{importResult}</span> : null}
          </div>
        </div>
      )}

      {showNew ? (
        <div className="modal-backdrop" onClick={() => setShowNew(false)}>
          <div className="modal-body glass-strong" onClick={(e) => e.stopPropagation()}>
            <h2>New lead</h2>
            <div className="form-grid">
              {[["school_name", "School name *"], ["city", "City *"], ["state", "State *"], ["lead_source", "Lead source *"], ["board", "Board"], ["email", "Email"], ["phone", "Phone"], ["coordinator_name", "Coordinator"]].map(([k, label]) => (
                <div className="field" key={k}>
                  <label htmlFor={k}>{label}</label>
                  {k === "lead_source" ? (
                    <select id={k} className="input" value={form[k] ?? ""} onChange={(e) => setForm((s) => ({ ...s, [k]: e.target.value }))}>
                      <option value="">Select…</option>
                      {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                    </select>
                  ) : (
                    <input id={k} className="input" value={form[k] ?? ""} onChange={(e) => setForm((s) => ({ ...s, [k]: e.target.value }))} />
                  )}
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-light" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn btn-dark" disabled={busy} onClick={() => void createLead()}>Create</button>
            </div>
          </div>
        </div>
      ) : null}

      {commsFor ? (
        <div className="modal-backdrop" onClick={() => setCommsFor(null)}>
          <div className="modal-body glass-strong" onClick={(e) => e.stopPropagation()}>
            <h2>Communication history</h2>
            <div style={{ maxHeight: 240, overflow: "auto", margin: "12px 0", display: "flex", flexDirection: "column", gap: 8 }}>
              {comms.length === 0 ? <p style={{ color: "var(--finverse-muted)" }}>No interactions yet.</p> : comms.map((c, i) => (
                <div className="card" key={i} style={{ padding: 12 }}><strong>{String(c.channel ?? "note")}</strong> · {String(c.note ?? "")}</div>
              ))}
            </div>
            <div className="field"><label htmlFor="note">Add note</label><input id="note" className="input" value={note} onChange={(e) => setNote(e.target.value)} /></div>
            <div className="modal-actions">
              <button className="btn btn-light" onClick={() => setCommsFor(null)}>Close</button>
              <button className="btn btn-dark" disabled={busy} onClick={() => void addComm()}>Add</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

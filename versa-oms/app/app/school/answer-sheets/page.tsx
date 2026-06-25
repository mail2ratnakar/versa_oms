"use client";
// FR-ANSWER-SHEET-UPLOAD-2026-0019 — school portal: upload administered answer sheets (UPSTREAM) and see
// each upload's status + counts (DOWNSTREAM). Custom page (top-level upload, not a per-row ModuleTable action).
import { useCallback, useEffect, useState } from "react";

type Batch = {
  id: string; import_batch_code: string; batch_status: string;
  imported_sheet_count?: number; valid_sheet_count?: number; invalid_sheet_count?: number;
};

export default function Page() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/school/answer-sheets");
    const json = await res.json();
    if (json.ok) setBatches(json.data.items as Batch[]);
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setMsg(null);
    try {
      const content = await file.text();
      const res = await fetch("/api/school/answer-sheets", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ content }) });
      const json = await res.json();
      setMsg(json.ok ? `Uploaded ${json.data.imported} answer sheet(s) — ${json.data.batch_status}.` : (json.error?.message ?? "Upload failed."));
    } finally {
      setBusy(false);
      e.target.value = "";
      void load();
    }
  }

  return (
    <section className="module-view">
      <header>
        <p className="eyebrow">school · answer sheets</p>
        <h1>Answer Sheets</h1>
      </header>
      <p>Upload the administered answer sheets (OMR CSV) for your exam. They are validated and handed to operations for scoring.</p>
      <label className="btn btn-blue" style={{ display: "inline-block", cursor: busy ? "wait" : "pointer" }}>
        {busy ? "Uploading…" : "Upload answer sheets (.csv)"}
        <input type="file" accept=".csv" onChange={onFile} disabled={busy} hidden />
      </label>
      {msg && <p role="status">{msg}</p>}
      <table>
        <thead><tr><th>Batch</th><th>Status</th><th>Valid sheets</th><th>Invalid</th></tr></thead>
        <tbody>
          {batches.map((b) => (
            <tr key={b.id}><td>{b.import_batch_code}</td><td>{b.batch_status}</td><td>{b.valid_sheet_count ?? 0}</td><td>{b.invalid_sheet_count ?? 0}</td></tr>
          ))}
          {batches.length === 0 && <tr><td colSpan={4}>No answer-sheet uploads yet.</td></tr>}
        </tbody>
      </table>
    </section>
  );
}

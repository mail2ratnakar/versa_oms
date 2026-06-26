"use client";
// FR-ANSWER-SHEET-UPLOAD-2026-0019 — school portal: upload administered answer sheets (UPSTREAM) and see
// each upload's status + counts (DOWNSTREAM). Custom page (top-level upload, not a per-row ModuleTable action).
import { useCallback, useEffect, useState } from "react";
import { PageHeader, Card, Section, StatusBadge, EmptyState } from "@/components/design";

type Batch = {
  id: string; import_batch_code: string; batch_status: string;
  imported_sheet_count?: number; valid_sheet_count?: number; invalid_sheet_count?: number;
};

export function SchoolAnswerSheetsView() {
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
      if (json.ok) {
        const unknown = (json.data.unknown_candidate_ids ?? []) as string[];
        const rejected = unknown.length ? ` ${unknown.length} rejected — candidate_id not in your roster: ${unknown.slice(0, 5).join(", ")}${unknown.length > 5 ? "…" : ""}.` : "";
        setMsg(`Uploaded ${json.data.imported} answer sheet(s) — ${json.data.batch_status}.${rejected}`);
      } else {
        setMsg(json.error?.message ?? "Upload failed.");
      }
    } finally {
      setBusy(false);
      e.target.value = "";
      void load();
    }
  }

  return (
    <section className="ds-page">
      <PageHeader
        eyebrow="school · answer sheets"
        title="Answer Sheets"
        description="Upload the administered answer sheets (OMR CSV) for your exam. They are validated and handed to operations for scoring."
        breadcrumbs={[{ label: "School", href: "/school/dashboard" }, { label: "Answer Sheets" }]}
        nextAction="→ Upload your answer-sheet CSV to start scoring."
      />
      <Card>
        <Section title="Upload answer sheets">
          <label className="btn btn-blue" style={{ display: "inline-block", cursor: busy ? "wait" : "pointer" }}>
            {busy ? "Uploading…" : "Upload answer sheets (.csv)"}
            <input type="file" accept=".csv" onChange={onFile} disabled={busy} hidden />
          </label>
          {msg && <p role="status" style={{ marginTop: 8 }}>{msg}</p>}
        </Section>
      </Card>
      <Card>
        <Section title="Your uploads">
          {batches.length === 0 ? (
            <EmptyState>No answer-sheet uploads yet. Use the button above to upload a CSV.</EmptyState>
          ) : (
            <table className="ds-stack">
              <thead><tr><th>Batch</th><th>Status</th><th>Valid sheets</th><th>Invalid</th></tr></thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id}>
                    <td data-label="Batch">{b.import_batch_code}</td>
                    <td data-label="Status"><StatusBadge status={b.batch_status} /></td>
                    <td data-label="Valid sheets">{b.valid_sheet_count ?? 0}</td>
                    <td data-label="Invalid">{b.invalid_sheet_count ?? 0}</td>
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

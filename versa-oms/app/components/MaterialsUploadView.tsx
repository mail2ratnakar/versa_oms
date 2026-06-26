"use client";
// WF-005 upload (FR-MATERIAL-UPLOAD-0040) — staff upload question-paper SETS (A-D) + the blank answer/OMR
// sheet into a material package (UPSTREAM). After the package is released they download time-gated by schools.
import { useCallback, useEffect, useState } from "react";
import { PageHeader, StatusBadge } from "@/components/design";

type Pkg = { id: string; package_code: string; package_status?: string };
type File = { id: string; file_code: string; file_type: string; file_status: string };

export function MaterialsUploadView() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [pkgId, setPkgId] = useState("");
  const [fileType, setFileType] = useState("question_paper");
  const [setCode, setSetCode] = useState("A");
  const [file, setFile] = useState<Blob | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [newExpiry, setNewExpiry] = useState("");
  const [winMsg, setWinMsg] = useState<string | null>(null);

  async function windowAction(action: "extend" | "cancel", body: Record<string, unknown>) {
    if (!pkgId) return;
    setWinMsg(null);
    const reason = action === "cancel" ? "exam cancelled by school" : "exam postponed by school";
    const j = await (await fetch(`/api/staff/exams/materials/packages/${pkgId}/window`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, reason, ...body }) })).json();
    setWinMsg(j.ok ? (action === "cancel" ? "Exam cancelled — downloads revoked." : `Window updated (closes ${j.data.expires_at ?? "open-ended"}).`) : (j.error?.message ?? "Failed."));
    void (async () => { const r = await (await fetch("/api/staff/exams/materials")).json(); if (r.ok) setPackages(r.data.items as Pkg[]); })();
  }

  useEffect(() => { void (async () => { const j = await (await fetch("/api/staff/exams/materials")).json(); if (j.ok) setPackages(j.data.items as Pkg[]); })(); }, []);
  const loadFiles = useCallback(async (id: string) => { if (!id) { setFiles([]); return; } const j = await (await fetch(`/api/staff/exams/materials/upload?package_id=${id}`)).json(); if (j.ok) setFiles(j.data.items as File[]); }, []);
  useEffect(() => { void loadFiles(pkgId); }, [pkgId, loadFiles]);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!pkgId || !file) { setMsg("Pick a package and a file."); return; }
    setBusy(true); setMsg(null);
    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      let bin = ""; for (const b of buf) bin += String.fromCharCode(b);
      const content = btoa(bin);
      const j = await (await fetch("/api/staff/exams/materials/upload", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ package_id: pkgId, file_type: fileType, set_code: fileType === "question_paper" ? setCode : undefined, content, encoding: "base64" }) })).json();
      setMsg(j.ok ? `Uploaded ${j.data.file_code}.` : (j.error?.message ?? "Upload failed."));
    } finally { setBusy(false); void loadFiles(pkgId); }
  }

  return (
    <section className="ds-page">
      <PageHeader eyebrow="staff · exams · materials" title="Upload Exam Materials" description="Upload the question-paper sets (A-D) and the blank answer/OMR sheet for a package; once released, schools download them time-gated." breadcrumbs={[{ label: "Staff", href: "/staff/dashboard" }, { label: "Exam Materials", href: "/staff/exams/materials" }, { label: "Upload" }]} />
      <p>Upload the question-paper sets (A-D) and the blank answer/OMR sheet for a package. Once the package is released, schools download them as time-gated PDFs.</p>
      <form onSubmit={upload} style={{ display: "grid", gap: "0.5rem", maxWidth: 560 }}>
        <select aria-label="Material package" value={pkgId} onChange={(e) => setPkgId(e.target.value)} required>
          <option value="">Select a material package…</option>
          {packages.map((p) => <option key={p.id} value={p.id}>{p.package_code}{p.package_status ? ` (${p.package_status})` : ""}</option>)}
        </select>
        <select aria-label="File type" value={fileType} onChange={(e) => setFileType(e.target.value)}>
          <option value="question_paper">Question paper</option>
          <option value="answer_sheet">Answer / OMR sheet (blank)</option>
          <option value="cover_sheet">Cover sheet</option>
        </select>
        {fileType === "question_paper" && (
          <select aria-label="Question paper set" value={setCode} onChange={(e) => setSetCode(e.target.value)}>
            {["A", "B", "C", "D"].map((s) => <option key={s} value={s}>Set {s}</option>)}
          </select>
        )}
        <input aria-label="Material PDF file" type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
        <button className="btn btn-blue" type="submit" disabled={busy}>{busy ? "Uploading…" : "Upload"}</button>
      </form>
      {msg && <p role="status">{msg}</p>}
      <table>
        <thead><tr><th>File</th><th>Type</th><th>Status</th></tr></thead>
        <tbody>
          {files.map((f) => <tr key={f.id}><td>{f.file_code}</td><td>{f.file_type.replace(/_/g, " ")}</td><td><StatusBadge status={f.file_status} /></td></tr>)}
          {pkgId && files.length === 0 && <tr><td colSpan={3}>No files uploaded for this package yet.</td></tr>}
        </tbody>
      </table>

      {pkgId && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h2>Exam window (exceptions)</h2>
          <p>If a school postpones, move the download window. If a school cancels, revoke the materials.</p>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            New close date/time:{" "}
            <input type="datetime-local" value={newExpiry} onChange={(e) => setNewExpiry(e.target.value)} />
          </label>
          <button className="btn btn-blue" onClick={() => windowAction("extend", { expires_at: newExpiry ? new Date(newExpiry).toISOString() : null })} disabled={!pkgId}>Postpone / extend window</button>{" "}
          <button className="btn" onClick={() => windowAction("cancel", {})} disabled={!pkgId} style={{ marginLeft: "0.5rem" }}>Cancel exam (revoke)</button>
          {winMsg && <p role="status">{winMsg}</p>}
        </div>
      )}
    </section>
  );
}

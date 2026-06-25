"use client";
// WF-015 Security / Audit Drift (FR-SECURITY-AUDIT-VERIFY-0026) — staff verify the append-only audit
// log's integrity (UPSTREAM) and see the result + any opened incident (DOWNSTREAM).
import { useState } from "react";

type Result = { ok: boolean; checked: number; tampered: number; coverage?: string; incident_code?: string | null } | { error: string };
type Drift = { scanned_staff: number; findings: number; by_risk: Record<string, number>; incident_code?: string | null } | { error: string };

export default function Page() {
  const [result, setResult] = useState<Result | null>(null);
  const [drift, setDrift] = useState<Drift | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function verify() {
    setBusy("verify");
    try {
      const j = await (await fetch("/api/staff/security-audit/verify-chain")).json();
      setResult(j.ok ? (j.data as Result) : { error: j.error?.message ?? "Verification failed." });
    } finally { setBusy(null); }
  }
  async function scan() {
    setBusy("scan");
    try {
      const j = await (await fetch("/api/staff/security-audit/drift-scan", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).json();
      setDrift(j.ok ? (j.data as Drift) : { error: j.error?.message ?? "Scan failed." });
    } finally { setBusy(null); }
  }

  return (
    <section className="module-view">
      <header><p className="eyebrow">staff · security &amp; audit</p><h1>Audit Integrity &amp; Drift</h1></header>

      <h2>Audit log integrity</h2>
      <p>Verify the append-only audit log&apos;s hash chain. Any tampered or forged entry is detected and raises a critical incident.</p>
      <button className="btn btn-blue" onClick={verify} disabled={busy !== null}>{busy === "verify" ? "Verifying…" : "Verify audit integrity"}</button>
      {result && ("error" in result ? (
        <p role="status">{result.error}</p>
      ) : (
        <div className="card" role="status" style={{ marginTop: "1rem" }}>
          <p>{result.ok ? `✓ Verified ${result.checked} events (${result.coverage ?? "full"} log) — no tampering detected.` : `⚠ Integrity FAILED: ${result.tampered} of ${result.checked} events tampered or forged.`}</p>
          {!result.ok && result.incident_code && <p>Incident opened: <strong>{result.incident_code}</strong></p>}
        </div>
      ))}

      <h2 style={{ marginTop: "2rem" }}>Permission drift</h2>
      <p>Scan every staff member&apos;s held roles against the role registry. A role that is no longer active (or unknown) is drift — privilege that should have been revoked.</p>
      <button className="btn btn-blue" onClick={scan} disabled={busy !== null}>{busy === "scan" ? "Scanning…" : "Run permission drift scan"}</button>
      {drift && ("error" in drift ? (
        <p role="status">{drift.error}</p>
      ) : (
        <div className="card" role="status" style={{ marginTop: "1rem" }}>
          <p>{drift.findings === 0 ? `✓ Scanned ${drift.scanned_staff} staff — no permission drift.` : `⚠ ${drift.findings} drift finding(s) across ${drift.scanned_staff} staff (${Object.entries(drift.by_risk).map(([k, v]) => `${v} ${k}`).join(", ")}).`}</p>
          {drift.incident_code && <p>Incident opened: <strong>{drift.incident_code}</strong></p>}
        </div>
      ))}
    </section>
  );
}

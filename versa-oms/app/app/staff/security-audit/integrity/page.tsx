"use client";
// WF-015 Security / Audit Drift (FR-SECURITY-AUDIT-VERIFY-0026) — staff verify the append-only audit
// log's integrity (UPSTREAM) and see the result + any opened incident (DOWNSTREAM).
import { useState } from "react";

type Result = { ok: boolean; checked: number; tampered: number; incident_code?: string | null } | { error: string };

export default function Page() {
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      const j = await (await fetch("/api/staff/security-audit/verify-chain")).json();
      setResult(j.ok ? (j.data as Result) : { error: j.error?.message ?? "Verification failed." });
    } finally { setBusy(false); }
  }

  return (
    <section className="module-view">
      <header><p className="eyebrow">staff · security &amp; audit</p><h1>Audit Integrity</h1></header>
      <p>Verify the append-only audit log&apos;s hash chain. Any tampered or forged entry is detected and raises a critical incident.</p>
      <button className="btn btn-blue" onClick={run} disabled={busy}>{busy ? "Verifying…" : "Verify audit integrity"}</button>
      {result && ("error" in result ? (
        <p role="status">{result.error}</p>
      ) : (
        <div className="card" role="status" style={{ marginTop: "1rem" }}>
          <p>{result.ok ? `✓ Verified ${result.checked} recent events — no tampering detected.` : `⚠ Integrity FAILED: ${result.tampered} of ${result.checked} events tampered or forged.`}</p>
          {!result.ok && result.incident_code && <p>Incident opened: <strong>{result.incident_code}</strong></p>}
        </div>
      ))}
    </section>
  );
}

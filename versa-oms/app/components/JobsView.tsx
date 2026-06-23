"use client";

import { useCallback, useEffect, useState } from "react";

type Run = { id: string; job_type: string; queue_id: string; status: string; attempts: number; error: string | null };

function chip(status: string): string {
  if (status === "succeeded") return "chip-green";
  if (status === "dead_letter") return "chip-red";
  if (status === "running") return "chip-blue";
  return "chip-yellow";
}

export function JobsView() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/staff/jobs", { headers: { "x-request-id": crypto.randomUUID() } });
      const b = await r.json();
      if (b.ok) setRuns(b.data?.items ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runQueue = async () => {
    setBusy(true);
    try {
      await fetch("/api/internal/jobs/run", { method: "POST", headers: { "content-type": "application/json" } });
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="module-view">
      <div className="page-head">
        <div>
          <span className="eyebrow">
            <span className="dot" />
            staff · worker queue
          </span>
          <h1 style={{ marginTop: 10 }}>Background jobs</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-light" onClick={() => void load()} disabled={busy}>
            Refresh
          </button>
          <button className="btn btn-dark" onClick={() => void runQueue()} disabled={busy}>
            Run queue
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Job type</th>
              <th>Queue</th>
              <th>Status</th>
              <th>Attempts</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {runs.length === 0 ? (
              <tr>
                <td colSpan={5} className="state">
                  No jobs yet. Transitions like publishing results enqueue jobs here.
                </td>
              </tr>
            ) : (
              runs.map((r) => (
                <tr key={r.id}>
                  <td>{r.job_type}</td>
                  <td>{r.queue_id}</td>
                  <td>
                    <span className={`chip ${chip(r.status)}`}>{r.status.replace(/_/g, " ")}</span>
                  </td>
                  <td>{r.attempts}</td>
                  <td>{r.error ?? <span style={{ color: "var(--finverse-muted)" }}>—</span>}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type Column = { key: string; label: string };
export type CreateField = { key: string; label: string; type?: "text" | "number" | "checkbox" | "date" };
export type RowAction = { action: string; label: string; variant?: "dark" | "blue" | "light" };

type Props = {
  title: string;
  eyebrow: string;
  endpoint: string;
  columns: Column[];
  statusKey?: string;
  createFields?: CreateField[];
  actions?: RowAction[];
};

type Row = Record<string, unknown>;

function chipClass(status: string): string {
  const s = status.toLowerCase();
  if (/(approved|published|paid|confirmed|active|delivered|completed|locked|received|validated|issued|reissued|done)/.test(s)) return "chip-green";
  if (/(pending|draft|review|scheduled|in_transit|processing|requested|submitted|generating|generated)/.test(s)) return "chip-yellow";
  if (/(rejected|failed|revoked|blocked|cancelled|mismatch|lost|withheld|disabled|suspended|exception|error)/.test(s)) return "chip-red";
  return "chip-blue";
}

function renderCell(value: unknown, isStatus: boolean) {
  if (value === null || value === undefined || value === "") return <span style={{ color: "var(--finverse-muted)" }}>—</span>;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (isStatus && typeof value === "string") return <span className={`chip ${chipClass(value)}`}>{value.replace(/_/g, " ")}</span>;
  if (typeof value === "object") return <code style={{ fontSize: 12 }}>{JSON.stringify(value).slice(0, 40)}</code>;
  const str = String(value);
  return str.length > 48 ? str.slice(0, 47) + "…" : str;
}

export function ModuleTable({ title, eyebrow, endpoint, columns, statusKey, createFields, actions }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { headers: { "x-request-id": crypto.randomUUID() } });
      const body = await res.json();
      if (!body.ok) {
        setError(body.error?.message ?? "Request failed");
        setRows([]);
      } else {
        setRows(body.data?.items ?? []);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitCreate = async () => {
    setBusy(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json", "x-idempotency-key": crypto.randomUUID() },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!body.ok) {
        const fe = body.error?.field_errors?.map((f: { field: string; message: string }) => `${f.field}: ${f.message}`).join(", ");
        setError(fe || body.error?.message || "Create failed");
      } else {
        setShowModal(false);
        setForm({});
        await load();
      }
    } finally {
      setBusy(false);
    }
  };

  const runAction = async (id: string, action: string) => {
    const reason = window.prompt(`Reason to ${action.replace(/_/g, " ")}? (required for approvals)`) ?? "";
    setBusy(true);
    try {
      const res = await fetch(`${endpoint}/${id}/actions/${action}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const body = await res.json();
      if (!body.ok) setError(body.error?.message ?? "Action failed");
      else await load();
    } finally {
      setBusy(false);
    }
  };

  const idOf = (r: Row) => String(r.id ?? "");
  const hasActions = (actions?.length ?? 0) > 0;
  const cols = useMemo(() => columns, [columns]);

  return (
    <section className="module-view">
      <div className="page-head">
        <div>
          <span className="eyebrow">
            <span className="dot" />
            {eyebrow}
          </span>
          <h1 style={{ marginTop: 10 }}>{title}</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-light" onClick={() => void load()} disabled={busy}>
            Refresh
          </button>
          {createFields && createFields.length > 0 ? (
            <button className="btn btn-dark" onClick={() => setShowModal(true)}>
              New record
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="chip chip-red" style={{ alignSelf: "flex-start" }}>
          {error}
        </div>
      ) : null}

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
              {hasActions ? <th>Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={cols.length + (hasActions ? 1 : 0)} className="state">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={cols.length + (hasActions ? 1 : 0)} className="state">
                  No records yet.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={idOf(r) || i}>
                  {cols.map((c) => (
                    <td key={c.key}>{renderCell(r[c.key], c.key === statusKey)}</td>
                  ))}
                  {hasActions ? (
                    <td>
                      <div className="row-actions">
                        {actions!.map((a) => (
                          <button
                            key={a.action}
                            className={`btn btn-${a.variant ?? "light"}`}
                            disabled={busy}
                            onClick={() => void runAction(idOf(r), a.action)}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && createFields ? (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-body glass-strong" onClick={(e) => e.stopPropagation()}>
            <h2>New {title.toLowerCase()}</h2>
            <div className="form-grid">
              {createFields.map((f) => (
                <div className="field" key={f.key}>
                  <label htmlFor={f.key}>{f.label}</label>
                  {f.type === "checkbox" ? (
                    <input
                      id={f.key}
                      type="checkbox"
                      checked={Boolean(form[f.key])}
                      onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.checked }))}
                    />
                  ) : (
                    <input
                      id={f.key}
                      className="input"
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      value={String(form[f.key] ?? "")}
                      onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-light" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-dark" onClick={() => void submitCreate()} disabled={busy}>
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

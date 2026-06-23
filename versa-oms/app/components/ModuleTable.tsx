"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isActionAllowedFrom } from "@/server/lib/transitionGuards";

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
  moduleId?: string; // enables status-aware action gating (lifecycle guard)
};

type Row = Record<string, unknown>;

// Actions that require a reason (mirrors the server's reasonRequired transitions).
const REASON_ACTIONS = new Set(["approve", "reject", "revoke", "withhold", "cancel"]);

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

export function ModuleTable({ title, eyebrow, endpoint, columns, statusKey, createFields, actions, moduleId }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [busy, setBusy] = useState(false);
  const [actionTarget, setActionTarget] = useState<{ row: Row; action: string; label: string } | null>(null);
  const [actionReason, setActionReason] = useState("");

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

  const idOf = (r: Row) => String(r.id ?? "");
  const needsReason = (action: string) => REASON_ACTIONS.has(action);
  const recordLabel = (r: Row) => {
    const nameCol = columns.find((c) => /name|code|title/.test(c.key) && c.key !== statusKey) || columns.find((c) => c.key !== statusKey);
    return nameCol ? String(r[nameCol.key] ?? "—") : "—";
  };

  const confirmAction = async () => {
    if (!actionTarget) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${endpoint}/${idOf(actionTarget.row)}/actions/${actionTarget.action}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason: actionReason }),
      });
      const body = await res.json();
      if (!body.ok) setError(body.error?.message ?? "Action failed");
      else {
        setActionTarget(null);
        setActionReason("");
        await load();
      }
    } finally {
      setBusy(false);
    }
  };
  const closeAction = () => {
    setActionTarget(null);
    setActionReason("");
    setError(null);
  };
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
                        {(() => {
                          const status = statusKey ? String(r[statusKey] ?? "") : "";
                          const valid = actions!.filter((a) => isActionAllowedFrom(moduleId ?? "", status, a.action));
                          if (valid.length === 0) return <span style={{ color: "var(--finverse-muted)" }}>—</span>;
                          return valid.map((a) => (
                            <button
                              key={a.action}
                              className={`btn btn-${a.variant ?? "light"}`}
                              disabled={busy}
                              onClick={() => setActionTarget({ row: r, action: a.action, label: a.label })}
                            >
                              {a.label}
                            </button>
                          ));
                        })()}
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

      {actionTarget ? (
        <div className="modal-backdrop" onClick={closeAction}>
          <div className="modal-body glass-strong" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <span className="eyebrow"><span className="dot" />{eyebrow}</span>
            <h2 style={{ marginTop: 8 }}>{actionTarget.label}</h2>
            <div className="card" style={{ margin: "12px 0", padding: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>{recordLabel(actionTarget.row)}</div>
              {statusKey ? (
                <div style={{ marginTop: 8 }}>
                  <span className={`chip ${chipClass(String(actionTarget.row[statusKey] ?? ""))}`}>{String(actionTarget.row[statusKey] ?? "").replace(/_/g, " ")}</span>
                </div>
              ) : null}
            </div>
            <div className="field">
              <label htmlFor="action-reason">
                Reason {needsReason(actionTarget.action)
                  ? <span style={{ color: "var(--finverse-attention)" }}>*</span>
                  : <span style={{ color: "var(--finverse-muted)" }}>(optional)</span>}
              </label>
              <textarea
                id="action-reason"
                className="input"
                style={{ minHeight: 72, padding: 10, resize: "vertical" }}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={`Why are you performing "${actionTarget.label}"?`}
              />
            </div>
            {error ? <div className="chip chip-red" style={{ alignSelf: "flex-start" }}>{error}</div> : null}
            <div className="modal-actions">
              <button className="btn btn-light" onClick={closeAction}>Cancel</button>
              <button
                className="btn btn-blue"
                disabled={busy || (needsReason(actionTarget.action) && !actionReason.trim())}
                onClick={() => void confirmAction()}
              >
                {busy ? "Working…" : `Confirm ${actionTarget.label}`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

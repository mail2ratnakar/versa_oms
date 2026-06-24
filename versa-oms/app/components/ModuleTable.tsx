"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isActionAllowedFrom } from "@/server/lib/transitionGuards";

export type Column = { key: string; label: string };
export type Field = { key: string; label: string; type?: "text" | "number" | "checkbox" | "date" | "select" | "email" | "tel"; required?: boolean; options?: string[]; placeholder?: string; default?: string };
export type CreateField = Field;
export type RowAction = { action: string; label: string; variant?: "dark" | "blue" | "light" }; // lifecycle transitions -> /actions/[action]
export type CustomAction = { key: string; label: string; variant?: "dark" | "blue" | "light"; subPath: string; fields?: Field[]; confirmTitle?: string; confirmBody?: string; confirmWarn?: string; lockStatuses?: string[] };
export type RowSelect = { key: string; subPath: string; options: string[]; lockStatuses?: string[] };
export type ImportConfig = { subPath: string; columns: string[]; payloadKey?: string; label?: string; placeholder?: string };
export type DetailPanel = { key: string; label: string; subPath: string; listColumns: string[]; addFields: Field[] };
export type Toolbar = {
  facet?: { key: string; options: { value: string; label: string }[] }; // pill row with server counts
  filters?: { key: string; label: string; options: string[] }[]; // exact-match dropdowns
  search?: boolean; // ?q= over the server's configured search columns
  owner?: boolean; // "My records" toggle -> ?owner=mine
  sort?: { value: string; label: string }[]; // ?sort=col:dir
};

type Props = {
  title: string;
  eyebrow: string;
  endpoint: string;
  columns: Column[];
  statusKey?: string;
  createFields?: CreateField[];
  actions?: RowAction[];
  moduleId?: string;
  customActions?: CustomAction[];
  rowSelect?: RowSelect;
  importConfig?: ImportConfig;
  detailPanel?: DetailPanel;
  downloadAction?: { label: string; subPath: string }; // GET endpoint/[id]/subPath -> opens data.download_url
  toolbar?: Toolbar; // sticky server-side filter/search/sort/facet bar
};

type Row = Record<string, unknown>;
const REASON_ACTIONS = new Set(["approve", "reject", "revoke", "withhold", "cancel"]);
const idem = () => ({ "content-type": "application/json", "x-idempotency-key": crypto.randomUUID() });

function chipClass(status: string): string {
  const s = status.toLowerCase();
  if (/(approved|published|paid|confirmed|active|delivered|completed|locked|received|validated|issued|reissued|converted|done)/.test(s)) return "chip-green";
  if (/(pending|draft|review|scheduled|in_transit|processing|requested|submitted|new_lead|contacted|generating|generated)/.test(s)) return "chip-yellow";
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
function FieldInput({ f, value, onChange }: { f: Field; value: string; onChange: (v: string) => void }) {
  if (f.type === "select") {
    return (
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {(f.options ?? []).map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
      </select>
    );
  }
  if (f.type === "checkbox") return <input type="checkbox" checked={value === "true"} onChange={(e) => onChange(String(e.target.checked))} />;
  const inputType = f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "email" ? "email" : f.type === "tel" ? "tel" : "text";
  return <input className="input" type={inputType} value={value} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />;
}

export function ModuleTable(props: Props) {
  const { title, eyebrow, endpoint, columns, statusKey, createFields, actions, moduleId, customActions, rowSelect, importConfig, detailPanel, downloadAction, toolbar } = props;
  const [tb, setTb] = useState<Record<string, string>>({}); // toolbar query state (stage/lead_status/.../q/owner/sort)
  const [facets, setFacets] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [refreshTick, setRefreshTick] = useState(0); // force a reload even when page is unchanged (e.g. after create)
  const [pageInfo, setPageInfo] = useState<{ total: number; size: number; hasNext: boolean }>({ total: 0, size: 0, hasNext: false });
  const updateTb = (patch: Record<string, string>) => { setTb((s) => ({ ...s, ...patch })); setPage(1); }; // any filter change -> back to page 1
  const scrollTop = () => { try { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); } catch { window.scrollTo(0, 0); } };
  const goPage = (p: number) => { setPage(Math.max(1, p)); scrollTop(); }; // paging reorients the user to the top
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"records" | "import">("records");

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<Record<string, string>>({});

  const [tx, setTx] = useState<{ row: Row; action: string; label: string } | null>(null); // lifecycle transition
  const [txReason, setTxReason] = useState("");

  const [custom, setCustom] = useState<{ row: Row; ca: CustomAction } | null>(null); // custom action
  const [customForm, setCustomForm] = useState<Record<string, string>>({});

  const [detailRow, setDetailRow] = useState<Row | null>(null);
  const [detailItems, setDetailItems] = useState<Row[]>([]);
  const [detailForm, setDetailForm] = useState<Record<string, string>>({});

  const [importText, setImportText] = useState("");

  const idOf = (r: Row) => String(r.id ?? "");
  const cols = useMemo(() => columns, [columns]);
  const hasActionsCol = (actions?.length ?? 0) > 0 || (customActions?.length ?? 0) > 0 || !!detailPanel || !!downloadAction;

  async function runDownload(row: Row) {
    setBusy(true);
    try {
      const res = await fetch(`${endpoint}/${idOf(row)}/${downloadAction!.subPath}`, { headers: { "x-request-id": crypto.randomUUID() } });
      const body = await res.json();
      if (body.ok && body.data?.download_url) window.open(String(body.data.download_url), "_blank", "noopener");
      else setError(body.error?.message ?? "Download is not available yet.");
    } finally {
      setBusy(false);
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(tb).forEach(([k, v]) => { if (v) params.set(k, v); });
      if (toolbar?.facet) params.set("facet", toolbar.facet.key);
      params.set("page", String(page));
      const res = await fetch(`${endpoint}?${params.toString()}`, { headers: { "x-request-id": crypto.randomUUID() } });
      const body = await res.json();
      if (!body.ok) { setError(body.error?.message ?? "Request failed"); setRows([]); }
      else {
        setRows(body.data?.items ?? []);
        setFacets(body.data?.facets ?? {});
        const pg = body.data?.pagination ?? {};
        setPageInfo({ total: pg.total_count ?? 0, size: pg.page_size ?? 0, hasNext: !!pg.has_next });
      }
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }, [endpoint, tb, toolbar, page, refreshTick]);
  useEffect(() => { void load(); }, [load]);

  const renderToolbar = () => {
    const t = toolbar;
    if (!t) return null;
    const fk = t.facet?.key ?? "";
    return (
      <div className="list-toolbar">
        {t.facet ? (
          <div className="facet-pills">
            <button className={`pill${!tb[fk] ? " active" : ""}`} onClick={() => updateTb({ [fk]: "" })}>All <span className="pill-n">{facets._all ?? 0}</span></button>
            {t.facet.options.map((o) => (
              <button key={o.value} className={`pill${tb[fk] === o.value ? " active" : ""}`} onClick={() => updateTb({ [fk]: o.value })}>{o.label} <span className="pill-n">{facets[o.value] ?? 0}</span></button>
            ))}
          </div>
        ) : null}
        <div className="toolbar-controls">
          {t.search ? <input className="input toolbar-search" placeholder="Search…" defaultValue={tb.q ?? ""} onKeyDown={(e) => { if (e.key === "Enter") updateTb({ q: (e.target as HTMLInputElement).value }); }} /> : null}
          {(t.filters ?? []).map((f) => (
            <select key={f.key} className="input toolbar-select" value={tb[f.key] ?? ""} onChange={(e) => updateTb({ [f.key]: e.target.value })}>
              <option value="">All {f.label}</option>
              {f.options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
            </select>
          ))}
          {t.owner ? <button className={`btn ${tb.owner === "mine" ? "btn-blue" : "btn-light"}`} onClick={() => updateTb({ owner: tb.owner === "mine" ? "" : "mine" })}>My records</button> : null}
          {t.sort ? (
            <select className="input toolbar-select" value={tb.sort ?? ""} onChange={(e) => updateTb({ sort: e.target.value })}>
              <option value="">Sort…</option>
              {t.sort.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : null}
        </div>
      </div>
    );
  };

  const post = async (url: string, payload: unknown): Promise<boolean> => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, { method: "POST", headers: idem(), body: JSON.stringify(payload) });
      const body = await res.json();
      if (!body.ok) { setError(body.error?.field_errors?.map((f: { field: string; message: string }) => `${f.field}: ${f.message}`).join(", ") || body.error?.message || "Action failed"); return false; }
      return true;
    } finally { setBusy(false); }
  };

  const submitCreate = async () => {
    if (await post(endpoint, createForm)) { setShowCreate(false); setCreateForm({}); setPage(1); setRefreshTick((t) => t + 1); scrollTop(); } // new item is newest -> top of page 1
  };
  const confirmTx = async () => {
    if (!tx) return;
    if (await post(`${endpoint}/${idOf(tx.row)}/actions/${tx.action}`, { reason: txReason })) { setTx(null); setTxReason(""); await load(); }
  };
  const confirmCustom = async () => {
    if (!custom) return;
    if (await post(`${endpoint}/${idOf(custom.row)}/${custom.ca.subPath}`, customForm)) {
      setNotice(`${custom.ca.label}: done.`); setCustom(null); setCustomForm({}); await load();
    }
  };
  const onRowSelect = async (row: Row, value: string) => {
    if (rowSelect && (await post(`${endpoint}/${idOf(row)}/${rowSelect.subPath}`, { [rowSelect.key]: value }))) await load();
  };
  const openDetail = async (row: Row) => {
    setDetailRow(row); setDetailItems([]);
    if (!detailPanel) return;
    const res = await fetch(`${endpoint}/${idOf(row)}/${detailPanel.subPath}`);
    const body = await res.json();
    setDetailItems(body.ok ? body.data?.items ?? [] : []);
  };
  const addDetail = async () => {
    if (!detailRow || !detailPanel) return;
    if (await post(`${endpoint}/${idOf(detailRow)}/${detailPanel.subPath}`, detailForm)) { setDetailForm({}); await openDetail(detailRow); }
  };
  const runImport = async () => {
    if (!importConfig) return;
    const items = importText.split("\n").map((l) => l.trim()).filter(Boolean).map((line) => {
      const parts = line.split(",").map((x) => x.trim());
      return Object.fromEntries(importConfig.columns.map((c, i) => [c, parts[i] ?? ""]));
    });
    if (await post(`${endpoint}/${importConfig.subPath}`, { [importConfig.payloadKey ?? "items"]: items })) {
      setNotice(`Imported ${items.length} row(s) submitted.`); setImportText(""); await load();
    }
  };

  const recordLabel = (r: Row) => {
    const nameCol = columns.find((c) => /name|code|title/.test(c.key) && c.key !== statusKey) || columns.find((c) => c.key !== statusKey);
    return nameCol ? String(r[nameCol.key] ?? "—") : "—";
  };
  const statusOf = (r: Row) => (statusKey ? String(r[statusKey] ?? "") : "");
  const needsReason = (action: string) => REASON_ACTIONS.has(action);
  const closeTx = () => { setTx(null); setTxReason(""); setError(null); };
  const closeCustom = () => { setCustom(null); setCustomForm({}); setError(null); };

  return (
    <section className="module-view">
      <div className="page-head">
        <div>
          <span className="eyebrow"><span className="dot" />{eyebrow}</span>
          <h1 style={{ marginTop: 10 }}>{title}</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {importConfig ? (
            <>
              <button className={`btn ${tab === "records" ? "btn-dark" : "btn-light"}`} onClick={() => setTab("records")}>Records</button>
              <button className={`btn ${tab === "import" ? "btn-dark" : "btn-light"}`} onClick={() => setTab("import")}>{importConfig.label ?? "Import"}</button>
            </>
          ) : (
            <button className="btn btn-light" onClick={() => void load()} disabled={busy}>Refresh</button>
          )}
          {createFields && createFields.length > 0 ? <button className="btn btn-blue" onClick={() => { setCreateForm(Object.fromEntries((createFields ?? []).filter((f) => f.default != null).map((f) => [f.key, String(f.default)]))); setShowCreate(true); }}>New record</button> : null}
        </div>
      </div>

      {renderToolbar()}

      {error ? <div className="chip chip-red" style={{ alignSelf: "flex-start" }}>{error}</div> : null}
      {notice ? <div className="chip chip-green" style={{ alignSelf: "flex-start" }}>{notice}</div> : null}

      {importConfig && tab === "import" ? (
        <div className="card">
          <h2>{importConfig.label ?? "Import"}</h2>
          <p>One row per line: <code>{importConfig.columns.join(", ")}</code>. Duplicates are detected and skipped.</p>
          <textarea className="input" style={{ height: 150, padding: 12, width: "100%", resize: "vertical" }} value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={importConfig.placeholder} />
          <div style={{ marginTop: 12 }}><button className="btn btn-dark" disabled={busy} onClick={() => void runImport()}>Import</button></div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>{cols.map((c) => <th key={c.key}>{c.label}</th>)}{hasActionsCol ? <th>Actions</th> : null}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={cols.length + (hasActionsCol ? 1 : 0)} className="state">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={cols.length + (hasActionsCol ? 1 : 0)} className="state">No records yet.</td></tr>
              ) : rows.map((r, i) => {
                const status = statusOf(r);
                return (
                  <tr key={idOf(r) || i}>
                    {cols.map((c) => {
                      const locked = rowSelect?.lockStatuses?.includes(status);
                      if (rowSelect && c.key === rowSelect.key && !locked) {
                        return (
                          <td key={c.key}>
                            <select className="input" style={{ height: 30, padding: "0 8px", minWidth: 130 }} value={String(r[c.key] ?? "")} disabled={busy} onChange={(e) => void onRowSelect(r, e.target.value)}>
                              {rowSelect.options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
                            </select>
                          </td>
                        );
                      }
                      return <td key={c.key}>{renderCell(r[c.key], c.key === statusKey)}</td>;
                    })}
                    {hasActionsCol ? (
                      <td>
                        <div className="row-actions">
                          {detailPanel ? <button className="btn btn-light" disabled={busy} onClick={() => void openDetail(r)}>{detailPanel.label}</button> : null}
                          {(actions ?? []).filter((a) => isActionAllowedFrom(moduleId ?? "", status, a.action)).map((a) => (
                            <button key={a.action} className={`btn btn-${a.variant ?? "light"}`} disabled={busy} onClick={() => setTx({ row: r, action: a.action, label: a.label })}>{a.label}</button>
                          ))}
                          {(customActions ?? []).filter((ca) => !ca.lockStatuses?.includes(status)).map((ca) => (
                            <button key={ca.key} className={`btn btn-${ca.variant ?? "light"}`} disabled={busy} onClick={() => { setCustom({ row: r, ca }); setCustomForm({}); }}>{ca.label}</button>
                          ))}
                          {downloadAction ? <button className="btn btn-blue" disabled={busy} onClick={() => void runDownload(r)}>{downloadAction.label}</button> : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pageInfo.total > 0 ? (
            <div className="list-pager">
              <span className="pager-info">Showing {rows.length} of {pageInfo.total}{(page > 1 || pageInfo.hasNext) ? ` · page ${page}` : ""}</span>
              <div className="pager-btns">
                <button className="btn btn-light" disabled={page <= 1 || busy || loading} onClick={() => goPage(page - 1)}>Prev</button>
                <button className="btn btn-light" disabled={!pageInfo.hasNext || busy || loading} onClick={() => goPage(page + 1)}>Next</button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Create modal */}
      {showCreate && createFields ? (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal-body glass-strong" onClick={(e) => e.stopPropagation()}>
            <h2>New {title.toLowerCase()}</h2>
            <div className="form-grid">
              {createFields.map((f) => (
                <div className="field" key={f.key}>
                  <label htmlFor={f.key}>{f.label}{f.required ? <span style={{ color: "var(--finverse-attention)" }}> *</span> : null}</label>
                  <FieldInput f={f} value={createForm[f.key] ?? ""} onChange={(v) => setCreateForm((s) => ({ ...s, [f.key]: v }))} />
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-light" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-dark" onClick={() => void submitCreate()} disabled={busy}>Create</button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Lifecycle transition modal */}
      {tx ? (
        <div className="modal-backdrop" onClick={closeTx}>
          <div className="modal-body glass-strong" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <span className="eyebrow"><span className="dot" />{eyebrow}</span>
            <h2 style={{ marginTop: 8 }}>{tx.label}</h2>
            <div className="card" style={{ margin: "12px 0", padding: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{recordLabel(tx.row)}</div>
              {statusKey ? <div style={{ marginTop: 8 }}><span className={`chip ${chipClass(statusOf(tx.row))}`}>{statusOf(tx.row).replace(/_/g, " ")}</span></div> : null}
            </div>
            <div className="field">
              <label htmlFor="tx-reason">Reason {needsReason(tx.action) ? <span style={{ color: "var(--finverse-attention)" }}>*</span> : <span style={{ color: "var(--finverse-muted)" }}>(optional)</span>}</label>
              <textarea id="tx-reason" className="input" style={{ minHeight: 72, padding: 10, resize: "vertical" }} value={txReason} onChange={(e) => setTxReason(e.target.value)} placeholder={`Why "${tx.label}"?`} />
            </div>
            {error ? <div className="chip chip-red" style={{ alignSelf: "flex-start" }}>{error}</div> : null}
            <div className="modal-actions">
              <button className="btn btn-light" onClick={closeTx}>Cancel</button>
              <button className="btn btn-blue" disabled={busy || (needsReason(tx.action) && !txReason.trim())} onClick={() => void confirmTx()}>{busy ? "Working…" : `Confirm ${tx.label}`}</button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Custom action modal (convert / lost / assign / …) */}
      {custom ? (
        <div className="modal-backdrop" onClick={closeCustom}>
          <div className="modal-body glass-strong" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <span className="eyebrow"><span className="dot" />{eyebrow}</span>
            <h2 style={{ marginTop: 8 }}>{custom.ca.confirmTitle ?? custom.ca.label}</h2>
            <div className="card" style={{ margin: "12px 0", padding: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{recordLabel(custom.row)}</div>
              {statusKey ? <div style={{ marginTop: 8 }}><span className={`chip ${chipClass(statusOf(custom.row))}`}>{statusOf(custom.row).replace(/_/g, " ")}</span></div> : null}
            </div>
            {custom.ca.confirmBody ? <p style={{ fontSize: 12.5, lineHeight: 1.7 }}>{custom.ca.confirmBody}</p> : null}
            {custom.ca.confirmWarn ? <p style={{ fontSize: 12.5, lineHeight: 1.7, color: "var(--finverse-attention)", fontWeight: 700 }}>{custom.ca.confirmWarn}</p> : null}
            {(custom.ca.fields ?? []).map((f) => (
              <div className="field" key={f.key}>
                <label htmlFor={`c-${f.key}`}>{f.label}{f.required ? <span style={{ color: "var(--finverse-attention)" }}> *</span> : null}</label>
                <FieldInput f={f} value={customForm[f.key] ?? ""} onChange={(v) => setCustomForm((s) => ({ ...s, [f.key]: v }))} />
              </div>
            ))}
            {error ? <div className="chip chip-red" style={{ alignSelf: "flex-start" }}>{error}</div> : null}
            <div className="modal-actions">
              <button className="btn btn-light" onClick={closeCustom}>Cancel</button>
              <button
                className="btn btn-blue"
                disabled={busy || (custom.ca.fields ?? []).some((f) => f.required && !(customForm[f.key] ?? "").trim())}
                onClick={() => void confirmCustom()}
              >{busy ? "Working…" : custom.ca.label}</button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Detail drawer (comms / interactions) */}
      {detailRow && detailPanel ? (
        <div className="modal-backdrop" onClick={() => setDetailRow(null)}>
          <div className="modal-body glass-strong" onClick={(e) => e.stopPropagation()}>
            <h2>{detailPanel.label} — {recordLabel(detailRow)}</h2>
            <div style={{ maxHeight: 240, overflow: "auto", margin: "12px 0", display: "flex", flexDirection: "column", gap: 8 }}>
              {detailItems.length === 0 ? <p style={{ color: "var(--finverse-muted)" }}>Nothing yet.</p> : detailItems.map((it, i) => (
                <div className="card" key={i} style={{ padding: 12 }}>{detailPanel.listColumns.map((k) => <span key={k} style={{ marginRight: 10 }}><strong>{String(it[k] ?? "")}</strong></span>)}</div>
              ))}
            </div>
            {detailPanel.addFields.map((f) => (
              <div className="field" key={f.key}>
                <label htmlFor={`d-${f.key}`}>{f.label}</label>
                <FieldInput f={f} value={detailForm[f.key] ?? ""} onChange={(v) => setDetailForm((s) => ({ ...s, [f.key]: v }))} />
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn btn-light" onClick={() => setDetailRow(null)}>Close</button>
              <button className="btn btn-dark" disabled={busy} onClick={() => void addDetail()}>Add</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

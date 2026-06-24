"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isActionAllowedFrom } from "@/server/lib/transitionGuards";

export type Column = { key: string; label: string };
export type Field = { key: string; label: string; type?: "text" | "number" | "checkbox" | "date" | "select" | "email" | "tel" | "textarea"; required?: boolean; options?: string[]; placeholder?: string; default?: string };
export type CreateField = Field;
export type RowAction = { action: string; label: string; variant?: "dark" | "blue" | "light"; reason?: boolean; danger?: boolean }; // lifecycle transitions -> /actions/[action]
export type CustomAction = { key: string; label: string; variant?: "dark" | "blue" | "light"; subPath: string; fields?: Field[]; confirmTitle?: string; confirmBody?: string; confirmWarn?: string; lockStatuses?: string[] };
export type RowSelect = { key: string; subPath: string; options: string[]; lockStatuses?: string[] };
export type ImportConfig = { subPath: string; columns: string[]; payloadKey?: string; label?: string; placeholder?: string; format?: string; requiredColumns?: string[]; templateName?: string; templateExample?: string[] };
export type DetailPanel = { key: string; label: string; subPath: string; listColumns: string[]; addFields?: Field[]; editFields?: Field[] };
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
const titleize = (k: string) => k.replace(/_at$/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const csvCell = (c: string) => (/[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c);
// Minimal RFC-4180-ish CSV parser: handles quoted fields, escaped quotes, CRLF. Returns non-empty rows.
function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let cur: string[] = []; let field = ""; let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { cur.push(field); field = ""; }
    else if (c === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field.length || cur.length) { cur.push(field); rows.push(cur); }
  return rows.filter((r) => r.some((x) => x.trim() !== ""));
}
function detailValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) { const d = new Date(s); if (!Number.isNaN(d.getTime())) return d.toLocaleString(); }
  return s.replace(/_/g, " ");
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
  if (f.type === "textarea") return <textarea className="input" style={{ minHeight: 72, padding: 10, resize: "vertical" }} value={value} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />;
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

  const [tx, setTx] = useState<{ row: Row; action: string; label: string; reason?: boolean; danger?: boolean } | null>(null); // lifecycle transition
  const [txReason, setTxReason] = useState("");

  const [custom, setCustom] = useState<{ row: Row; ca: CustomAction } | null>(null); // custom action
  const [customForm, setCustomForm] = useState<Record<string, string>>({});

  const [detailRow, setDetailRow] = useState<Row | null>(null);
  const [detailItems, setDetailItems] = useState<Row[]>([]);
  const [detailForm, setDetailForm] = useState<Record<string, string>>({});
  const [editItemId, setEditItemId] = useState<string | null>(null); // detail item being edited
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  const [importRows, setImportRows] = useState<Record<string, string>[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importFormat, setImportFormat] = useState("csv");
  const [importBatch, setImportBatch] = useState<{ batch_id: string; batch_code: string; status: string; total: number; valid: number; invalid: number; duplicates: number; importable: number; needs_approval: boolean } | null>(null);

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
  const startEditItem = (item: Row) => {
    if (!detailPanel?.editFields) return;
    setEditItemId(idOf(item));
    setEditForm(Object.fromEntries(detailPanel.editFields.map((f) => [f.key, String(item[f.key] ?? "")])));
  };
  const saveEditItem = async () => {
    if (!detailRow || !detailPanel || !editItemId) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`${endpoint}/${idOf(detailRow)}/${detailPanel.subPath}/${editItemId}`, { method: "PATCH", headers: idem(), body: JSON.stringify(editForm) });
      const body = await res.json();
      if (!body.ok) { setError(body.error?.field_errors?.map((f: { field: string; message: string }) => `${f.field}: ${f.message}`).join(", ") || body.error?.message || "Edit failed"); return; }
      setEditItemId(null); setEditForm({}); await openDetail(detailRow);
    } finally { setBusy(false); }
  };
  const downloadTemplate = () => {
    if (!importConfig) return;
    const lines = [importConfig.columns.map(csvCell).join(",")];
    if (importConfig.templateExample) lines.push(importConfig.templateExample.map(csvCell).join(","));
    const blob = new Blob([lines.join("\n") + "\n"], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = importConfig.templateName ?? "import_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };
  const rowsToObjects = (rows: string[][]): Record<string, string>[] => {
    if (rows.length < 2) return [];
    const header = rows[0].map((c) => c.trim());
    return rows.slice(1).map((r) => Object.fromEntries(header.map((hd, j) => [hd, (r[j] ?? "").trim()])));
  };
  const onImportFile = async (file: File) => {
    setError(null); setImportFileName(file.name); setImportBatch(null);
    const isXlsx = /\.xlsx$/i.test(file.name);
    setImportFormat(isXlsx ? "xlsx" : "csv");
    let objs: Record<string, string>[] = [];
    if (isXlsx) {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      objs = rowsToObjects((XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", blankrows: false }) as unknown[][]).map((r) => r.map((c) => String(c ?? ""))));
    } else {
      objs = rowsToObjects(parseCsv(await file.text()));
    }
    if (!objs.length) { setImportRows([]); setError("The file has a header but no data rows."); return; }
    setImportRows(objs);
  };
  const validateImport = async () => { // stage 1: upload + validate -> a staged batch (no insert yet)
    if (!importConfig || !importRows.length) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`${endpoint}/${importConfig.subPath}`, { method: "POST", headers: idem(), body: JSON.stringify({ [importConfig.payloadKey ?? "leads"]: importRows, import_format: importFormat }) });
      const body = await res.json();
      if (!body.ok) { setError(body.error?.field_errors?.map((f: { field: string; message: string }) => `${f.field}: ${f.message}`).join(", ") || body.error?.message || "Validation failed"); return; }
      setImportBatch(body.data); setNotice(null);
    } finally { setBusy(false); }
  };
  const commitImport = async () => { // stage 2: apply the staged batch (>=5000 needs a 2nd approver)
    if (!importConfig || !importBatch) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`${endpoint}/${importConfig.subPath}/${importBatch.batch_id}/commit`, { method: "POST", headers: idem(), body: "{}" });
      const body = await res.json();
      if (!body.ok) { setError(body.error?.field_errors?.map((f: { field: string; message: string }) => `${f.field}: ${f.message}`).join(", ") || body.error?.message || "Commit failed"); return; }
      const d = body.data as { applied: boolean; imported?: number; status?: string; approvals_recorded?: number; approvals_needed?: number };
      if (!d.applied) { setNotice(`Approval recorded (${d.approvals_recorded}/${d.approvals_needed}). A second approver must commit this large import.`); return; }
      setNotice(`Import ${importBatch.batch_code}: ${d.imported}/${importBatch.importable} imported — ${String(d.status).replace(/_/g, " ")}.`);
      setImportRows([]); setImportFileName(""); setImportBatch(null); setTab("records"); setPage(1); setRefreshTick((t) => t + 1); scrollTop();
    } finally { setBusy(false); }
  };
  const cancelImportBatch = async () => {
    if (!importConfig || !importBatch) return;
    const reason = window.prompt("Reason for cancelling this import?");
    if (!reason) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`${endpoint}/${importConfig.subPath}/${importBatch.batch_id}/cancel`, { method: "POST", headers: idem(), body: JSON.stringify({ reason }) });
      const body = await res.json();
      if (!body.ok) { setError(body.error?.message || "Cancel failed"); return; }
      setNotice(`Import ${importBatch.batch_code} cancelled.`); setImportRows([]); setImportFileName(""); setImportBatch(null);
    } finally { setBusy(false); }
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
          <p>Download the template, fill one row per school, then upload a CSV or XLSX. Required: <code>{(importConfig.requiredColumns ?? importConfig.columns).join(", ")}</code>. The file is validated and de-duplicated first; you then commit the import. Large imports (≥5000 rows) need a second approver.</p>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn btn-light" onClick={downloadTemplate}>Download template</button>
            <input type="file" accept=".csv,.xlsx,text/csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onImportFile(f); }} />
            {importFileName ? <span style={{ color: "var(--finverse-muted)" }}>{importFileName} — {importRows.length} row(s)</span> : null}
          </div>
          {!importBatch ? (
            <div style={{ marginTop: 12 }}><button className="btn btn-dark" disabled={busy || importRows.length === 0} onClick={() => void validateImport()}>Validate{importRows.length ? ` ${importRows.length}` : ""}</button></div>
          ) : (
            <div className="card" style={{ marginTop: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <div>Batch <strong>{importBatch.batch_code}</strong> — {importBatch.status.replace(/_/g, " ")}: <strong>{importBatch.importable}</strong> ready · {importBatch.invalid} invalid · {importBatch.duplicates} duplicate(s){importBatch.needs_approval ? " · approval required (≥5000)" : ""}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-dark" disabled={busy || importBatch.importable === 0 || importBatch.status !== "validated"} onClick={() => void commitImport()}>Commit import</button>
                <button className="btn btn-light" disabled={busy} onClick={() => void cancelImportBatch()}>Cancel</button>
              </div>
            </div>
          )}
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
                            <button key={a.action} className={`btn btn-${a.variant ?? "light"}`} disabled={busy} onClick={() => setTx({ row: r, action: a.action, label: a.label, reason: a.reason, danger: a.danger })}>{a.label}</button>
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
            {tx.danger ? <p style={{ fontSize: 12.5, lineHeight: 1.7, color: "var(--finverse-attention)", fontWeight: 700 }}>This is a high-impact change. It takes effect immediately and is recorded in the audit log.</p> : null}
            <div className="field">
              <label htmlFor="tx-reason">Reason {(tx.reason ?? needsReason(tx.action)) ? <span style={{ color: "var(--finverse-attention)" }}>*</span> : <span style={{ color: "var(--finverse-muted)" }}>(optional)</span>}</label>
              <textarea id="tx-reason" className="input" style={{ minHeight: 72, padding: 10, resize: "vertical" }} value={txReason} onChange={(e) => setTxReason(e.target.value)} placeholder={`Why "${tx.label}"?`} />
            </div>
            {error ? <div className="chip chip-red" style={{ alignSelf: "flex-start" }}>{error}</div> : null}
            <div className="modal-actions">
              <button className="btn btn-light" onClick={closeTx}>Cancel</button>
              <button className={`btn ${tx.danger ? "btn-dark" : "btn-blue"}`} disabled={busy || ((tx.reason ?? needsReason(tx.action)) && !txReason.trim())} onClick={() => void confirmTx()}>{busy ? "Working…" : `Confirm ${tx.label}`}</button>
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
                <div className="card" key={i} style={{ padding: 12 }}>
                  {editItemId && editItemId === idOf(it) ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {(detailPanel.editFields ?? []).map((f) => (
                        <div className="field" key={f.key}>
                          <label htmlFor={`e-${f.key}`}>{f.label}{f.required ? " *" : ""}</label>
                          <FieldInput f={f} value={editForm[f.key] ?? ""} onChange={(v) => setEditForm((s) => ({ ...s, [f.key]: v }))} />
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button className="btn btn-light" disabled={busy} onClick={() => { setEditItemId(null); setEditForm({}); }}>Cancel</button>
                        <button className="btn btn-dark" disabled={busy} onClick={() => void saveEditItem()}>Save</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", flex: 1 }}>{detailPanel.listColumns.map((k) => (
                        <span key={k}><span style={{ color: "var(--finverse-muted)" }}>{titleize(k)}: </span><strong>{detailValue(it[k])}</strong></span>
                      ))}</div>
                      {detailPanel.editFields && String(it.interaction_status ?? "") !== "archived" ? (
                        <button className="btn btn-light" style={{ height: 26, padding: "0 10px", fontSize: 12 }} disabled={busy} onClick={() => startEditItem(it)}>Edit</button>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {(detailPanel.addFields ?? []).map((f) => (
              <div className="field" key={f.key}>
                <label htmlFor={`d-${f.key}`}>{f.label}</label>
                <FieldInput f={f} value={detailForm[f.key] ?? ""} onChange={(v) => setDetailForm((s) => ({ ...s, [f.key]: v }))} />
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn btn-light" onClick={() => setDetailRow(null)}>Close</button>
              {(detailPanel.addFields?.length ?? 0) > 0 ? <button className="btn btn-dark" disabled={busy} onClick={() => void addDetail()}>Add</button> : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

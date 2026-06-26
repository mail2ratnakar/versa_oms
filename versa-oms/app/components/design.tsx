// Versa design-system components (FR-DESIGN-SYSTEM-2026-0043) — the primitives from
// design-system/components/COMPONENT_INVENTORY.json, styled by app/design.css. Every screen composes these
// instead of bare HTML, so all pages render "as per DESIGN_SYSTEM.md".
import { cloneElement, isValidElement, type ReactNode, type ReactElement } from "react";

export type Crumb = { label: string; href?: string };

// Page header: title · description · breadcrumbs · primary actions · the next thing the user can do.
export function PageHeader({ eyebrow, title, description, breadcrumbs, nextAction, actions }: {
  eyebrow?: string; title: string; description?: string; breadcrumbs?: Crumb[]; nextAction?: string; actions?: ReactNode;
}) {
  return (
    <header className="ds-page-header">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="ds-breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((b, i) => (
            <span key={i}>{b.href ? <a href={b.href}>{b.label}</a> : b.label}{i < breadcrumbs.length - 1 && <span aria-hidden> › </span>}</span>
          ))}
        </nav>
      )}
      <div className="ds-page-header-row">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {description && <p className="ds-page-desc">{description}</p>}
          {nextAction && <p className="ds-next">{nextAction}</p>}
        </div>
        {actions && <div className="ds-header-actions">{actions}</div>}
      </div>
    </header>
  );
}

// Lifecycle/status label with meaning-carrying color (color is never the only indicator — text + dot).
const STATUS_VARIANT: Record<string, string> = {
  active: "success", approved: "success", released: "success", published: "success", paid: "success", completed: "success", resolved: "success", delivered: "success", granted: "success", verified: "success",
  generated: "info", under_review: "info", submitted: "info", queued: "info", scheduled: "info", reserved: "info", in_transit: "info", in_progress: "info", new: "info", open: "info", contacted: "info",
  draft: "neutral", archived: "neutral", superseded: "neutral", invited: "neutral", closed: "neutral", downloaded: "neutral",
  suspended: "warning", blocked: "warning", partially_paid: "warning", withheld: "warning", pending: "warning", escalated: "warning", waiting: "warning", needs_more_info: "warning", reopened: "warning", deprecated: "warning", disabled: "warning",
  revoked: "danger", rejected: "danger", failed: "danger", cancelled: "danger", expired: "danger", voided: "danger", lost: "danger", exited: "danger", validation_failed: "danger", dead_letter: "danger",
};
export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <>—</>;
  const v = STATUS_VARIANT[String(status)] ?? "neutral";
  return <span className={`ds-badge ds-badge-${v}`}>{String(status).replace(/_/g, " ")}</span>;
}
const RISK_VARIANT: Record<string, string> = { low: "info", medium: "warning", high: "warning", critical: "danger" };
export function RiskBadge({ risk }: { risk?: string | null }) {
  if (!risk) return <>—</>;
  return <span className={`ds-badge ds-badge-${RISK_VARIANT[String(risk)] ?? "neutral"}`}>{String(risk)}</span>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`card${className ? " " + className : ""}`}>{children}</div>;
}
export function Section({ title, children }: { title?: string; children: ReactNode }) {
  return <section className="ds-section">{title && <h2 className="ds-section-title">{title}</h2>}{children}</section>;
}
export function FormSection({ children }: { children: ReactNode }) {
  return <div className="ds-form-section">{children}</div>;
}
export function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  // Explicit label association (a11y): give the control a stable id derived from the label and pair it with
  // htmlFor, so screen readers announce the label for every input.
  const id = "f-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ id?: string }>, { id: (children as ReactElement<{ id?: string }>).props.id ?? id })
    : children;
  return (
    <div className="ds-field">
      <label className="ds-field-label" htmlFor={id}>{label}</label>
      {control}
      {help && <span className="ds-field-help">{help}</span>}
    </div>
  );
}
export function ReasonBox({ value, onChange, required = true }: { value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <Field label={`Reason${required ? " (required)" : ""}`} help="Captured on the audit trail with this action.">
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} required={required} placeholder="Why are you doing this?" />
    </Field>
  );
}
export function ValidationSummary({ errors }: { errors: string[] }) {
  if (!errors.length) return null;
  return <div className="ds-validation" role="alert"><strong>Please fix:</strong> {errors.join(" · ")}</div>;
}
export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="ds-empty">{children}</div>;
}

// ---- Dashboard ----
export function KpiCard({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: string; tone?: "success" | "warning" | "danger" | "info" | "neutral" }) {
  return (
    <div className={`ds-kpi${tone ? " ds-kpi-" + tone : ""}`}>
      <span className="ds-kpi-label">{label}</span>
      <span className="ds-kpi-value">{value}</span>
      {hint && <span className="ds-kpi-hint">{hint}</span>}
    </div>
  );
}

// ---- Feedback states (UI-001 loading / UI-002 empty / UI-004 error) ----
export function LoadingState({ rows = 3 }: { rows?: number }) {
  return <div className="ds-skeleton" role="status" aria-live="polite" aria-busy="true">{Array.from({ length: rows }).map((_, i) => <span key={i} className="ds-skeleton-row" />)}<span className="sr-only">Loading…</span></div>;
}
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="ds-error" role="alert">
      <p>{message ?? "Something went wrong. No internal details are shown."}</p>
      {onRetry && <button className="btn" onClick={onRetry}>Try again</button>}
    </div>
  );
}

// ---- Workflow / audit / privacy ----
export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="ds-filter-bar" role="search">{children}</div>;
}
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="ds-stepper">
      {steps.map((s, i) => <li key={i} className={`ds-step${i < current ? " done" : ""}${i === current ? " active" : ""}`} aria-current={i === current ? "step" : undefined}><span className="ds-step-dot">{i < current ? "✓" : i + 1}</span>{s}</li>)}
    </ol>
  );
}
export function ApprovalPanel({ required, recorded, decided, children }: { required: number; recorded: number; decided?: string; children?: ReactNode }) {
  const need = Math.max(0, required - recorded);
  return (
    <div className="ds-approval" role="group" aria-label="Maker-checker approval">
      <div className="ds-approval-state">
        <StatusBadge status={decided ?? (need === 0 ? "approved" : "under_review")} />
        <span>{decided ? `Decision: ${decided}` : need === 0 ? "Approved by the required approvers." : `Maker-checker: ${recorded} of ${required} distinct approvals — ${need} more needed.`}</span>
      </div>
      {children}
    </div>
  );
}
export type AuditItem = { action: string; actor?: string | null; at?: string | null; reason?: string | null };
export function AuditTimeline({ items }: { items: AuditItem[] }) {
  if (!items.length) return <EmptyState>No audit events yet.</EmptyState>;
  return (
    <ol className="ds-timeline">
      {items.map((it, i) => (
        <li key={i} className="ds-timeline-item">
          <span className="ds-timeline-dot" aria-hidden />
          <div><strong>{it.action.replace(/[._]/g, " ")}</strong>{it.actor && <span className="ds-timeline-meta"> · {it.actor}</span>}{it.at && <span className="ds-timeline-meta"> · {new Date(it.at).toLocaleString()}</span>}{it.reason && <p className="ds-timeline-reason">{it.reason}</p>}</div>
        </li>
      ))}
    </ol>
  );
}
export function SafeSummaryCard({ title, children }: { title: string; children: ReactNode }) {
  return <div className="card ds-safe"><span className="ds-safe-tag">masked · source-safe</span><h2 className="ds-section-title">{title}</h2>{children}</div>;
}
export function HighRiskActionPanel({ title, impact, affected, children }: { title: string; impact?: string; affected?: string; children: ReactNode }) {
  return (
    <div className="ds-highrisk" role="region" aria-label="High-risk action">
      <div className="ds-highrisk-head"><span className="ds-badge ds-badge-danger">high-risk</span><strong>{title}</strong></div>
      {impact && <p className="ds-highrisk-impact"><strong>Impact:</strong> {impact}</p>}
      {affected && <p className="ds-highrisk-impact"><strong>Affected:</strong> {affected}</p>}
      {children}
    </div>
  );
}

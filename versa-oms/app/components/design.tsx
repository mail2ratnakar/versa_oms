// Versa design-system components (FR-DESIGN-SYSTEM-2026-0043) — the primitives from
// design-system/components/COMPONENT_INVENTORY.json, styled by app/design.css. Every screen composes these
// instead of bare HTML, so all pages render "as per DESIGN_SYSTEM.md".
import type { ReactNode } from "react";

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
  return (
    <label className="ds-field">
      <span className="ds-field-label">{label}</span>
      {children}
      {help && <span className="ds-field-help">{help}</span>}
    </label>
  );
}
export function ValidationSummary({ errors }: { errors: string[] }) {
  if (!errors.length) return null;
  return <div className="ds-validation" role="alert"><strong>Please fix:</strong> {errors.join(" · ")}</div>;
}
export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="ds-empty">{children}</div>;
}

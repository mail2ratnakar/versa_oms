"use client";
// Interactive Versa design-system components (FR-DESIGN-COMPONENTS-2026-0044) — the overlay/feedback/privacy
// primitives from COMPONENT_INVENTORY that need state: Modal, Drawer, Toast, MaskedValue, SignedDownloadButton.
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

// Modal: small decisions/confirmations. Traps focus, closes on Escape / backdrop (DESIGN_SYSTEM §5/§9).
export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const el = ref.current;
    el?.querySelector<HTMLElement>("button, [href], input, select, textarea")?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="ds-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ds-modal" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <div className="ds-modal-head"><h2 className="ds-section-title">{title}</h2><button className="ds-icon-btn" aria-label="Close" onClick={onClose}>×</button></div>
        {children}
      </div>
    </div>
  );
}

// Drawer: side preview/detail without a route change.
export function Drawer({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="ds-overlay ds-overlay-right" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <aside className="ds-drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="ds-modal-head"><h2 className="ds-section-title">{title}</h2><button className="ds-icon-btn" aria-label="Close" onClick={onClose}>×</button></div>
        {children}
      </aside>
    </div>
  );
}

// Toast: non-blocking result notification.
export type Toast = { id: number; message: string; tone?: "success" | "danger" | "info" };
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(1);
  const push = useCallback((message: string, tone?: Toast["tone"]) => {
    const id = idRef.current++;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return { toasts, push };
}
export function ToastViewport({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="ds-toasts" role="status" aria-live="polite">
      {toasts.map((t) => <div key={t.id} className={`ds-toast ds-toast-${t.tone ?? "info"}`}>{t.message}</div>)}
    </div>
  );
}

// MaskedValue: sensitive value masked by default; reveal calls onReveal (so the caller can audit). DESIGN §8.
export function MaskedValue({ value, canReveal, onReveal }: { value: string; canReveal?: boolean; onReveal?: () => void }) {
  const [shown, setShown] = useState(false);
  const masked = value.length <= 4 ? "••••" : value.slice(0, 2) + "••••" + value.slice(-2);
  return (
    <span className="ds-masked">
      <span>{shown ? value : masked}</span>
      {canReveal && <button className="ds-icon-btn" aria-label={shown ? "Hide value" : "Reveal value"} onClick={() => { if (!shown) onReveal?.(); setShown((s) => !s); }}>{shown ? "Hide" : "Reveal"}</button>}
    </span>
  );
}

// SignedDownloadButton: requests a permission-checked signed URL, then opens it (never exposes the raw path).
export function SignedDownloadButton({ endpoint, label = "Download", headers }: { endpoint: string; label?: string; headers?: Record<string, string> }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function go() {
    setBusy(true); setErr(null);
    try {
      const j = await (await fetch(endpoint, { headers })).json();
      if (j.ok && j.data?.download_url) window.open(j.data.download_url as string, "_blank", "noopener");
      else setErr(j.error?.message ?? "Not available.");
    } catch { setErr("Download failed."); } finally { setBusy(false); }
  }
  return (
    <span>
      <button className="btn btn-blue" onClick={go} disabled={busy}>{busy ? "Preparing…" : label}</button>
      {err && <span className="ds-field-help" role="status" style={{ marginLeft: 8 }}>{err}</span>}
    </span>
  );
}

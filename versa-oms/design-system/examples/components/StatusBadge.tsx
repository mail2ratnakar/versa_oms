type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClass: Record<Tone, string> = {
  neutral: "bg-[var(--versa-neutral-bg)] text-[var(--versa-neutral)]",
  success: "bg-[var(--versa-success-bg)] text-[var(--versa-success)]",
  warning: "bg-[var(--versa-warning-bg)] text-[var(--versa-warning)]",
  danger: "bg-[var(--versa-danger-bg)] text-[var(--versa-danger)]",
  info: "bg-[var(--versa-info-bg)] text-[var(--versa-info)]"
};

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${toneClass[tone]}`}>
      {label}
    </span>
  );
}

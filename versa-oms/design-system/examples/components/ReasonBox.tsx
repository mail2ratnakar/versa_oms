export function ReasonBox({
  value,
  onChange,
  required = true
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">
        Reason {required ? <span aria-hidden="true">*</span> : null}
      </span>
      <textarea
        className="mt-2 min-h-28 w-full rounded-xl border border-[var(--versa-border)] p-3 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Explain why this action is required. This will be audited."
      />
    </label>
  );
}

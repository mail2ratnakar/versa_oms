export function SafeSummaryCard({
  title,
  items
}: {
  title: string;
  items: Array<{ label: string; value: string; masked?: boolean }>;
}) {
  return (
    <section className="rounded-2xl border border-[var(--versa-border)] bg-white p-4">
      <h2 className="text-base font-semibold">{title}</h2>
      <dl className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between gap-4">
            <dt className="text-sm text-[var(--versa-text-muted)]">{item.label}</dt>
            <dd className="text-sm font-medium">{item.masked ? "••••••" : item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

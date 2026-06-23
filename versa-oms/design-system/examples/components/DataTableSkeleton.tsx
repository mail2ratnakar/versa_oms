export function DataTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--versa-border)] bg-white">
      <div className="border-b border-[var(--versa-border)] p-4">
        <div className="h-4 w-48 rounded bg-slate-200" />
      </div>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="grid grid-cols-5 gap-4 border-b border-[var(--versa-border)] p-4">
          {Array.from({ length: 5 }).map((__, cell) => (
            <div key={cell} className="h-4 rounded bg-slate-100" />
          ))}
        </div>
      ))}
    </div>
  );
}

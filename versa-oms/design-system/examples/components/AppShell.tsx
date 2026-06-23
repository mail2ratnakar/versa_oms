import type { ReactNode } from "react";

export function AppShell({
  children,
  sidebar,
  topbar
}: {
  children: ReactNode;
  sidebar: ReactNode;
  topbar?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--versa-bg-app)] text-[var(--versa-text-primary)]">
      {topbar}
      <div className="flex min-h-screen">
        <aside className="w-[280px] border-r border-[var(--versa-border)] bg-white">
          {sidebar}
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

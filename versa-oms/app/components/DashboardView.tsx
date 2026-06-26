"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/design";

type Kpi = { key: string; label: string; value: number | string; tone: string };

export function DashboardView({ title, eyebrow, endpoint }: { title: string; eyebrow: string; endpoint: string }) {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(endpoint, { headers: { "x-request-id": crypto.randomUUID() } })
      .then((r) => r.json())
      .then((b) => {
        if (active && b.ok) setKpis(b.data?.kpis ?? []);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [endpoint]);

  return (
    <section className="module-view">
      <div className="hero-glass">
        <span className="eyebrow">
          <span className="dot" />
          {eyebrow}
        </span>
        <h1 style={{ marginTop: 12 }}>{title}</h1>
        <p>Live operational counts. Exceptions and approvals surface first; everything else is agent-operated.</p>
      </div>

      <div className="kpi-grid">
        {(loading ? Array.from({ length: 6 }, (_, i) => ({ key: String(i), label: "Loading…", value: "—", tone: "neutral" })) : kpis).map((k) => (
          <KpiCard key={k.key} label={k.label} value={k.value} tone={(["success", "warning", "danger", "info", "neutral"].includes(k.tone) ? k.tone : "neutral") as "success" | "warning" | "danger" | "info" | "neutral"} />
        ))}
      </div>

      <div className="card">
        <h2>Attention queue</h2>
        <p>Pending approvals, dual-approval requests, payment exceptions and SLA breaches will appear here as data flows in.</p>
      </div>
    </section>
  );
}

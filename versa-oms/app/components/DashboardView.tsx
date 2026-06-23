"use client";

import { useEffect, useState } from "react";

type Kpi = { key: string; label: string; value: number; tone: string };

const toneColor: Record<string, string> = {
  blue: "var(--finverse-action)",
  green: "#2e7a52",
  yellow: "#705900",
  red: "var(--finverse-attention)",
  default: "var(--finverse-ink)",
};

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
        {(loading ? Array.from({ length: 6 }, (_, i) => ({ key: String(i), label: "…", value: 0, tone: "default" })) : kpis).map((k) => (
          <div className="kpi" key={k.key}>
            <span className="value" style={{ color: toneColor[k.tone] ?? toneColor.default }}>
              {k.value}
            </span>
            <span className="label">{k.label}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Attention queue</h2>
        <p>Pending approvals, dual-approval requests, payment exceptions and SLA breaches will appear here as data flows in.</p>
      </div>
    </section>
  );
}

import type { FullConfig } from "@playwright/test";

// FR-QA-FIXTURE-WARMUP-2026-0012 — the dev server's FIRST Supabase query after a cold start can
// intermittently return empty (cold DB/PostgREST connection + Next on-demand route compile). That made
// e2e fixture lookups `.find()` undefined -> test.skip, silently dropping coverage. Warm the fixture
// routes (and the connection pool) until they return data, before any test runs.
const BASE = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3300";

// Routes that back e2e fixture lookups; each is polled until it returns >=1 item.
const WARM_ROUTES = [
  "/api/staff/core/schools?q=E2E-CH3-SCH",
  "/api/staff/core/students?q=E2E%20CH3%20Student%201",
  "/api/staff/core/participations?page_size=5",
  "/api/staff/students/rosters?q=E2E-ROSTER-CH3",
  "/api/staff/evaluation/score-batches?q=E2E-SCORE-CH6",
  "/api/staff/evaluation/import-batches?q=E2E-IMP-OMR",
  "/api/staff/results?q=E2E-RESBATCH-HANDOFF",
];

async function warm(path: string, deadline: number): Promise<boolean> {
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE + path);
      if (res.ok) {
        const body = (await res.json()) as { data?: { items?: unknown[] } };
        if ((body?.data?.items?.length ?? 0) > 0) return true;
      }
    } catch {
      /* dev server / DB not ready yet — keep polling */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false; // genuinely-absent fixture (seed not applied) — its tests will skip legitimately
}

// Pages the browser tests navigate to. Fetching each once triggers Next's on-demand compile so the
// first real navigation isn't slow enough to flake a visibility/hydration assertion.
const WARM_PAGES = ["/", "/staff/dashboard", "/staff/finance", "/staff/schools/crm", "/staff/schools/onboarding"];

async function compile(path: string): Promise<void> {
  try {
    await fetch(BASE + path);
  } catch {
    /* best-effort precompile */
  }
}

export default async function globalSetup(_config: FullConfig): Promise<void> {
  const deadline = Date.now() + 45_000;
  const results = await Promise.all(WARM_ROUTES.map((p) => warm(p, deadline)));
  const cold = WARM_ROUTES.filter((_, i) => !results[i]);
  if (cold.length) console.warn(`[global-setup] warmup did not see data for: ${cold.join(", ")} (seed may be missing)`);
  // Pre-compile the browser-navigated pages (sequentially — compilation is CPU-heavy).
  for (const p of WARM_PAGES) await compile(p);
}

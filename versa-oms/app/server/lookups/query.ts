// Shared helpers for the reference-picker lookup endpoints (FR-LOOKUP-SEARCH-2026-0050): parse the ?q= search
// term and ?limit=, escape the search for a safe ILIKE, and shape the {items, hasMore} result. Used by both
// /api/staff/lookup and /api/school/lookup so search + pagination behave identically everywhere.
import { NextRequest } from "next/server";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export function lookupQuery(request: NextRequest): { q: string; limit: number } {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const n = Number.parseInt(url.searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(n) ? Math.min(Math.max(n, 1), MAX_LIMIT) : DEFAULT_LIMIT;
  return { q, limit };
}

// Escape ILIKE wildcards so the user's text is matched literally (a typed % or _ is not a wildcard).
export function escapeLike(q: string): string {
  return q.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// One row past `limit` is fetched to detect more; trim back to `limit` and report hasMore.
export function lookupResult(data: unknown, labelCol: string, limit: number): { items: { value: string; label: string }[]; hasMore: boolean } {
  const rows = (data ?? []) as unknown as Array<Record<string, unknown>>;
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit).map((r) => ({ value: String(r.id), label: String(r[labelCol] ?? r.id) }));
  return { items, hasMore };
}

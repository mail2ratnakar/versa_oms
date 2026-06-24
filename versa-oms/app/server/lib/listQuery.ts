// Shared server-side list query helpers — filter / search / sort / facet counts.
// Used by BOTH the kernel (listModuleRecords) and custom services (CRM leadService) so every
// list page gets the same server-side toolbar behaviour from one implementation (PRINCIPLE P0.6).
// All filtering is server-side and scope-respecting (callers apply school/assignment scope on the base query).

export type ListQueryConfig = {
  filterColumns?: string[]; // exact-match filters; URL param = column name (e.g. ?stage=converted). "all"/empty ignored.
  searchColumns?: string[]; // OR ilike over these for ?q=term
  sortColumns?: string[]; // allowed ?sort=col:asc|desc
  defaultSort?: { column: string; ascending: boolean };
  ownerColumn?: string; // ?owner=mine -> eq(ownerColumn, actor.actor_id)
  facetColumn?: string; // ?facet=<facetColumn> -> per-value counts in response
  facetValues?: string[]; // the enum values to count
};

type QB = any; // supabase query builder
type ActorLike = { actor_id?: string };

function sanitizeTerm(t: string): string {
  // strip PostgREST or()-significant chars so a search term can't break the filter expression
  return t.replace(/[%,()*:]/g, " ").trim().slice(0, 80);
}

/** Apply exact filters + owner + search to a query. skipColumn lets facet counting omit its own column. */
export function applyListFilters(q: QB, sp: URLSearchParams, cfg: ListQueryConfig, actor: ActorLike, skipColumn?: string): QB {
  for (const col of cfg.filterColumns ?? []) {
    if (col === skipColumn) continue;
    const v = sp.get(col);
    if (v && v !== "all") q = q.eq(col, v);
  }
  if (cfg.ownerColumn && sp.get("owner") === "mine" && actor.actor_id) q = q.eq(cfg.ownerColumn, actor.actor_id);
  const term = sanitizeTerm(sp.get("q") ?? "");
  if (term && (cfg.searchColumns?.length ?? 0) > 0) {
    q = q.or(cfg.searchColumns!.map((c) => `${c}.ilike.%${term}%`).join(","));
  }
  return q;
}

/** Apply a whitelisted sort, else the default. */
export function applyListSort(q: QB, sp: URLSearchParams, cfg: ListQueryConfig): QB {
  const raw = sp.get("sort");
  if (raw) {
    const [col, dir] = raw.split(":");
    if ((cfg.sortColumns ?? []).includes(col)) return q.order(col, { ascending: dir === "asc", nullsFirst: false });
  }
  return cfg.defaultSort ? q.order(cfg.defaultSort.column, { ascending: cfg.defaultSort.ascending, nullsFirst: false }) : q;
}

/** Per-value counts for the facet column, respecting scope + all NON-facet filters/search. `makeBase`
 * returns a fresh scoped count-only query (select "*", {count:"exact", head:true}, archived filter, scope). */
export async function facetCounts(makeBase: () => QB, sp: URLSearchParams, cfg: ListQueryConfig, actor: ActorLike): Promise<Record<string, number> | undefined> {
  if (sp.get("facet") !== cfg.facetColumn || !cfg.facetColumn || !(cfg.facetValues?.length)) return undefined;
  const counts = await Promise.all(
    cfg.facetValues.map(async (v) => {
      let q = applyListFilters(makeBase(), sp, cfg, actor, cfg.facetColumn);
      q = q.eq(cfg.facetColumn!, v);
      const { count } = await q;
      return [v, count ?? 0] as const;
    })
  );
  const allQ = applyListFilters(makeBase(), sp, cfg, actor, cfg.facetColumn);
  const { count: total } = await allQ;
  return { _all: total ?? 0, ...Object.fromEntries(counts) };
}

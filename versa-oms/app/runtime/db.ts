// FROZEN-KERNEL — data layer. In-memory for dev/proof; swap the 4 methods for Postgres (0001_schema.sql) at deploy.
const store: Record<string, Map<string, Record<string, unknown>>> = {};
const tbl = (t: string) => (store[t] ??= new Map());
export const db = {
  async insert(table: string, input: Record<string, unknown>) {
    const id = crypto.randomUUID();
    const row = { id, ...input, created_at: new Date().toISOString() };
    tbl(table).set(id, row); return row;
  },
  async get(table: string, id: string) { return tbl(table).get(id) ?? null; },
  async list(table: string) { return [...tbl(table).values()]; },
  async update(table: string, id: string, patch: Record<string, unknown>) {
    const row = { ...(tbl(table).get(id) ?? {}), ...patch, updated_at: new Date().toISOString() };
    tbl(table).set(id, row); return row;
  },
};

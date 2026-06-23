/**
 * Centralized env access. Getters with local-dev fallbacks so `next build` and
 * local runs never crash on missing secrets. Real values are wired later via
 * .env.local / deployment env (Supabase URL + keys).
 */
function read(name: string, fallback: string): string {
  const v = process.env[name];
  return v === undefined || v === "" ? fallback : v;
}

export const env = {
  get SUPABASE_URL(): string {
    return read("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  },
  get SUPABASE_ANON_KEY(): string {
    return read("NEXT_PUBLIC_SUPABASE_ANON_KEY", "local-anon-key");
  },
  get SUPABASE_SERVICE_ROLE_KEY(): string {
    return read("SUPABASE_SERVICE_ROLE_KEY", "local-service-role-key");
  },
  get IS_LOCAL(): boolean {
    return process.env.NEXT_PUBLIC_SUPABASE_URL === undefined;
  },
};

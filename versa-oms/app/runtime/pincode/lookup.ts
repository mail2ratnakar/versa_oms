// FROZEN-KERNEL — pincode -> {city, state} proxy. Server-side so the browser doesn't call a third party
// (no CORS, cacheable, swappable). Provider via PINCODE_PROVIDER (default india_post). Plug-and-play like the
// email gateway: add a provider branch, nothing else changes. In-memory cache for the dev/in-memory runtime.
const cache = new Map<string, { city: string; state: string } | null>();

async function indiaPost(pin: string): Promise<{ city: string; state: string } | null> {
  const r = await fetch("https://api.postalpincode.in/pincode/" + pin);
  const j = (await r.json()) as Array<{ PostOffice?: Array<{ District?: string; Name?: string; State?: string }> }>;
  const po = j?.[0]?.PostOffice?.[0];
  return po ? { city: po.District || po.Name || "", state: po.State || "" } : null;
}

const PROVIDERS: Record<string, (pin: string) => Promise<{ city: string; state: string } | null>> = {
  india_post: indiaPost,
};

export async function lookupPincode(pin: string): Promise<{ city: string; state: string } | null> {
  const v = String(pin).replace(/[^0-9]/g, "").slice(0, 6);
  if (v.length !== 6) return null;
  if (cache.has(v)) return cache.get(v) ?? null;
  const provider = PROVIDERS[(process.env.PINCODE_PROVIDER || "india_post").toLowerCase()] || indiaPost;
  let result: { city: string; state: string } | null = null;
  try { result = await provider(v); } catch { result = null; }
  cache.set(v, result);
  return result;
}

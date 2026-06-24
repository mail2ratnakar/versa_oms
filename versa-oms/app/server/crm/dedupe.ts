/**
 * School-lead duplicate detection. Matches by email, phone (digits only), website,
 * or normalized school-name + city/state. Pure — used by CRM import.
 */
export type Lead = {
  school_name?: string;
  city?: string;
  state?: string;
  email?: string;
  phone?: string;
  website?: string;
  [k: string]: unknown;
};

const norm = (s?: string) => (s || "").toLowerCase().trim().replace(/\s+/g, " ");
const digits = (s?: string) => (s || "").replace(/\D/g, "");
// Compare the national 10-digit tail so country-code prefixes (+91) still match.
const phoneTail = (s?: string) => digits(s).slice(-10);

export function leadKey(l: Lead): string {
  return `${norm(l.school_name)}|${norm(l.city || l.state)}`;
}

export function isDuplicate(a: Lead, b: Lead): boolean {
  if (a.email && b.email && norm(a.email) === norm(b.email)) return true;
  if (a.phone && b.phone && phoneTail(a.phone).length >= 10 && phoneTail(a.phone) === phoneTail(b.phone)) return true;
  if (a.website && b.website && norm(a.website) === norm(b.website)) return true;
  return !!norm(a.school_name) && leadKey(a) === leadKey(b);
}

/**
 * O(n) duplicate partition. Hash-indexes the same dimensions isDuplicate compares
 * (email, phone-tail, website, name+city/state key) instead of scanning every pair,
 * so large imports don't degrade quadratically. Result is identical to the pairwise
 * version: an incoming row is a duplicate if it collides with any existing row OR any
 * earlier accepted-unique row (indexed incrementally).
 */
export function findDuplicates(incoming: Lead[], existing: Lead[]): { unique: Lead[]; duplicates: Lead[] } {
  const emails = new Set<string>();
  const phones = new Set<string>();
  const websites = new Set<string>();
  const keys = new Set<string>();
  const index = (l: Lead) => {
    if (l.email) emails.add(norm(l.email));
    const p = phoneTail(l.phone);
    if (p.length >= 10) phones.add(p);
    if (l.website) websites.add(norm(l.website));
    if (norm(l.school_name)) keys.add(leadKey(l));
  };
  const collides = (l: Lead): boolean => {
    if (l.email && emails.has(norm(l.email))) return true;
    const p = phoneTail(l.phone);
    if (p.length >= 10 && phones.has(p)) return true;
    if (l.website && websites.has(norm(l.website))) return true;
    return !!norm(l.school_name) && keys.has(leadKey(l));
  };
  for (const e of existing) index(e);
  const unique: Lead[] = [];
  const duplicates: Lead[] = [];
  for (const inc of incoming) {
    if (collides(inc)) duplicates.push(inc);
    else { unique.push(inc); index(inc); }
  }
  return { unique, duplicates };
}

/**
 * Import-time classification (FR-0010 perf + FR-0009 review): like findDuplicates, but each duplicate
 * carries the id of the matched EXISTING lead (the master) when known — so import collisions can be
 * surfaced as possible_duplicate rows pointing at the original. Within-batch duplicates (collide with an
 * earlier accepted row that has no id yet) carry duplicate_of = null. O(n) via dimension->id maps.
 */
export type ExistingLead = Lead & { id?: string };
export function classifyImport(incoming: Lead[], existing: ExistingLead[]): { unique: Lead[]; duplicates: Array<{ lead: Lead; duplicate_of: string | null }> } {
  const emailMap = new Map<string, string>();
  const phoneMap = new Map<string, string>();
  const websiteMap = new Map<string, string>();
  const keyMap = new Map<string, string>();
  const seenEmail = new Set<string>();
  const seenPhone = new Set<string>();
  const seenWebsite = new Set<string>();
  const seenKey = new Set<string>();
  for (const e of existing) {
    const id = String(e.id ?? "");
    if (!id) continue;
    if (e.email && !emailMap.has(norm(e.email))) emailMap.set(norm(e.email), id);
    const p = phoneTail(e.phone); if (p.length >= 10 && !phoneMap.has(p)) phoneMap.set(p, id);
    if (e.website && !websiteMap.has(norm(e.website))) websiteMap.set(norm(e.website), id);
    if (norm(e.school_name) && !keyMap.has(leadKey(e))) keyMap.set(leadKey(e), id);
  }
  const matchExisting = (l: Lead): string | null => {
    if (l.email && emailMap.has(norm(l.email))) return emailMap.get(norm(l.email))!;
    const p = phoneTail(l.phone); if (p.length >= 10 && phoneMap.has(p)) return phoneMap.get(p)!;
    if (l.website && websiteMap.has(norm(l.website))) return websiteMap.get(norm(l.website))!;
    if (norm(l.school_name) && keyMap.has(leadKey(l))) return keyMap.get(leadKey(l))!;
    return null;
  };
  const collidesSeen = (l: Lead): boolean => {
    if (l.email && seenEmail.has(norm(l.email))) return true;
    const p = phoneTail(l.phone); if (p.length >= 10 && seenPhone.has(p)) return true;
    if (l.website && seenWebsite.has(norm(l.website))) return true;
    return !!norm(l.school_name) && seenKey.has(leadKey(l));
  };
  const seen = (l: Lead) => {
    if (l.email) seenEmail.add(norm(l.email));
    const p = phoneTail(l.phone); if (p.length >= 10) seenPhone.add(p);
    if (l.website) seenWebsite.add(norm(l.website));
    if (norm(l.school_name)) seenKey.add(leadKey(l));
  };
  const unique: Lead[] = [];
  const duplicates: Array<{ lead: Lead; duplicate_of: string | null }> = [];
  for (const inc of incoming) {
    const masterId = matchExisting(inc);
    if (masterId) duplicates.push({ lead: inc, duplicate_of: masterId });
    else if (collidesSeen(inc)) duplicates.push({ lead: inc, duplicate_of: null });
    else { unique.push(inc); seen(inc); }
  }
  return { unique, duplicates };
}

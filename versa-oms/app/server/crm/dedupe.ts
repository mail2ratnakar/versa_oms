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

export function findDuplicates(incoming: Lead[], existing: Lead[]): { unique: Lead[]; duplicates: Lead[] } {
  const unique: Lead[] = [];
  const duplicates: Lead[] = [];
  for (const inc of incoming) {
    if (existing.some((e) => isDuplicate(inc, e)) || unique.some((u) => isDuplicate(inc, u))) duplicates.push(inc);
    else unique.push(inc);
  }
  return { unique, duplicates };
}

// FR-SCHOOL-CRM-2026-0010 — O(n) findDuplicates: parity with the documented match rules + perf at scale.
import { describe, it, expect } from "vitest";
import { findDuplicates, isDuplicate, type Lead } from "@/server/crm/dedupe";

const L = (o: Partial<Lead>): Lead => ({ school_name: "X", city: "Delhi", ...o });

describe("FR-0010 dedupe parity", () => {
  it("flags an email collision against existing", () => {
    const r = findDuplicates([L({ school_name: "New", email: "a@x.com" })], [L({ school_name: "Old", email: "A@X.com" })]);
    expect(r.duplicates).toHaveLength(1);
    expect(r.unique).toHaveLength(0);
  });
  it("flags a phone collision ignoring country-code prefix", () => {
    const r = findDuplicates([L({ school_name: "New", phone: "+91 98765 43210" })], [L({ school_name: "Old", phone: "9876543210" })]);
    expect(r.duplicates).toHaveLength(1);
  });
  it("flags a website collision", () => {
    const r = findDuplicates([L({ school_name: "New", website: "HTTP://S.com " })], [L({ school_name: "Old", website: "http://s.com" })]);
    expect(r.duplicates).toHaveLength(1);
  });
  it("flags a normalized name + city key collision", () => {
    const r = findDuplicates([L({ school_name: "  Delhi Public  School ", city: "Delhi" })], [L({ school_name: "delhi public school", city: "delhi" })]);
    expect(r.duplicates).toHaveLength(1);
  });
  it("flags a within-batch duplicate (second identical incoming)", () => {
    const r = findDuplicates([L({ school_name: "Dup", email: "d@x.com" }), L({ school_name: "Dup2", email: "d@x.com" })], []);
    expect(r.unique).toHaveLength(1);
    expect(r.duplicates).toHaveLength(1);
  });
  it("passes genuinely distinct rows and preserves order", () => {
    const inc = [L({ school_name: "A", email: "a@x.com" }), L({ school_name: "B", email: "b@x.com" }), L({ school_name: "C", email: "c@x.com" })];
    const r = findDuplicates(inc, []);
    expect(r.unique.map((u) => u.school_name)).toEqual(["A", "B", "C"]);
    expect(r.duplicates).toHaveLength(0);
  });
  it("findDuplicates agrees with pairwise isDuplicate on a small set", () => {
    const existing = [L({ school_name: "E1", email: "e1@x.com" })];
    const inc = [L({ school_name: "E1b", email: "e1@x.com" }), L({ school_name: "Fresh", email: "fresh@x.com" })];
    const r = findDuplicates(inc, existing);
    expect(r.duplicates.map((d) => isDuplicate(d, existing[0]))).toEqual([true]); // the flagged one truly collides
  });
});

describe("FR-0010 dedupe perf (O(n))", () => {
  it("dedupes 20,000 rows quickly and correctly (would not terminate timely under O(n^2))", () => {
    const incoming: Lead[] = Array.from({ length: 20000 }, (_, i) => L({ school_name: `S${i}`, email: `s${i}@x.com` }));
    incoming.push(L({ school_name: "S0-dup", email: "s0@x.com" })); // one guaranteed duplicate
    const t0 = performance.now();
    const r = findDuplicates(incoming, []);
    const ms = performance.now() - t0;
    expect(r.unique).toHaveLength(20000);
    expect(r.duplicates).toHaveLength(1);
    expect(ms).toBeLessThan(2000); // generous; O(n^2) on 20k would be ~minutes
  });
});

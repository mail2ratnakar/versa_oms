// FR-AMOUNT-2026-0001 — server-calculated invoice amounts (browser amounts never trusted).
import { describe, it, expect } from "vitest";
import { computeOnCreate } from "@/server/lib/createCompute";

describe("FR-AMOUNT-0001 computeOnCreate (finance_invoices)", () => {
  it("computes gross/net/balance from student count x price (+ discount/tax)", () => {
    const r = computeOnCreate("finance_invoices", { confirmed_student_count: 10, price_per_student: 100, discount_amount: 50, tax_amount: 20 });
    expect(r.gross_amount).toBe(1000);          // 10 * 100
    expect(r.net_payable_amount).toBe(970);     // 1000 - 50 + 20
    expect(r.balance_due).toBe(970);            // net - amount_paid(0)
    expect(r.amount_paid).toBe(0);
    expect(String(r.invoice_number)).toMatch(/^INV-/);
  });
  it("ignores any browser-supplied totals (computes from inputs only)", () => {
    const r = computeOnCreate("finance_invoices", { confirmed_student_count: 5, price_per_student: 200, gross_amount: 1, net_payable_amount: 1, balance_due: 1 });
    expect(r.gross_amount).toBe(1000);          // 5 * 200, NOT the client's 1
    expect(r.net_payable_amount).toBe(1000);
    expect(r.balance_due).toBe(1000);
  });
  it("no-op for non-computed tables", () => {
    expect(computeOnCreate("schools", { name: "x" })).toEqual({});
  });
});

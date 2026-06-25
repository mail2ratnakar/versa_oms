// FR-AMOUNT-2026-0001 — server-calculated fields on create. The browser NEVER supplies monetary
// totals (amounts_server_calculated / browser_amount_never_trusted); they are derived here from
// trusted inputs. Returned object is merged authoritatively over the insert row.
const money = (n: number) => Math.round(n * 100) / 100;
const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

export function computeOnCreate(table: string, input: Record<string, unknown>): Record<string, unknown> {
  if (table === "finance_invoices") {
    const count = num(input.confirmed_student_count);
    const price = num(input.price_per_student);
    const discount = num(input.discount_amount);
    const tax = num(input.tax_amount);
    const commission = num(input.school_commission_amount);
    const gross = money(price * count);
    const net = money(gross - discount + tax);
    return {
      invoice_number: "INV-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
      gross_amount: gross,
      discount_amount: money(discount),
      tax_amount: money(tax),
      school_commission_amount: money(commission),
      net_payable_amount: net,
      amount_paid: 0,
      balance_due: net,
    };
  }
  if (table === "certificates") {
    // FR-CERT-GENERATION-0004: server-control the credential identity (P2.4 / P3.9).
    // certificate_number is the human ref; verification_code is the public, unguessable lookup key.
    const rand = () => crypto.randomUUID().replace(/-/g, "").toUpperCase();
    const v = rand();
    return {
      certificate_number: "CERT-" + rand().slice(0, 8),
      verification_code: `VRS-${v.slice(0, 4)}-${v.slice(4, 8)}-${v.slice(8, 12)}`,
    };
  }
  return {};
}

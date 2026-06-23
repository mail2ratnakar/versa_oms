/**
 * Finance computation. Invoice amounts are SERVER-calculated (never trusted from
 * the browser) and receipts get a deterministic, sortable number. Optional GST.
 * Pure.
 */
export function computeInvoiceAmount(input: {
  unitPrice: number;
  studentCount: number;
  discount?: number;
  gstRate?: number;
}): { base: number; discount: number; taxable: number; gst: number; total: number } {
  const base = Math.max(0, input.unitPrice) * Math.max(0, input.studentCount);
  const discount = Math.min(base, Math.max(0, input.discount ?? 0));
  const taxable = base - discount;
  const gst = Math.round(taxable * Math.max(0, input.gstRate ?? 0)) / 1;
  return { base, discount, taxable, gst, total: taxable + gst };
}

export function receiptNumber(schoolCode: string, seq: number, year = new Date().getFullYear()): string {
  const sc = (schoolCode || "SCH").toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 6);
  return `RCPT-${year}-${sc}-${String(seq).padStart(5, "0")}`;
}

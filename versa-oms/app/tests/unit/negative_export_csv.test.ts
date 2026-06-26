import { describe, it, expect } from "vitest";
import { toCsv } from "@/server/reports/exporter";

// Negative pack SEC-011 / WF-011-NEG-014 — CSV / spreadsheet formula injection. Values beginning with
// =,+,-,@,tab,CR must be neutralized so a malicious cell cannot execute as a formula when opened in Excel.
describe("CSV formula injection is neutralized (SEC-011 / WF-011-NEG-014)", () => {
  const dangerous = ["=cmd|'/c calc'!A1", "+1+1", "-2+3", "@SUM(A1:A9)", "\tTAB", "\rCR"];
  it("prefixes formula-trigger values with a quote", () => {
    const csv = toCsv(dangerous.map((v) => ({ c: v })), ["c"], { generated_by: "t", scope: "test" });
    const lines = csv.split("\n");
    // data rows start after the 5 header lines + the column header line
    const dataLines = lines.slice(6, 6 + dangerous.length);
    for (const line of dataLines) {
      const cell = line.replace(/^"|"$/g, "");
      expect(cell.startsWith("'"), `neutralized: ${JSON.stringify(line)}`).toBe(true);
    }
  });
  it("leaves a safe value untouched", () => {
    const csv = toCsv([{ c: "Greenwood School" }], ["c"], { generated_by: "t", scope: "test" });
    expect(csv).toContain("Greenwood School");
    expect(csv).not.toContain("'Greenwood");
  });
});

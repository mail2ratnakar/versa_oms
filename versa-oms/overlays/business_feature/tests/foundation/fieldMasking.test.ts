import assert from "node:assert";
import { maskRecord } from "../../server/security/fieldMasking";

const masked = maskRecord({
  student_name: "Demo Student",
  parent_phone: "+91-9876543210",
  payment_reference: "BANK123456"
});

assert.equal(masked.student_name, "Demo Student");
assert.notEqual(masked.parent_phone, "+91-9876543210");
assert.equal(masked.payment_reference, "[MASKED]");

console.log("field masking foundation tests passed");

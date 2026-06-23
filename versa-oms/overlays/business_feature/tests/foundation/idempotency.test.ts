import assert from "node:assert";
import { hashPayload } from "../../server/idempotency/idempotencyStore";

assert.equal(hashPayload({ a: 1 }), hashPayload({ a: 1 }));
assert.notEqual(hashPayload({ a: 1 }), hashPayload({ a: 2 }));

console.log("idempotency foundation tests passed");

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const required = [
  "package.json",
  "app/layout.tsx",
  "app/page.tsx",
  "app/api/health/route.ts",
  "server/guards/requireStaffScope.ts",
  "server/audit/createAuditEvent.ts"
];

for (const file of required) {
  assert.ok(fs.existsSync(path.join(process.cwd(), file)), `Missing ${file}`);
}

console.log("Smoke scaffold test passed.");

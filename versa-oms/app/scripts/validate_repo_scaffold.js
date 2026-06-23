const fs = require("fs");
const path = require("path");

const required = [
  "package.json",
  "app/layout.tsx",
  "app/page.tsx",
  "app/api/health/route.ts",
  "server/guards/requireStaffScope.ts",
  "server/guards/requireSchoolScope.ts",
  "server/audit/createAuditEvent.ts",
  "migrations/0001_init.sql"
];

let ok = true;
for (const file of required) {
  if (!fs.existsSync(path.join(process.cwd(), file))) {
    console.error(`Missing required file: ${file}`);
    ok = false;
  }
}

if (!ok) process.exit(1);
console.log("Repo scaffold validation passed.");

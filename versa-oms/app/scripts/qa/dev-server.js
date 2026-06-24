// FR-QA-FEEDBACK-2026-0001 (CR-1) — Windows-safe `next dev` wrapper that tees output to
// .qa/logs/dev-server.log (bash `| tee` is not portable on the default Windows shell).
// Used by `npm run dev:qa` and auto-started by playwright.config webServer. Port 3300 (our e2e convention).
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const dir = path.resolve(process.cwd(), ".qa/logs");
fs.mkdirSync(dir, { recursive: true });
const out = fs.createWriteStream(path.join(dir, "dev-server.log"), { flags: "a" });
out.write(`\n=== dev:qa started ${new Date().toISOString()} ===\n`);

const port = process.env.QA_PORT || "3300";
// shell:true is required on Windows to spawn npx without EINVAL (and resolves npx.cmd for us).
const child = spawn("npx", ["next", "dev", "-p", port], { stdio: ["inherit", "pipe", "pipe"], shell: true });

const tee = (src, dst) => src.on("data", (d) => { dst.write(d); out.write(d); });
tee(child.stdout, process.stdout);
tee(child.stderr, process.stderr);

child.on("exit", (code) => process.exit(code ?? 0));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));

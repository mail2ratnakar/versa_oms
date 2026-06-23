#!/usr/bin/env node
/**
 * generate_routes.js
 *
 * Generate guarded TypeScript API route stubs from module messages.json files.
 * These stubs intentionally fail closed with 501 until implemented.
 *
 * Usage:
 * node scripts/generate_routes.js --root . --module finance_ops
 * node scripts/generate_routes.js --root . --all
 */

const fs = require('fs');
const path = require('path');

function arg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : fallback;
}
function has(name) { return process.argv.includes(name); }
function readJson(file, fallback = null) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function safeName(value) {
  return String(value || 'route').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'route';
}
function discoverModules(root) {
  const specRoot = path.join(root, 'spec', 'modules');
  if (!fs.existsSync(specRoot)) return [];
  return fs.readdirSync(specRoot).filter(n => fs.statSync(path.join(specRoot, n)).isDirectory()).sort();
}
function guardForRoute(route) {
  if (route.startsWith('/api/staff')) return 'requireStaffAuthAndScope';
  if (route.startsWith('/api/school')) return 'requireSchoolAuthAndScope';
  if (route.startsWith('/api/internal')) return 'requireInternalSystemAuth';
  if (route.startsWith('/api/verify')) return 'requirePublicAllowListAndRateLimit';
  return 'denyByDefault';
}
function routeStub(moduleId, msg) {
  const method = String(msg.method || 'POST').toUpperCase();
  const route = msg.route || `/api/staff/${moduleId}`;
  const guard = guardForRoute(route);
  const messageId = msg.message_id || safeName(route);
  const audit = msg.audit_required !== false;
  const idempotency = msg.idempotency && msg.idempotency.required;
  return `// Auto-generated guarded route stub for ${moduleId}.${messageId}\n` +
`// Source route: ${method} ${route}\n` +
`// Guard: ${guard}\n` +
`// Audit required: ${audit}\n` +
`// Idempotency required: ${Boolean(idempotency)}\n\n` +
`import { NextRequest, NextResponse } from 'next/server';\n\n` +
`export async function ${method}(request: NextRequest) {\n` +
`  // TODO: replace fail-closed stub with real implementation after tests exist.\n` +
`  // Required guard: ${guard}(request)\n` +
`  // Required validation: server-side body/params validation\n` +
`  // Required audit event: ${audit}\n` +
`  // Required idempotency: ${Boolean(idempotency)}\n` +
`  return NextResponse.json({ ok: false, error: { code: 'NOT_IMPLEMENTED', message: '${messageId} is not implemented yet.' }, meta: { module: '${moduleId}' } }, { status: 501 });\n` +
`}\n`;
}
function generate(root, moduleId, outRoot) {
  const messagesPath = path.join(root, 'spec', 'modules', moduleId, 'messages.json');
  const messages = readJson(messagesPath, {});
  const items = Array.isArray(messages.messages) ? messages.messages : [];
  const moduleOut = path.join(outRoot, moduleId);
  fs.mkdirSync(moduleOut, { recursive: true });
  const files = [];
  for (const msg of items) {
    const file = path.join(moduleOut, `${safeName(msg.message_id || msg.route)}.ts`);
    fs.writeFileSync(file, routeStub(moduleId, msg), 'utf8');
    files.push(file);
  }
  return { module_id: moduleId, route_count: files.length, files };
}
function main() {
  const root = path.resolve(arg('--root', '.'));
  const outRoot = path.resolve(root, arg('--out', 'generated/routes'));
  let modules = [];
  if (has('--all')) modules = discoverModules(root);
  else if (arg('--module')) modules = [arg('--module')];
  else {
    console.error('Use --module <id> or --all');
    process.exit(1);
  }
  fs.mkdirSync(outRoot, { recursive: true });
  const results = modules.map(m => generate(root, m, outRoot));
  fs.writeFileSync(path.join(outRoot, 'route_generation_report.json'), JSON.stringify({ status: 'ROUTES_GENERATED', results }, null, 2), 'utf8');
  console.log(JSON.stringify({ status: 'ROUTES_GENERATED', module_count: results.length, out: outRoot }, null, 2));
}
main();

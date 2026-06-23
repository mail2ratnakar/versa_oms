#!/usr/bin/env node
/**
 * generate_tests.js
 *
 * Generate Vitest-style test stubs from module tests.json and validations.json.
 * Tests fail by default until implementation is connected, preventing false confidence.
 *
 * Usage:
 * node scripts/generate_tests.js --root . --module results_ops
 * node scripts/generate_tests.js --root . --all
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
  return String(value || 'test').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'test';
}
function discoverModules(root) {
  const specRoot = path.join(root, 'spec', 'modules');
  if (!fs.existsSync(specRoot)) return [];
  return fs.readdirSync(specRoot).filter(n => fs.statSync(path.join(specRoot, n)).isDirectory()).sort();
}
function testFile(moduleId, tests, validations) {
  const lines = [];
  lines.push(`// Auto-generated test stubs for ${moduleId}`);
  lines.push(`import { describe, it, expect } from 'vitest';`);
  lines.push('');
  lines.push(`describe('${moduleId}', () => {`);
  for (const t of tests) {
    const id = t.test_id || t.rule_id || safeName(t.assertion || 'test');
    const assertion = t.assertion || id.replace(/_/g, ' ');
    lines.push(`  it('${id}: ${assertion}', async () => {`);
    lines.push(`    // TODO: connect to implementation. This intentionally fails until real guard/test is implemented.`);
    lines.push(`    expect(false, 'Pending implementation for ${id}').toBe(true);`);
    lines.push(`  });`);
    lines.push('');
  }
  for (const v of validations) {
    const id = v.rule_id || safeName(v.logic || 'validation');
    lines.push(`  it('validation_${id}', async () => {`);
    lines.push(`    // Required validation: ${String(v.logic || id).replace(/`/g, '')}`);
    lines.push(`    expect(false, 'Pending validation test for ${id}').toBe(true);`);
    lines.push(`  });`);
    lines.push('');
  }
  lines.push('});');
  return lines.join('\n');
}
function generate(root, moduleId, outRoot) {
  const testsJson = readJson(path.join(root, 'spec', 'modules', moduleId, 'tests.json'), {});
  const validationsJson = readJson(path.join(root, 'spec', 'modules', moduleId, 'validations.json'), {});
  const tests = Array.isArray(testsJson.tests) ? testsJson.tests : [];
  const validations = Array.isArray(validationsJson.validations) ? validationsJson.validations : [];
  fs.mkdirSync(outRoot, { recursive: true });
  const file = path.join(outRoot, `${moduleId}.generated.spec.ts`);
  fs.writeFileSync(file, testFile(moduleId, tests, validations), 'utf8');
  return { module_id: moduleId, test_count: tests.length, validation_count: validations.length, file };
}
function main() {
  const root = path.resolve(arg('--root', '.'));
  const outRoot = path.resolve(root, arg('--out', 'generated/tests'));
  let modules = [];
  if (has('--all')) modules = discoverModules(root);
  else if (arg('--module')) modules = [arg('--module')];
  else {
    console.error('Use --module <id> or --all');
    process.exit(1);
  }
  const results = modules.map(m => generate(root, m, outRoot));
  fs.writeFileSync(path.join(outRoot, 'test_generation_report.json'), JSON.stringify({ status: 'TESTS_GENERATED', results }, null, 2), 'utf8');
  console.log(JSON.stringify({ status: 'TESTS_GENERATED', module_count: results.length, out: outRoot }, null, 2));
}
main();

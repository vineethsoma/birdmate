#!/usr/bin/env node
/**
 * Verification orchestrator: runs verifiers cheapest-first and stops at the first
 * failure, printing a minimal counterexample the agent (or a human) can act on.
 *
 *   node verify/run.mjs types|data|contract|pbt|fast|all [--runs N]
 *
 * `fast` = types + contract (seconds), `all` = types, data, contract, pbt.
 * `--runs N` sets the number of property-test runs (default 100; CI uses more).
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const backend = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(backend, '..');
const [, , target = 'all', ...rest] = process.argv;
const runsIdx = rest.indexOf('--runs');
const runs = runsIdx >= 0 ? rest[runsIdx + 1] : process.env.VERIFY_RUNS;
if (runsIdx >= 0 && !/^\d+$/.test(runs ?? '')) { console.error('--runs needs a positive integer'); process.exit(2); }

const tsc = resolve(backend, 'node_modules/.bin/tsc');
const vitest = (file) => [resolve(backend, 'node_modules/.bin/vitest'), 'run', '-c', 'vitest.verify.config.ts', `verify/${file}.verify.ts`];

const typeChecks = [
  ['backend', [tsc, '--noEmit', '-p', backend]],
  ['formal + verifiers', [tsc, '--noEmit', '-p', resolve(backend, 'verify')]],
  ['shared', [tsc, '--noEmit', '-p', resolve(root, 'shared')]],
  ['frontend', [tsc, '--noEmit', '-p', resolve(root, 'frontend')]],
];

const steps = {
  types: () => typeChecks.map(([name, cmd]) => ({ name: `types: ${name}`, cmd, cwd: backend })),
  data: () => [{ name: 'data', cmd: vitest('data'), cwd: backend }],
  contract: () => [{ name: 'contract', cmd: vitest('contract'), cwd: backend }],
  pbt: () => [{ name: `pbt (${runs ?? 100} runs)`, cmd: vitest('pbt'), cwd: backend }],
};
const plan = {
  types: ['types'], data: ['data'], contract: ['contract'], pbt: ['pbt'],
  fast: ['types', 'contract'], all: ['types', 'data', 'contract', 'pbt'],
}[target];
if (!plan) { console.error(`unknown target "${target}" (types|data|contract|pbt|fast|all)`); process.exit(2); }

const env = { ...process.env, ...(runs ? { VERIFY_RUNS: runs } : {}) };
let failed = false;
for (const step of plan.flatMap(p => steps[p]())) {
  const [bin, ...args] = step.cmd;
  if (!existsSync(bin)) { console.error(`❌ ${step.name}: ${bin} not found; run "npm ci" in backend/`); failed = true; break; }
  if (step.name.includes('frontend') && !existsSync(resolve(root, 'frontend/node_modules'))) {
    console.error(`❌ ${step.name}: frontend/node_modules missing; run "npm ci" in frontend/`); failed = true; break;
  }
  const t0 = Date.now();
  const r = spawnSync(bin, args, { cwd: step.cwd, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  if (r.status === 0) { console.log(`✅ verify:${step.name} (${secs}s)`); continue; }
  failed = true;
  const out = `${r.stdout ?? ''}\n${r.stderr ?? ''}`.split('\n').filter(l => !/^\s+at /.test(l) && !/^\{"timestamp"/.test(l));
  console.error(`\n❌ verify:${step.name} FAILED (${secs}s)\n`);
  const marks = out.map((l, i) => (/❌|Counterexample|Shrunk|AssertionError|error TS|FAIL /.test(l) ? i : -1)).filter(i => i >= 0);
  if (marks.length) {
    const start = Math.max(0, marks[0] - 1);
    console.error(out.slice(start, start + 40).join('\n'));
  } else {
    console.error(out.slice(-40).join('\n'));
  }
  console.error('\nFix the implementation (backend/ or frontend/). formal/ is the read-only spec.');
  break;
}
process.exit(failed ? 1 : 0);

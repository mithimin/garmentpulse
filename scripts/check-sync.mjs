// scripts/check-sync.mjs
//
// Keeps the team in sync. It checks that:
//   1. every function in docs/api-contract.md has a matching database function in supabase/migrations/,
//   2. every error code in the contract's table is known to packages/shared,
//   3. (only on a computer that has the private .env files) all the files point at the same
//      Supabase project and use the same public key.
//
// It prints names and yes/no answers only. It never prints a key or a URL.
// Run it with: npm run check:sync

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const failures = [];
const fail = (msg) => failures.push(msg);

function readAllFiles(dir, ends) {
  let text = '';
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name !== 'node_modules') text += readAllFiles(path, ends);
    } else if (ends.some((e) => name.endsWith(e))) {
      text += readFileSync(path, 'utf8') + '\n';
    }
  }
  return text;
}

// 1. Contract functions must exist in the migrations.
const contract = readFileSync(join(root, 'docs/api-contract.md'), 'utf8');
const contractFunctions = [...contract.matchAll(/^####\s+`([a-z_]+)\(/gm)].map((m) => m[1]);
const migrations = readAllFiles(join(root, 'supabase/migrations'), ['.sql']);
const dbFunctions = new Set(
  [...migrations.matchAll(/create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?([a-z_]+)/gi)].map(
    (m) => m[1].toLowerCase(),
  ),
);
for (const name of contractFunctions) {
  if (!dbFunctions.has(name)) fail(`contract function "${name}" has no matching migration`);
}
console.log(`contract functions checked: ${contractFunctions.length}`);

// 2. Contract error codes must be known to the shared package.
const errorCodes = [...contract.matchAll(/^\|\s*`([A-Z_]+)`\s*\|/gm)].map((m) => m[1]);
const sharedCode = readAllFiles(join(root, 'packages/shared/src'), ['.ts', '.tsx']);
for (const code of new Set(errorCodes)) {
  if (!sharedCode.includes(`"${code}"`) && !sharedCode.includes(`'${code}'`))
    fail(`error code "${code}" is not in packages/shared`);
}
console.log(`error codes checked: ${new Set(errorCodes).size}`);

// 3. Private files: same project everywhere. Skipped on computers without the files (for example GitHub).
function readEnv(path) {
  if (!existsSync(path)) return null;
  const out = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}
const mobile = readEnv(join(root, 'apps/mobile/.env'));
const web = readEnv(join(root, 'apps/web/.env.local'));
const secret = readEnv(join(root, '.env.secret'));
if (!mobile && !web && !secret) {
  console.log('private key files not on this computer: env check skipped');
} else {
  const pairs = [
    ['mobile URL', mobile?.EXPO_PUBLIC_SUPABASE_URL],
    ['web URL', web?.NEXT_PUBLIC_SUPABASE_URL],
    ['secret-file URL', secret?.SUPABASE_URL],
  ];
  for (const [label, value] of pairs) if (!value) fail(`${label} is empty`);
  const urls = pairs.map((p) => p[1]).filter(Boolean);
  const sameUrl = urls.length > 0 && urls.every((u) => u === urls[0]);
  console.log(`same Supabase project in every file: ${sameUrl ? 'yes' : 'no'}`);
  if (!sameUrl) fail('the private files point at different Supabase projects');

  const keys = [
    ['mobile key', mobile?.EXPO_PUBLIC_SUPABASE_ANON_KEY],
    ['web key', web?.NEXT_PUBLIC_SUPABASE_ANON_KEY],
    ['secret-file publishable key', secret?.SUPABASE_PUBLISHABLE_KEY],
  ];
  for (const [label, value] of keys) if (!value) fail(`${label} is empty`);
  const keyValues = keys.map((k) => k[1]).filter(Boolean);
  const sameKey = keyValues.length > 0 && keyValues.every((k) => k === keyValues[0]);
  console.log(`same publishable key in every file: ${sameKey ? 'yes' : 'no'}`);
  if (!sameKey) fail('the private files use different publishable keys');
}

if (failures.length > 0) {
  console.error('\nSYNC CHECK FAILED:');
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log('SYNC CHECK PASSED');

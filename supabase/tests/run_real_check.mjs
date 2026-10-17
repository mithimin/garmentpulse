// supabase/tests/run_real_check.mjs
//
// A friendly starter for the "real client" check (real_client.check.ts).
//
// What it does, in plain words:
//   1. Asks you for the project web address and the public anon key, if they
//      are not already set.
//   2. Asks you for the five test passwords, one at a time. You see a "*" for
//      every letter you type, Backspace works, and an empty answer is refused,
//      so you cannot get out of step.
//   3. Starts the real check with those values. They live only inside this
//      one run. Nothing is written to any file.
//
// HOW TO RUN (from the top folder of the project, in any terminal):
//
//     node supabase/tests/run_real_check.mjs
//
// Never type the service-role (secret) key here. Only the public anon key.
// Owned by Sakib. It is never run by `npm run check` or by CI.

import { spawn } from 'node:child_process';

const PASSWORDS = [
  ['GP_PW_NILA', 'Nila (nila@example.com)'],
  ['GP_PW_TARIQ', 'Tariq (tariq@example.com)'],
  ['GP_PW_HASAN', 'Hasan (hasan@example.com)'],
  ['GP_PW_FARHAN', 'Farhan (farhan@example.com)'],
  ['GP_PW_OWNER', 'Owner (owner@example.com)'],
];

/** Reads one line from the keyboard. With `hidden`, shows "*" instead of the letters. */
function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    const stdin = process.stdin;
    let text = '';

    const finish = () => {
      stdin.removeListener('data', onData);
      if (stdin.isTTY) stdin.setRawMode(false);
      stdin.pause();
      process.stdout.write('\n');
      resolve(text);
    };

    const onData = (chunk) => {
      // Ignore the invisible "paste start / paste end" markers some terminals add.
      // eslint-disable-next-line no-control-regex
      const input = chunk.toString('utf8').replace(/\u001b\[[0-9;]*[~A-Za-z]/g, '');
      for (const char of input) {
        if (char === '\r' || char === '\n') {
          finish();
          return;
        }
        if (char === '\u0003') {
          // Ctrl+C: stop everything.
          if (stdin.isTTY) stdin.setRawMode(false);
          process.stdout.write('\nStopped.\n');
          process.exit(130);
        }
        if (char === '\u007f' || char === '\b') {
          if (text.length > 0) {
            text = text.slice(0, -1);
            process.stdout.write('\b \b');
          }
          continue;
        }
        text += char;
        // Passwords show "*"; the public values (address, anon key) show as typed.
        process.stdout.write(hidden ? '*' : char);
      }
    };

    if (stdin.isTTY) stdin.setRawMode(true);
    stdin.resume();
    stdin.on('data', onData);
  });
}

/** Keeps asking until the answer is not empty. */
async function askRequired(question, options) {
  for (;;) {
    const answer = (await ask(question, options)).trim();
    if (answer) return answer;
    console.log('  That was empty. Please type it, then press Enter.');
  }
}

if (!process.stdin.isTTY) {
  console.error('This starter must be run in a real terminal window (it asks you questions).');
  process.exit(1);
}

const values = {};

values.GP_SUPABASE_URL =
  process.env.GP_SUPABASE_URL ||
  (await askRequired('Project web address (https://....supabase.co): '));
values.GP_SUPABASE_ANON_KEY =
  process.env.GP_SUPABASE_ANON_KEY || (await askRequired('Public anon key (starts with eyJ): '));

for (const [variable, label] of PASSWORDS) {
  values[variable] =
    process.env[variable] || (await askRequired(`${label} password: `, { hidden: true }));
}

console.log('\nStarting the real check...\n');

const child = spawn('npx vitest run --config supabase/tests/vitest.real.config.mts', {
  shell: true,
  stdio: 'inherit',
  env: { ...process.env, ...values },
});

child.on('exit', (code) => process.exit(code ?? 1));

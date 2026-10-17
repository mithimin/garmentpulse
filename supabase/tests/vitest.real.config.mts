// supabase/tests/vitest.real.config.mts
//
// Settings for the "real client" check (real_client.check.ts) ONLY.
//
// Why a separate file: the normal `npm run check` must never try to log in to
// the real Supabase project, because it has no passwords and CI must not
// touch the real database. The real check uses the file name ending
// `.check.ts`, which the normal test runner ignores. Run it on purpose with:
//
//     npx vitest run --config supabase/tests/vitest.real.config.mts
//
// See the top of real_client.check.ts for the full steps.

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['supabase/tests/**/*.check.ts'],
    // Logging in and waiting for live updates takes a few seconds.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Run the checks one after another, so their order is easy to follow.
    fileParallelism: false,
    sequence: { concurrent: false },
  },
});

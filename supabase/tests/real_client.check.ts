// supabase/tests/real_client.check.ts
//
// "Real client" check for the backend. Run by hand, on purpose.
//
// What it does, in plain words:
//   api_rules_check.sql pretends to be each person INSIDE the database. This
//   file does it the way the real apps do: it logs in with email and password
//   through the real login service, then calls the backend through
//   `createApi(...)` from packages/shared (the same helpers Rubaiya and Mithi
//   use). It proves that:
//     1. the real login works for all 5 test accounts,
//     2. the shared helpers work with the real Supabase library,
//     3. wrong roles are refused,
//     4. a new report reaches the manager's screen within 5 seconds
//        (FR-01, the "5-second rule"),
//     5. live updates respect the security rules: a technician who is not on
//        the report does NOT receive it.
//
// HOW TO RUN (on your own computer; nothing secret is ever saved in a file)
//   1. In your terminal, type the values. `read -s` hides what you type and
//      keeps passwords out of your command history:
//
//        export GP_SUPABASE_URL="https://<your-project-id>.supabase.co"
//        export GP_SUPABASE_ANON_KEY="<the public anon key>"
//        read -s "GP_PW_NILA?Nila password: "     && export GP_PW_NILA
//        read -s "GP_PW_TARIQ?Tariq password: "   && export GP_PW_TARIQ
//        read -s "GP_PW_HASAN?Hasan password: "   && export GP_PW_HASAN
//        read -s "GP_PW_FARHAN?Farhan password: " && export GP_PW_FARHAN
//        read -s "GP_PW_OWNER?Owner password: "   && export GP_PW_OWNER
//
//   2. From the top folder of the project:
//
//        npx vitest run --config supabase/tests/vitest.real.config.mts
//
//   If a value is missing, the whole check is skipped with a clear message.
//   Never put the service-role (secret) key anywhere near this file.
//
// WHAT IT LEAVES BEHIND
//   Each run creates ONE real report (description starts with
//   "Real client check") and does not remove it. It stays waiting in the
//   queue. Delete the leftovers with this line in the Supabase SQL Editor:
//
//        delete from public.reports where description like 'Real client check%';
//
// Owned by Sakib. It is never run by `npm run check` or by CI.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ApiError, createApi, type Api, type Role } from '@garmentpulse/shared';

const URL = process.env.GP_SUPABASE_URL;
const ANON_KEY = process.env.GP_SUPABASE_ANON_KEY;

/** The five test accounts: email, the password variable to read, and the role we expect. */
const PEOPLE = {
  nila: { email: 'nila@example.com', passwordVar: 'GP_PW_NILA', role: 'worker' },
  tariq: { email: 'tariq@example.com', passwordVar: 'GP_PW_TARIQ', role: 'technician' },
  hasan: { email: 'hasan@example.com', passwordVar: 'GP_PW_HASAN', role: 'technician' },
  farhan: { email: 'farhan@example.com', passwordVar: 'GP_PW_FARHAN', role: 'manager' },
  owner: { email: 'owner@example.com', passwordVar: 'GP_PW_OWNER', role: 'owner' },
} as const satisfies Record<string, { email: string; passwordVar: string; role: Role }>;

type PersonName = keyof typeof PEOPLE;

const missing = [
  ['GP_SUPABASE_URL', URL],
  ['GP_SUPABASE_ANON_KEY', ANON_KEY],
  ...Object.values(PEOPLE).map((p) => [p.passwordVar, process.env[p.passwordVar]] as const),
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length > 0) {
  console.warn(
    `\nReal client check SKIPPED. These values are not set: ${missing.join(', ')}.\n` +
      'See the steps at the top of supabase/tests/real_client.check.ts.\n',
  );
}

/** The failure code of a call that must fail (for example NOT_ALLOWED). */
async function codeOf(call: Promise<unknown>): Promise<string> {
  try {
    await call;
  } catch (error) {
    if (error instanceof ApiError) return error.code;
    throw error;
  }
  return 'NO_ERROR';
}

describe.skipIf(missing.length > 0)('real client check', () => {
  const clients = {} as Record<PersonName, SupabaseClient>;
  const apis = {} as Record<PersonName, Api>;
  const description = `Real client check ${new Date().toISOString()}`;
  let newReportId = '';

  /** A client that behaves like an app: no saved session, no background refresh. */
  function newClient(): SupabaseClient {
    return createClient(URL!, ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  beforeAll(async () => {
    for (const name of Object.keys(PEOPLE) as PersonName[]) {
      const person = PEOPLE[name];
      const client = newClient();
      const { error } = await client.auth.signInWithPassword({
        email: person.email,
        password: process.env[person.passwordVar]!,
      });
      if (error) {
        // "Invalid API key" means the public anon key is wrong, not the password.
        const hint = /api key/i.test(error.message)
          ? 'The public anon key looks wrong: check GP_SUPABASE_ANON_KEY (the full long key, no spaces, not the secret key).'
          : `Check ${person.passwordVar}, or reset that password in the dashboard.`;
        throw new Error(`Could not log in as ${person.email} (${error.message}). ${hint}`);
      }
      clients[name] = client;
      apis[name] = createApi(client);
    }
  });

  afterAll(async () => {
    await Promise.all(Object.values(clients).map((client) => client.removeAllChannels()));
    await Promise.all(Object.values(clients).map((client) => client.auth.signOut()));
    if (newReportId) {
      console.log(
        `\nThis run left one waiting report (id ${newReportId}). Delete leftovers in the SQL Editor:\n` +
          `  delete from public.reports where description like 'Real client check%';\n`,
      );
    }
  });

  describe('login and roles', () => {
    for (const name of Object.keys(PEOPLE) as PersonName[]) {
      it(`${PEOPLE[name].email} logs in and gets role ${PEOPLE[name].role}`, async () => {
        const profile = await apis[name].getMyProfile();
        expect(profile.email).toBe(PEOPLE[name].email);
        expect(profile.role).toBe(PEOPLE[name].role);
      });
    }

    it('somebody who is not logged in is refused', async () => {
      const code = await codeOf(createApi(newClient()).listReports());
      expect(code).not.toBe('NO_ERROR');
    });
  });

  describe('wrong roles are refused', () => {
    it('a worker cannot list all reports', async () => {
      expect(await codeOf(apis.nila.listReports())).toBe('NOT_ALLOWED');
    });

    it('a worker cannot assign a technician', async () => {
      expect(await codeOf(apis.nila.assignTechnician('x', 'y'))).toBe('NOT_ALLOWED');
    });

    it('a technician cannot create a report', async () => {
      const machines = await apis.nila.listMachines();
      expect(await codeOf(apis.tariq.createReport(machines[0].id, 'not allowed'))).toBe(
        'NOT_ALLOWED',
      );
    });

    it('the owner cannot assign (read-only)', async () => {
      expect(await codeOf(apis.owner.assignTechnician('x', 'y'))).toBe('NOT_ALLOWED');
    });
  });

  describe('reading', () => {
    it('a worker sees the machine list', async () => {
      const machines = await apis.nila.listMachines();
      expect(machines.map((m) => m.name)).toContain('Sewing machine 01');
    });

    it('the manager sees the technicians with free or busy', async () => {
      const technicians = await apis.farhan.listTechnicians();
      const names = technicians.map((t) => t.display_name);
      expect(names).toContain('Tariq Hasan');
      expect(names).toContain('Hasan Ali');
      for (const t of technicians) expect(['free', 'busy']).toContain(t.availability);
    });

    it('the owner sees the three count boxes', async () => {
      const summary = await apis.owner.getOwnerSummary();
      expect(Object.keys(summary).sort()).toEqual(['in_progress', 'resolved', 'waiting']);
    });
  });

  describe('live updates and the 5-second rule', () => {
    it('a new report reaches the manager within 5 seconds, and not an unrelated technician', async () => {
      const machines = await apis.nila.listMachines();
      const machineId = machines.find((m) => m.name === 'Sewing machine 01')!.id;

      let managerHeardAt = 0;
      let technicianHeard = false;
      let workerHeard = false;

      /**
       * Listen for new rows on `reports` and return once the channel is ready.
       * It prints what it sees (the channel status and any change it receives)
       * so that, if no change arrives, the printout shows where it got stuck.
       */
      const listen = async (label: string, client: SupabaseClient, onRow: () => void) => {
        // Make sure the live-update connection carries this person's login.
        const { data } = await client.auth.getSession();
        await client.realtime.setAuth(data.session!.access_token);

        await new Promise<void>((resolve, reject) => {
          client
            .channel(`check-${label}-${Math.random().toString(36).slice(2)}`)
            .on(
              'postgres_changes',
              { event: 'INSERT', schema: 'public', table: 'reports' },
              (payload) => {
                const row = payload.new as { description?: string };
                console.log(`  [${label}] received a new report: "${row.description}"`);
                if (row.description === description) onRow();
              },
            )
            .subscribe((status, error) => {
              console.log(`  [${label}] live-update channel status: ${status}`);
              if (status === 'SUBSCRIBED') resolve();
              if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                reject(new Error(`Live updates failed: ${status} ${error?.message ?? ''}`));
              }
            });
        });
      };

      await listen('manager', clients.farhan, () => {
        managerHeardAt = Date.now();
      });
      await listen('technician', clients.tariq, () => {
        technicianHeard = true;
      });
      // A control: the worker who creates the report may always see her own report.
      await listen('worker', clients.nila, () => {
        workerHeard = true;
      });

      const sentAt = Date.now();
      const report = await apis.nila.createReport(machineId, description);
      newReportId = report.id;

      expect(report.status).toBe('waiting');
      expect(report.technician).toBeNull();

      // Wait up to 5 seconds for the manager to hear about it.
      while (managerHeardAt === 0 && Date.now() - sentAt < 5000) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      const seconds = managerHeardAt === 0 ? Infinity : (managerHeardAt - sentAt) / 1000;
      console.log(`Manager heard about the new report after ${seconds} seconds.`);
      console.log(`The worker's own control listener heard it: ${workerHeard}`);
      expect(seconds).toBeLessThan(5);

      // Give a wrong listener a moment: Tariq has nothing to do with this report.
      await new Promise((resolve) => setTimeout(resolve, 2000));
      expect(technicianHeard).toBe(false);
    });

    it('the manager can read the new report, and so can the worker who made it', async () => {
      const managerList = await apis.farhan.listReports('waiting');
      expect(managerList.map((r) => r.id)).toContain(newReportId);

      const mine = await apis.nila.getReport(newReportId);
      expect(mine.description).toBe(description);
    });

    it('an unrelated technician cannot open that report', async () => {
      expect(await codeOf(apis.tariq.getReport(newReportId))).toBe('NOT_FOUND');
    });
  });
});

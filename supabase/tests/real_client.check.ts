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
//        the report does NOT receive it,
//     6. SIGN-UP WITH INVITE CODES works through the real login service: the
//        owner and a manager make codes, pretend new people sign up with
//        them with `signUpWithCode`, and every cheat is refused (a used code,
//        the wrong app, a made-up code, the same email twice, no code at all,
//        and a role typed into the sign-up form).
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
//   The sign-up part also leaves pretend accounts (realcheck-...@example.com)
//   and invite codes. At the end of the run it prints the exact lines to
//   delete them. Sign-up must be switched ON in the Supabase dashboard
//   (Authentication, Email, with email confirmation OFF) for this part.
//
// Owned by Sakib. It is never run by `npm run check` or by CI.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ApiError, createApi, signUpWithCode, type Api, type Role } from '@garmentpulse/shared';

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

    it('people and machines carry the optional Bangla name fields (empty means null)', async () => {
      const machines = await apis.nila.listMachines();
      expect(machines.length).toBeGreaterThan(0);
      for (const machine of machines) {
        expect(machine).toHaveProperty('name_bn');
      }
      const profile = await apis.nila.getMyProfile();
      expect(profile).toHaveProperty('display_name_bn');
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

      // "SUBSCRIBED" can arrive a moment before Supabase really starts sending
      // changes, so let the three listeners settle before the report is made.
      await new Promise((resolve) => setTimeout(resolve, 2000));

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

  // ---------------------------------------------------------------------------
  // Sign-up with invite codes, through the REAL login service
  // ---------------------------------------------------------------------------
  // The owner and a manager make codes; pretend new people (realcheck-...@example.com)
  // sign up with them; and every cheat is tried. Each run leaves a few pretend
  // accounts and codes behind; the cleanup lines are printed at the end.
  describe('sign-up with invite codes', () => {
    const stamp = Date.now().toString(36);
    const emailOf = (name: string) => `realcheck-${name}-${stamp}@example.com`;
    // A throw-away password for the pretend people (they are deleted afterwards).
    const password = `Rc-${crypto.randomUUID()}`;
    const madeCodes: string[] = [];
    const codes = {} as Record<'worker' | 'worker2' | 'technician' | 'manager', string>;
    let workerClient: SupabaseClient;

    const CODE_SHAPE = /^[A-HJ-NP-Z2-9]{10}$/;

    /** True when a login with the pretend password fails (= no such account). */
    async function loginFails(email: string): Promise<boolean> {
      const { error } = await newClient().auth.signInWithPassword({ email, password });
      return error !== null;
    }

    afterAll(() => {
      console.log(
        `\nThis run left pretend sign-ups behind. Delete them in the Supabase SQL Editor:\n` +
          `  delete from auth.users where email like 'realcheck-%-${stamp}@example.com';\n` +
          (madeCodes.length > 0
            ? `  delete from public.invite_codes where code in (${madeCodes.map((c) => `'${c}'`).join(', ')});\n`
            : ''),
      );
    });

    it('the manager makes worker and technician codes, and the owner makes a manager code', async () => {
      const worker = await apis.farhan.createInviteCode('worker');
      const worker2 = await apis.farhan.createInviteCode('worker');
      const technician = await apis.farhan.createInviteCode('technician');
      const manager = await apis.owner.createInviteCode('manager');

      codes.worker = worker.code;
      codes.worker2 = worker2.code;
      codes.technician = technician.code;
      codes.manager = manager.code;
      madeCodes.push(worker.code, worker2.code, technician.code, manager.code);

      for (const made of [worker, worker2, technician, manager]) {
        expect(made.code).toMatch(CODE_SHAPE);
      }
      expect([worker.role, worker2.role, technician.role, manager.role]).toEqual([
        'worker',
        'worker',
        'technician',
        'manager',
      ]);
    });

    it('a visitor who is not logged in can check a code, even in small letters', async () => {
      const visitor = createApi(newClient());
      expect((await visitor.checkInviteCode(codes.worker)).role).toBe('worker');
      expect((await visitor.checkInviteCode(` ${codes.worker.toLowerCase()} `)).role).toBe(
        'worker',
      );
    });

    it('a new worker signs up on the phone with a worker code, and is logged in right away', async () => {
      workerClient = newClient();
      const profile = await signUpWithCode(workerClient, {
        platform: 'mobile',
        fullName: 'Real Check Worker',
        email: emailOf('worker'),
        password,
        code: codes.worker.toLowerCase(),
      });

      expect(profile.role).toBe('worker');
      expect(profile.display_name).toBe('Real Check Worker');
      expect(profile.email).toBe(emailOf('worker'));
      expect(await createApi(workerClient).listMyReports()).toEqual([]);
    });

    it("the new worker still cannot do a manager's job or make codes", async () => {
      const api = createApi(workerClient);
      expect(await codeOf(api.listReports())).toBe('NOT_ALLOWED');
      expect(await codeOf(api.createInviteCode('worker'))).toBe('NOT_ALLOWED');
    });

    it('a used code cannot be used again, and no account is created', async () => {
      const failure = await codeOf(
        signUpWithCode(newClient(), {
          platform: 'mobile',
          fullName: 'Second Person',
          email: emailOf('second'),
          password,
          code: codes.worker,
        }),
      );
      expect(failure).toBe('INVALID_CODE');
      expect(await loginFails(emailOf('second'))).toBe(true);
    });

    it('a manager code on the phone app is refused (WRONG_PLATFORM) and nothing is created', async () => {
      const failure = await codeOf(
        signUpWithCode(newClient(), {
          platform: 'mobile',
          fullName: 'Wrong App',
          email: emailOf('wrongapp'),
          password,
          code: codes.manager,
        }),
      );
      expect(failure).toBe('WRONG_PLATFORM');
      expect(await loginFails(emailOf('wrongapp'))).toBe(true);
    });

    it('a worker code on the website is refused (WRONG_PLATFORM), and the code stays unused', async () => {
      const failure = await codeOf(
        signUpWithCode(newClient(), {
          platform: 'web',
          fullName: 'Wrong App',
          email: emailOf('wrongweb'),
          password,
          code: codes.worker2,
        }),
      );
      expect(failure).toBe('WRONG_PLATFORM');
      expect((await createApi(newClient()).checkInviteCode(codes.worker2)).role).toBe('worker');
    });

    it('a made-up code is refused', async () => {
      const failure = await codeOf(
        signUpWithCode(newClient(), {
          platform: 'mobile',
          fullName: 'Made Up',
          email: emailOf('madeup'),
          password,
          code: 'ABCDEFGHJK',
        }),
      );
      expect(failure).toBe('INVALID_CODE');
      expect(await loginFails(emailOf('madeup'))).toBe(true);
    });

    it('the same email cannot sign up twice (EMAIL_TAKEN), and the code stays unused', async () => {
      const failure = await codeOf(
        signUpWithCode(newClient(), {
          platform: 'mobile',
          fullName: 'Same Email',
          email: emailOf('worker'),
          password,
          code: codes.worker2,
        }),
      );
      expect(failure).toBe('EMAIL_TAKEN');
      expect((await createApi(newClient()).checkInviteCode(codes.worker2)).role).toBe('worker');
    });

    it('signing up straight with Supabase and no code is refused, whatever role is typed', async () => {
      const { error } = await newClient().auth.signUp({
        email: emailOf('nocode'),
        password,
        options: { data: { display_name: 'No Code', role: 'manager' } },
      });
      expect(error).not.toBeNull();
      expect(await loginFails(emailOf('nocode'))).toBe(true);
    });

    it('a role typed into the sign-up is ignored: the code decides', async () => {
      const sneaky = newClient();
      const { data, error } = await sneaky.auth.signUp({
        email: emailOf('tech'),
        password,
        options: {
          data: { invite_code: codes.technician, display_name: 'Real Check Tech', role: 'owner' },
        },
      });
      expect(error).toBeNull();
      expect(data.session).not.toBeNull();

      const profile = await createApi(sneaky).getMyProfile();
      expect(profile.role).toBe('technician');
      expect(profile.display_name).toBe('Real Check Tech');
    });

    it("the manager's list no longer shows the used codes, only the unused one", async () => {
      const listed = (await apis.farhan.listInviteCodes()).map((c) => c.code);
      expect(listed).not.toContain(codes.worker);
      expect(listed).not.toContain(codes.technician);
      expect(listed).toContain(codes.worker2);
    });

    it('a new person can give an optional Bangla name at sign-up, and it is saved', async () => {
      const bnClient = newClient();
      const profile = await signUpWithCode(bnClient, {
        platform: 'mobile',
        fullName: 'Real Check Bangla',
        fullNameBn: 'রিয়েল চেক',
        email: emailOf('bn'),
        password,
        code: codes.worker2,
      });
      expect(profile.display_name).toBe('Real Check Bangla');
      expect(profile.display_name_bn).toBe('রিয়েল চেক');
    });
  });
});

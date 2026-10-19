// apps/mobile/src/language/localNames.ts
//
// Shows a person's name or a machine's name in the language the app is in.
//
// The backend will give every person and machine an OPTIONAL Bangla name next to
// the English one (agreed in requests/rubaiya/2026-10-19-bangla-names-heads-up.md):
//   person:  display_name    + display_name_bn
//   machine: name            + name_bn
//
// These helpers use the Bangla name when the app is in Bangla AND the backend sent
// one. Otherwise they fall back to the English name, so nothing breaks while the
// Bangla names do not exist yet. The words a worker types into a report are never
// changed here.
// Same idea as apps/web/language/localNames.ts.
// Owned by Rubaiya.

import type { Language } from '@garmentpulse/shared';

/** A person as the backend sends them. The Bangla name is optional (or null). */
type Person = { display_name: string; display_name_bn?: string | null };

/** A machine as the backend sends it. The Bangla name is optional (or null). */
type Machine = { name: string; name_bn?: string | null };

/** Uses the Bangla text in Bangla mode when there is some, otherwise the English text. */
function pick(english: string, bangla: string | null | undefined, language: Language): string {
  const text = bangla?.trim();
  return language === 'bn' && text ? text : english;
}

/** A person's name in the current language. */
export function personName(person: Person, language: Language): string {
  return pick(person.display_name, person.display_name_bn, language);
}

/** A machine's name in the current language. */
export function machineName(machine: Machine, language: Language): string {
  return pick(machine.name, machine.name_bn, language);
}

// apps/web/language/localNames.ts
//
// Shows a person's name or a machine's name in the language the website is in.
//
// The backend will (after the first full test) give every person and machine an OPTIONAL
// Bangla name next to the English one:
//   person:  display_name    + display_name_bn
//   machine: name            + name_bn
// (agreed in requests/mithi/2026-10-19-bangla-names-accepted.md).
//
// These helpers use the Bangla name when the site is in Bangla AND the backend sent one.
// Otherwise they fall back to the English name, so nothing breaks while the Bangla names do not
// exist yet (today the backend sends none, so the site looks exactly the same as before).
// The words workers type into a report are never changed here.
// Owned by Mithi.

import type { Language } from '@garmentpulse/shared';

/** A person as the backend sends them. The Bangla name is optional (and null when not written yet). */
type Person = { display_name: string; display_name_bn?: string | null };

/** A machine as the backend sends it. The Bangla name is optional (and null when not written yet). */
type Machine = { name: string; name_bn?: string | null };

/** Uses the Bangla text in Bangla mode when there is some, otherwise the English text. */
function pick(english: string, bangla: string | null | undefined, language: Language): string {
  const text = bangla?.trim();
  return language === 'bn' && text ? text : english;
}

/** A person's name in the current language, for example "Farhan Kabir" or the Bangla spelling. */
export function personName(person: Person, language: Language): string {
  return pick(person.display_name, person.display_name_bn, language);
}

/** Only the first word of a person's name (for the greeting), in the current language. */
export function personFirstName(person: Person, language: Language): string {
  return personName(person, language).split(/\s+/)[0] ?? '';
}

/** A machine's name in the current language, for example "Sewing machine 02". */
export function machineName(machine: Machine, language: Language): string {
  return pick(machine.name, machine.name_bn, language);
}

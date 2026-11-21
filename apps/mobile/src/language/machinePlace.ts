// apps/mobile/src/language/machinePlace.ts
//
// Writes WHERE a machine stands, so a person can walk to it: "Floor 2 · Row B · B3"
// (floor, row letter, seat). A part the backend does not know is left out, and the
// digits are Bangla digits in Bangla mode. Used by the worker's machine picture and
// by the technician's job screens.
// Owned by Rubaiya.

import type { Language } from '@garmentpulse/shared';
import { localizeDigits } from './format';
import { MAP_TEXT } from './screenText';

export function machinePlace(
  machine: { floor?: number | null; seat?: string | null },
  language: Language,
): string {
  const parts: string[] = [];
  if (machine.floor != null) {
    parts.push(`${MAP_TEXT.floor[language]} ${localizeDigits(String(machine.floor), language)}`);
  }
  if (machine.seat) {
    parts.push(`${MAP_TEXT.row[language]} ${machine.seat.charAt(0)}`);
    parts.push(localizeDigits(machine.seat, language));
  }
  return parts.join(' · ');
}

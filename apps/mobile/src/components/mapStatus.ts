// apps/mobile/src/components/mapStatus.ts
//
// The word for each look of a machine on the map, in the chosen language.
// "OK" and "Down" are map-only words (screenText.ts). "Waiting" and "In progress"
// come from the shared word list, so the phone and the website agree.
// Owned by Rubaiya.

import { STATUS_LABELS } from '@garmentpulse/shared';
import type { Language } from '@garmentpulse/shared';
import type { MapStatus } from '../data/fakeMachineMap';
import { MAP_TEXT } from '../language/screenText';

export function mapStatusWord(status: MapStatus, language: Language): string {
  switch (status) {
    case 'ok':
      return MAP_TEXT.ok[language];
    case 'down':
      return MAP_TEXT.down[language];
    case 'waiting':
      return STATUS_LABELS.waiting[language];
    case 'in_progress':
      return STATUS_LABELS.in_progress[language];
  }
}

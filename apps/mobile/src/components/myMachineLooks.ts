// apps/mobile/src/components/myMachineLooks.ts
//
// The five looks of the worker's own machine picture on the Home screen. Each look
// has its own paint colours, a glow colour, the colours of the little status label
// under the picture, and the word for it (the word always goes with the colour).
//
//   ok       = cream            "OK" (the normal look, also right after a repair)
//   down     = red + a pulsing glow (and a beep) "Down"
//   assigned = yellow           "Technician assigned"
//   fixing   = yellow           "Being fixed" (the technician is working on it)
// There is no blue: when the technician finishes, the machine goes back to cream.
//
// The pictures are SVG text made once here, from the drawing in `logoArtSvg.ts`.
// Owned by Rubaiya.

import type { Language } from '@garmentpulse/shared';
import { MAP_TEXT, MY_MACHINE_TEXT, TRACK_TEXT } from '../language/screenText';
import { MAP_COLORS } from '../theme';
import { machineArtSvg } from './logoArtSvg';
import type { BodyPalette } from './logoArtSvg';

export type MyMachineLook = 'ok' | 'down' | 'assigned' | 'fixing';

const CREAM: BodyPalette = {
  body: ['#FBF3E1', '#E6D6B6', '#B49E7A'],
  side: ['#EFE2C6', '#E6D6B6', '#B49E7A'],
  dark: ['#8A7458', '#5E4D3A'],
  wheel: ['#E9DCC0', '#B8A27E', '#7A6650'],
};
const RED: BodyPalette = {
  body: ['#F08A7C', '#CC3B2D', '#6E1A14'],
  side: ['#E5695A', '#CC3B2D', '#7A1F18'],
  dark: ['#7A1F18', '#42100C'],
  wheel: ['#E5695A', '#9A2A20', '#4A120D'],
};
const YELLOW: BodyPalette = {
  body: ['#FFE99A', '#F0C53F', '#A47E14'],
  side: ['#FFE07A', '#F0C53F', '#B08A1A'],
  dark: ['#8A6A12', '#4F3C08'],
  wheel: ['#FFE07A', '#C79A22', '#7A5C0C'],
};
type Look = {
  art: string;
  /** The soft glow behind the picture. */
  glow: string;
  chipBackground: string;
  chipBorder: string;
  chipText: string;
  word: (language: Language) => string;
};

export const MY_MACHINE_LOOKS: Record<MyMachineLook, Look> = {
  ok: {
    art: machineArtSvg(CREAM),
    glow: '#E3D5BC',
    chipBackground: MAP_COLORS.ok.background,
    chipBorder: MAP_COLORS.ok.border,
    chipText: MAP_COLORS.ok.text,
    word: (language) => MAP_TEXT.ok[language],
  },
  down: {
    art: machineArtSvg(RED),
    glow: '#E0483A',
    chipBackground: '#C23B2E',
    chipBorder: '#8F2A20',
    chipText: '#FFFFFF',
    word: (language) => MAP_TEXT.down[language],
  },
  assigned: {
    art: machineArtSvg(YELLOW),
    glow: '#F5D45E',
    chipBackground: MAP_COLORS.waiting.background,
    chipBorder: MAP_COLORS.waiting.border,
    chipText: MAP_COLORS.waiting.text,
    word: (language) => TRACK_TEXT.assigned[language],
  },
  // the technician is working on it: still yellow, with its own word
  fixing: {
    art: machineArtSvg(YELLOW),
    glow: '#F5D45E',
    chipBackground: MAP_COLORS.waiting.background,
    chipBorder: MAP_COLORS.waiting.border,
    chipText: MAP_COLORS.waiting.text,
    word: (language) => MY_MACHINE_TEXT.fixing[language],
  },
};

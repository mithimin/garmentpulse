// apps/mobile/src/theme.ts
//
// The colours and sizes used by the phone app. Keeping them in one place means
// every screen looks the same, and a colour only has to be fixed once.
// DECISION (Rubaiya, 2026-11-14): the phone app copies the website's look with the
// colours of her "trend colours" picture: Cannoli Cream (page), Cacao Nibs and
// Chocopie (browns) and Powder Blue (accent). The numbers were measured from
// that picture.
// Workers AND technicians use the same look.
// Owned by Rubaiya.

/** The colours used on every phone screen. */
export const COLORS = {
  /** The page behind everything: warm cream. */
  page: '#FAF5E4',
  /** Top bar and bottom bar: deep chocolate brown. */
  bar: '#5B3C2E',
  barText: '#F1E4D6',
  barStitch: '#D9B98A',
  /** Cards: a lighter cream that sits on the page. */
  card: '#FFFBEF',
  cardBorder: '#EADFC9',
  cardStitch: '#CDB89E',
  text: '#432F2E',
  softText: '#7A6258',
  mainButton: '#5B3C2E',
  mainButtonBorder: '#432C20',
  mainButtonText: '#FFFFFF',
  /** Bar text of the chosen tab, and the soft pill behind it. */
  barTextChosen: '#FFFFFF',
  tabPill: 'rgba(255,255,255,0.16)',
  /** Cards in lists (kept the same name as before so old screens still work). */
  listCard: '#FFFBEF',
  /** The sky blue of the website: big soft shapes, tags, the chosen box. */
  blue: '#96B3D0',
  blueSoft: '#DCE6F0',
  blueTag: '#7F9FC2',
  blueText: '#2F4F73',
  /** Dark chocolate "feature" card, like the New reports box on the website. */
  darkCard: '#5B3C2E',
} as const;

/** Colours of the three report statuses. Each one also has a word next to it. */
export const STATUS_COLORS = {
  waiting: { background: '#F6E3B4', text: '#6E4E0E' },
  in_progress: { background: '#D5E2EF', text: '#2F4F73' },
  resolved: { background: '#DDE8C8', text: '#3F5A1E' },
} as const;

/**
 * Colours of a machine on the machine map. Every state also has a word and an icon
 * look, never only a colour.
 *   ok          = cream
 *   down        = dark brown with a glowing halo (just reported, no technician yet)
 *   waiting     = butter yellow (a technician is assigned but has not started)
 *   in_progress = sky blue (a technician is fixing it)
 */
export const MAP_COLORS = {
  ok: { background: '#FFFBEF', border: '#E3D5BC', icon: '#7A6258', text: '#6B5547' },
  down: { background: '#5B3C2E', border: '#3E2619', icon: '#F6E9D8', text: '#F6E9D8' },
  waiting: { background: '#FCEEB8', border: '#E3CB82', icon: '#6E4E0E', text: '#6E4E0E' },
  in_progress: { background: '#A5CCF2', border: '#7FB0DE', icon: '#1F4E85', text: '#1F4E85' },
  /** The glow around a machine that is down. */
  glow: '#8A5E49',
} as const;

/** Colours shared by every role. */
export const SHARED_COLORS = {
  inputBackground: '#FFFCF3',
  inputBorder: '#DDCFB8',
  inputHint: '#9A857A',
  errorBackground: '#F6D9D0',
  errorText: '#8A2A1A',
  errorBorder: '#DDB2A6',
  white: '#FFFFFF',
} as const;

/** Sizes on phones. Corners are big and round, like the website's cards. */
export const SIZES = {
  /** Space between the screen edge and the content. */
  screenPadding: 16,
  /** Inside a card. */
  cardPadding: 18,
  cardRadius: 24,
  buttonHeight: 48,
  buttonRadius: 24,
  inputHeight: 48,
  inputRadius: 16,
  /** Nothing tappable may be smaller than this. */
  minTap: 44,
} as const;

/**
 * The pictures cut out of the website's picture (see assets/theme/).
 * Expo needs `require` for pictures, so the lint rule against it is switched off here.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
export const PICTURES = {
  factory: require('../assets/theme/factory-banner.jpg'),
  scissors: require('../assets/theme/card-scissors.jpg'),
  press: require('../assets/theme/card-press.jpg'),
  tape: require('../assets/theme/card-tape.jpg'),
  mannequin: require('../assets/theme/mannequin.jpg'),
  spool: require('../assets/theme/spool.png'),
  loginTop: require('../assets/theme/login-top.jpg'),
  loginBottom: require('../assets/theme/login-bottom.jpg'),
} as const;
/** Sounds (a short alert beep for a machine that just went down). */
export const SOUNDS = {
  machineDown: require('../assets/sounds/machine-down.wav'),
} as const;
/* eslint-enable @typescript-eslint/no-require-imports */

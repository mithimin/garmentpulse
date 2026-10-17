// apps/mobile/src/theme.ts
//
// The colours and sizes used by the phone app, copied from docs/design-system.md.
// Keeping them in one place means every screen looks the same, and a colour only
// has to be fixed once.
// DECISION (Rubaiya): the whole phone app, for workers AND technicians, uses the
// denim "manager blue" of the login screen. The worker purple and technician
// green from the design system are NOT used.
// Owned by Rubaiya.

/** The blue colours used on every phone screen (design system section 3.2). */
export const COLORS = {
  page: '#DDE3EA',
  bar: '#1F2B47',
  barText: '#D3D9E8',
  barStitch: '#D6AC68',
  card: '#F7F9FB',
  cardBorder: '#C9D2DE',
  cardStitch: '#98A6BA',
  text: '#1E2430',
  softText: '#55606F',
  mainButton: '#2E4670',
  mainButtonBorder: '#1C2D4C',
  mainButtonText: '#FFFFFF',
  /** Bar text of the chosen tab, and the soft pill behind it. */
  barTextChosen: '#FFFFFF',
  tabPill: 'rgba(255,255,255,0.16)',
  /** The darker blue card used for lists (design system 3.2, "second card"). */
  listCard: '#B4C1CF',
} as const;

/** Colours of the three report statuses (design system section 4.1). */
export const STATUS_COLORS = {
  waiting: { background: '#F3E2B8', text: '#6E4E0E' },
  in_progress: { background: '#DCE2EE', text: '#263B66' },
  resolved: { background: '#E1E5CC', text: '#4A5320' },
} as const;

/** Colours shared by every role (design system section 3.6). */
export const SHARED_COLORS = {
  inputBackground: '#FCFDFE',
  inputBorder: '#AEB9C8',
  inputHint: '#7A8495',
  errorBackground: '#F2D6CF',
  errorText: '#8A2A1A',
  errorBorder: '#D9AFA4',
  white: '#FFFFFF',
} as const;

/** Sizes on phones (design system sections 7 and 9). */
export const SIZES = {
  /** Space between the screen edge and the content. */
  screenPadding: 16,
  /** Inside a card. */
  cardPadding: 18,
  cardRadius: 14,
  buttonHeight: 48,
  buttonRadius: 12,
  inputHeight: 46,
  inputRadius: 10,
  /** Nothing tappable may be smaller than this. */
  minTap: 44,
} as const;

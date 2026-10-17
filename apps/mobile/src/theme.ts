// apps/mobile/src/theme.ts
//
// The colours and sizes used by the phone app, copied from docs/design-system.md.
// Keeping them in one place means every screen looks the same, and a colour only
// has to be fixed once. For now it holds the login screen colours (the "manager
// blue", section 10.1 of the design system) and the shared error colours.
// More roles (worker purple, technician green) are added when their screens come.
// Owned by Rubaiya.

/** Colours of the login screen (manager blue, design system section 3.2). */
export const LOGIN_COLORS = {
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
  logoTile: '#DCC593',
  logoLetter: '#3A2E14',
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

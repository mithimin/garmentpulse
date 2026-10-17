// apps/web/app/layout.tsx
//
// The outer frame shared by every page of GarmentPulse Web.
// Every page is placed inside this layout. It loads the three fonts of the
// design system (titles, normal text, codes), the colours and sizes in
// globals.css, and the language memory (English or Bangla).
// Owned by Mithi.

import type { ReactNode } from 'react';
import { Cormorant_Garamond, IBM_Plex_Mono, Jost } from 'next/font/google';
import { LanguageProvider } from '../language/LanguageContext';
import './globals.css';

// Fonts cannot draw Bangla letters; the device's own Bangla font fills in
// automatically (see the font lists in globals.css).
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-cormorant',
});
const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jost',
});
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-plex-mono',
});

export const metadata = {
  title: 'GarmentPulse',
  description: 'Machine breakdown reporting and repair dispatch for garment factories.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable} ${plexMono.variable}`}>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

// apps/web/app/layout.tsx
//
// The outer frame shared by every page of GarmentPulse Web.
// Every page is placed inside this layout. It loads the three fonts of the
// design system (titles, normal text, codes), the colours and sizes in
// globals.css, and the language memory (English or Bangla).
// Owned by Mithi.

import type { ReactNode } from 'react';
import { Baloo_Da_2, Cormorant_Garamond, IBM_Plex_Mono, Jost, Marcellus } from 'next/font/google';
import { AuthProvider } from '../auth/AuthContext';
import { LanguageProvider } from '../language/LanguageContext';
import './globals.css';

// The English fonts cannot draw Bangla letters, so Bangla uses Baloo Da 2,
// a rounded, friendly Bangla font that has several weights (see the font lists in globals.css).
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
// Marcellus (one weight) is used only for the greeting at the top of the dashboards.
const marcellus = Marcellus({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-marcellus',
});
const balooBangla = Baloo_Da_2({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-baloo-bangla',
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
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} ${marcellus.variable} ${balooBangla.variable} ${plexMono.variable}`}
    >
      <body>
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

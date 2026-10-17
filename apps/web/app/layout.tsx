// apps/web/app/layout.tsx
//
// The outer frame shared by every page of GarmentPulse Web.
// Every page is placed inside this layout. It loads the three fonts of the
// design system (titles, normal text, codes), the colours and sizes in
// globals.css, and the language memory (English or Bangla).
// Owned by Mithi.

import type { ReactNode } from 'react';
import { Cormorant_Garamond, IBM_Plex_Mono, IBM_Plex_Sans, Tiro_Bangla } from 'next/font/google';
import { AuthProvider } from '../auth/AuthContext';
import { LanguageProvider } from '../language/LanguageContext';
import './globals.css';

// The English fonts cannot draw Bangla letters, so Bangla uses Tiro Bangla,
// a classy Bangla serif font (it has one weight; bold is made by the browser) (see the font lists in globals.css).
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-cormorant',
});
const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-sans',
});
const tiroBangla = Tiro_Bangla({
  subsets: ['bengali'],
  weight: '400',
  variable: '--font-tiro-bangla',
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
      className={`${cormorant.variable} ${plexSans.variable} ${tiroBangla.variable} ${plexMono.variable}`}
    >
      <body>
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

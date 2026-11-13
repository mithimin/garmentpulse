// apps/web/app/layout.tsx
//
// The outer frame shared by every page of GarmentPulse Web.
// Every page is placed inside this layout. It loads the three fonts of the
// design system (titles, normal text, codes), the colours and sizes in
// globals.css, and the language memory (English or Bangla).
// Owned by Mithi.

import type { ReactNode } from 'react';
import { Baloo_Da_2, IBM_Plex_Mono, Lato } from 'next/font/google';
import { AuthProvider } from '../auth/AuthContext';
import { LanguageProvider } from '../language/LanguageContext';
import './globals.css';
// The factory look (brown, cream and baby blue) is written last, so it wins over globals.css.
import './factory.css';
// The login and sign-up pages are an exact copy of the login draft picture (login.css).
import './login.css';

// The English fonts cannot draw Bangla letters, so Bangla uses Baloo Da 2,
// a rounded, friendly Bangla font that has several weights (see the font lists in globals.css).
// Lato is the ONE English font of the whole website (titles, normal text, greeting and big
// numbers). It is a clean, friendly sans-serif whose letter widths match the factory-look draft
// picture Mithi shared on 2026-11-13. Lato has regular (400) and bold (700); a CSS weight of
// 500 or 600 is drawn with the nearest one.
const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
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
      data-scroll-behavior="smooth"
      className={`${lato.variable} ${balooBangla.variable} ${plexMono.variable}`}
    >
      <body>
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

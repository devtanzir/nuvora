import type { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Nuvora - Premium Fashion',
    template: '%s | Nuvora',
  },
  description: 'Discover premium fashion at Nuvora. Elevate your style with our curated collection.',
  keywords: ['fashion', 'premium', 'clothing', 'nuvora'],
    icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} ${playfair.variable} ${inter.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

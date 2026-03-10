import './globals.css';
import type { Metadata } from 'next';
import { PixelSkyBackground } from '@/components/PixelSkyBackground';

export const metadata: Metadata = {
  title: 'Worldforge — Collaborative Worldbuilding Platform',
  description:
    'A premium collaborative worldbuilding platform for writers, game masters, studios, and creative teams.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PixelSkyBackground />
        {children}
      </body>
    </html>
  );
}

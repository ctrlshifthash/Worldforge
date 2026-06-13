import './globals.css';
import type { Metadata } from 'next';
import { PixelSkyBackground } from '@/components/PixelSkyBackground';
import { LoadingScreen } from '@/components/LoadingScreen';
import { PrivyProviderWrapper } from '@/components/PrivyProviderWrapper';

export const metadata: Metadata = {
  title: 'Worldcraft',
  description:
    'A premium collaborative worldbuilding platform for writers, game masters, studios, and creative teams.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PrivyProviderWrapper>
          <LoadingScreen />
          <PixelSkyBackground />
          {children}
        </PrivyProviderWrapper>
      </body>
    </html>
  );
}

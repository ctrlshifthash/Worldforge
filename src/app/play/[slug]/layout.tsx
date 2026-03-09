import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore World — Worldforge',
};

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

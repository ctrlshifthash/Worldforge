import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login' as never);

  return (
    <>
      <Navbar />
      <main className="page-container">{children}</main>
    </>
  );
}

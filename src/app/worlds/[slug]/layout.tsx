import { notFound } from 'next/navigation';
import { getWorldBySlug, getEntities, getEras, getPendingDevelopmentCount } from '@/lib/queries';
import { getSession } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { WorldNav } from './WorldNav';

export default async function WorldLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) notFound();

  const session = await getSession();
  const isOwner = session?.sub === world.ownerId;

  const [entities, eras, pendingCount] = await Promise.all([
    getEntities(world.id),
    getEras(world.id),
    isOwner ? getPendingDevelopmentCount(world.id) : Promise.resolve(0),
  ]);

  return (
    <>
      <Navbar />
      <main className="page-container">
        <WorldNav
          slug={slug}
          isOwner={isOwner}
          entityCount={entities.length}
          eraCount={eras.length}
          pendingCount={pendingCount}
        />
        {children}
      </main>
    </>
  );
}

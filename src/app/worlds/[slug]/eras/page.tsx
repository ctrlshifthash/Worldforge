import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWorldBySlug, getEras } from '@/lib/queries';
import { CreateEraForm } from './CreateEraForm';

export default async function ErasPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) notFound();

  const eras = await getEras(world.id);

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <p className="eyebrow">{world.title}</p>
            <h1 className="text-headline">Eras</h1>
            <p className="page-description">Time periods that divide your world&apos;s history. Each era groups timeline events and can be used to filter the map and connections view.</p>
          </div>
          <CreateEraForm />
        </div>
      </div>

      {eras.length > 0 ? (
        <div className="eras-grid">
          {eras.map((era) => (
            <Link
              key={era.id}
              href={`/worlds/${slug}/eras/${era.slug}`}
              className="era-card card card-interactive"
            >
              <div className="era-card-accent" style={{ background: era.color }} />
              <div className="era-card-body">
                <div className="era-card-header">
                  <h3>{era.title}</h3>
                  <span className="badge" style={{ borderColor: `${era.color}40`, color: era.color }}>
                    {era._count.events} {era._count.events === 1 ? 'event' : 'events'}
                  </span>
                </div>
                {(era.startLabel || era.endLabel) && (
                  <div className="era-card-dates text-small">
                    {era.startLabel}{era.startLabel && era.endLabel && ' — '}{era.endLabel}
                  </div>
                )}
                {era.description && (
                  <p className="era-card-desc">{era.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">&#9719;</div>
          <h3>No eras defined</h3>
          <p style={{ maxWidth: 480, marginBottom: 16 }}>
            Eras are time periods that divide your world&apos;s history — like &ldquo;The First Age&rdquo; or
            &ldquo;The Age of Ruin.&rdquo; Each era gets a title, date range, color, and description. Timeline events
            are grouped by era, and the era filter on the Map and Connections pages lets you filter everything by time period.
          </p>
          <p className="text-small" style={{ marginBottom: 16 }}>
            Click <strong>&ldquo;+ New Era&rdquo;</strong> above to create one — or use the AI assist to generate one automatically.
          </p>
        </div>
      )}
    </>
  );
}

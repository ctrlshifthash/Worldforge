import { notFound } from 'next/navigation';
import { getWorldBySlug, getActivity } from '@/lib/queries';
import { timeAgo } from '@/lib/utils';

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) notFound();

  const activity = await getActivity(world.id, 50);

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <p className="eyebrow">{world.title}</p>
            <h1 className="text-headline">Activity Log</h1>
            <p className="page-description">A record of every edit, creation, and AI generation in this world — who did what, and when.</p>
          </div>
        </div>
      </div>

      {activity.length > 0 ? (
        <div className="card" style={{ padding: 0 }}>
          <div className="activity-feed" style={{ padding: '8px 24px' }}>
            {activity.map((item) => (
              <div key={item.id} className="activity-item">
                <div className="activity-avatar">
                  {item.user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="activity-body">
                  <div className="activity-text">
                    <strong>{item.user.name}</strong> {item.action} {item.target}
                  </div>
                  {item.detail && (
                    <div className="text-small" style={{ marginTop: 2 }}>{item.detail}</div>
                  )}
                </div>
                <span className="activity-time">{timeAgo(item.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No activity yet</h3>
          <p>Every edit, creation, and AI generation is logged here — who did what, and when.</p>
        </div>
      )}
    </>
  );
}

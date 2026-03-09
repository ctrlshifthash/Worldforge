'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface EraSegment {
  id: string;
  slug: string;
  title: string;
  color: string;
  startLabel: string;
  endLabel: string;
  sortOrder: number;
}

export function EraScrubber({
  eras,
  basePath,
}: {
  eras: EraSegment[];
  basePath: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentEra = searchParams.get('era');

  if (eras.length === 0) return null;

  const handleEraClick = (slug: string) => {
    if (currentEra === slug) {
      // Deselect — back to "all time"
      router.push(basePath);
    } else {
      router.push(`${basePath}?era=${slug}`);
    }
  };

  return (
    <div className="era-scrubber">
      <div className="era-scrubber-label">Era</div>
      <div className="era-scrubber-track">
        {eras.map((era) => {
          const isActive = currentEra === era.slug;
          return (
            <button
              key={era.id}
              className={`era-scrubber-segment ${isActive ? 'active' : ''}`}
              style={{
                '--era-color': era.color,
                background: isActive ? era.color : `${era.color}20`,
                borderColor: isActive ? era.color : `${era.color}40`,
                color: isActive ? '#fff' : era.color,
              } as React.CSSProperties}
              onClick={() => handleEraClick(era.slug)}
              title={`${era.title}${era.startLabel ? ` (${era.startLabel}${era.endLabel ? ' — ' + era.endLabel : ''})` : ''}`}
            >
              <span className="era-scrubber-segment-title">{era.title}</span>
              {era.startLabel && (
                <span className="era-scrubber-segment-dates">
                  {era.startLabel}{era.endLabel ? ` — ${era.endLabel}` : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {currentEra && (
        <button
          className="era-scrubber-clear"
          onClick={() => router.push(basePath)}
        >
          All time
        </button>
      )}
    </div>
  );
}

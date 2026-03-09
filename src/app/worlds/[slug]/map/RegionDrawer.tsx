'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RegionInfo {
  id: string;
  title: string;
  color: string;
  territories: {
    era: { id: string; title: string; color: string };
    entity: { id: string; title: string; accent: string };
  }[];
}

interface EraOption {
  id: string;
  title: string;
  color: string;
}

interface FactionOption {
  id: string;
  title: string;
  accent: string;
}

export function RegionDrawer({
  regions,
  eras,
  factions,
  slug,
}: {
  regions: RegionInfo[];
  eras: EraOption[];
  factions: FactionOption[];
  slug: string;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#0984E3');
  const [loading, setLoading] = useState(false);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  // For territory assignment
  const [assignEra, setAssignEra] = useState('');
  const [assignFaction, setAssignFaction] = useState('');
  const [assigning, setAssigning] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      // Create a simple rectangular region at center of map
      const points = [
        { x: 35, y: 35 },
        { x: 65, y: 35 },
        { x: 65, y: 65 },
        { x: 35, y: 65 },
      ];
      await fetch(`/api/worlds/${slug}/regions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          pointsJson: JSON.stringify(points),
          color,
        }),
      });
      setTitle('');
      setShowForm(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (regionId: string) => {
    await fetch(`/api/worlds/${slug}/regions?id=${regionId}`, { method: 'DELETE' });
    router.refresh();
  };

  const handleAssignTerritory = async (regionId: string) => {
    if (!assignEra || !assignFaction) return;
    setAssigning(true);
    try {
      await fetch(`/api/worlds/${slug}/regions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regionId,
          eraId: assignEra,
          entityId: assignFaction,
        }),
      });
      setAssignEra('');
      setAssignFaction('');
      router.refresh();
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="region-drawer">
      <div className="region-drawer-header">
        <h4>Regions</h4>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {showForm && (
        <div className="region-drawer-form">
          <input
            className="input"
            placeholder="Region name..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ fontSize: '0.82rem' }}
          />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ width: 32, height: 28, border: 'none', cursor: 'pointer' }}
            />
            <button className="btn btn-primary btn-sm" onClick={handleCreate} disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      <div className="region-list">
        {regions.map((region) => (
          <div key={region.id} className="region-item">
            <div
              className="region-item-header"
              onClick={() => setExpandedRegion(expandedRegion === region.id ? null : region.id)}
              style={{ cursor: 'pointer' }}
            >
              <span className="entity-dot" style={{ background: region.color, width: 8, height: 8 }} />
              <span className="region-item-title">{region.title}</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={(e) => { e.stopPropagation(); handleDelete(region.id); }}
                style={{ padding: '2px 6px', fontSize: '0.7rem' }}
              >
                &times;
              </button>
            </div>

            {expandedRegion === region.id && (
              <div className="region-item-detail">
                {/* Existing territories */}
                {region.territories.length > 0 && (
                  <div className="region-territories">
                    {region.territories.map((t, i) => (
                      <div key={i} className="region-territory-row">
                        <span style={{ color: t.era.color, fontSize: '0.72rem' }}>{t.era.title}</span>
                        <span style={{ fontSize: '0.72rem' }}>&rarr;</span>
                        <span style={{ color: t.entity.accent, fontSize: '0.72rem' }}>{t.entity.title}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Assign territory */}
                {eras.length > 0 && factions.length > 0 && (
                  <div className="region-assign">
                    <select
                      className="input"
                      value={assignEra}
                      onChange={(e) => setAssignEra(e.target.value)}
                      style={{ fontSize: '0.75rem', padding: '3px 6px' }}
                    >
                      <option value="">Era...</option>
                      {eras.map((era) => (
                        <option key={era.id} value={era.id}>{era.title}</option>
                      ))}
                    </select>
                    <select
                      className="input"
                      value={assignFaction}
                      onChange={(e) => setAssignFaction(e.target.value)}
                      style={{ fontSize: '0.75rem', padding: '3px 6px' }}
                    >
                      <option value="">Owner...</option>
                      {factions.map((f) => (
                        <option key={f.id} value={f.id}>{f.title}</option>
                      ))}
                    </select>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleAssignTerritory(region.id)}
                      disabled={assigning || !assignEra || !assignFaction}
                      style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                    >
                      Assign
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {regions.length === 0 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '8px 0' }}>
            No regions defined yet.
          </p>
        )}
      </div>
    </div>
  );
}

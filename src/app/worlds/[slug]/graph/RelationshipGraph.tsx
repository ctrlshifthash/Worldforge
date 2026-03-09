'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ENTITY_COLORS, ENTITY_LABELS } from '@/lib/utils';

interface GraphNode {
  id: string;
  slug: string;
  title: string;
  type: string;
  accent: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface GraphEdge {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  label: string;
}

interface EventInfo {
  title: string;
  dateLabel: string;
  eraTitle: string;
  eraColor: string;
}

export function RelationshipGraph({
  nodes: initialNodes,
  edges: initialEdges,
  slug,
  highlightedNodeIds = [],
  eventInfo = null,
}: {
  nodes: Omit<GraphNode, 'x' | 'y' | 'vx' | 'vy'>[];
  edges: GraphEdge[];
  slug: string;
  highlightedNodeIds?: string[];
  eventInfo?: EventInfo | null;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const simulationRef = useRef<any>(null);
  const [renderNodes, setRenderNodes] = useState<GraphNode[]>([]);
  const [renderEdges, setRenderEdges] = useState<GraphEdge[]>([]);

  const isEventMode = highlightedNodeIds.length > 0;

  useEffect(() => {
    const container = svgRef.current?.parentElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    }

    const handleResize = () => {
      if (container) {
        const rect = container.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (initialNodes.length === 0) return;

    let active = true;

    import('d3-force').then((d3) => {
      if (!active) return;

      const nodes: GraphNode[] = initialNodes.map((n) => ({
        ...n,
        x: dimensions.width / 2 + (Math.random() - 0.5) * 200,
        y: dimensions.height / 2 + (Math.random() - 0.5) * 200,
      }));

      const edges: GraphEdge[] = initialEdges.map((e) => ({ ...e }));

      const simulation = d3
        .forceSimulation(nodes)
        .force(
          'link',
          d3
            .forceLink<GraphNode, GraphEdge>(edges)
            .id((d) => d.id)
            .distance(140)
        )
        .force('charge', d3.forceManyBody().strength(-400))
        .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
        .force('collision', d3.forceCollide().radius(50))
        .on('tick', () => {
          setRenderNodes([...nodes]);
          setRenderEdges([...edges]);
        });

      simulationRef.current = simulation;
    });

    return () => {
      active = false;
      simulationRef.current?.stop();
    };
  }, [initialNodes, initialEdges, dimensions]);

  if (initialNodes.length === 0) {
    return (
      <div className="graph-container">
        <div className="empty-state">
          <div className="empty-state-icon">&#9671;</div>
          <h3>No connections yet</h3>
          <p style={{ maxWidth: 480 }}>Create entities and add connections between them to see how your world is linked. Go to Entities to get started.</p>
        </div>
      </div>
    );
  }

  const entityTypes = [...new Set(initialNodes.map((n) => n.type))];

  const isNodeHighlighted = (nodeId: string) => highlightedNodeIds.includes(nodeId);

  const isEdgeHighlighted = (edge: GraphEdge) => {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
    const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
    return isNodeHighlighted(sourceId) && isNodeHighlighted(targetId);
  };

  const isEdgePartial = (edge: GraphEdge) => {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
    const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
    return isNodeHighlighted(sourceId) || isNodeHighlighted(targetId);
  };

  return (
    <div className="graph-container">
      <svg ref={svgRef} className="graph-svg" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}>
        <defs>
          {entityTypes.map((type) => (
            <radialGradient key={type} id={`glow-${type}`}>
              <stop offset="0%" stopColor={ENTITY_COLORS[type] || '#888'} stopOpacity="0.4" />
              <stop offset="100%" stopColor={ENTITY_COLORS[type] || '#888'} stopOpacity="0" />
            </radialGradient>
          ))}
          <radialGradient id="glow-event">
            <stop offset="0%" stopColor="#c8a44e" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#c8a44e" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Edges */}
        {renderEdges.map((edge) => {
          const source = edge.source as GraphNode;
          const target = edge.target as GraphNode;
          if (!source.x || !target.x) return null;

          const hoverHighlighted =
            hoveredNode === source.id || hoveredNode === target.id;

          const eventHighlighted = isEventMode && isEdgeHighlighted(edge);
          const eventPartial = isEventMode && isEdgePartial(edge);
          const eventDimmed = isEventMode && !eventPartial;

          const midX = (source.x + target.x) / 2;
          const midY = (source.y! + target.y!) / 2;

          let strokeColor = 'rgba(255,255,255,0.08)';
          let strokeWidth = 1;

          if (eventDimmed) {
            strokeColor = 'rgba(255,255,255,0.02)';
          } else if (eventHighlighted) {
            strokeColor = 'rgba(200,164,78,0.5)';
            strokeWidth = 2.5;
          } else if (eventPartial) {
            strokeColor = 'rgba(200,164,78,0.2)';
            strokeWidth = 1.5;
          } else if (hoverHighlighted) {
            strokeColor = 'rgba(200,164,78,0.4)';
            strokeWidth = 2;
          }

          return (
            <g key={edge.id} style={{ opacity: eventDimmed ? 0.15 : 1 }}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                className="graph-edge"
                style={{ stroke: strokeColor, strokeWidth }}
              />
              <text
                x={midX}
                y={midY - 6}
                className="graph-edge-label"
                style={{ opacity: eventDimmed ? 0.15 : 1 }}
              >
                {edge.label}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {renderNodes.map((node) => {
          if (!node.x || !node.y) return null;
          const color = ENTITY_COLORS[node.type] || node.accent;
          const isHovered = hoveredNode === node.id;
          const isConnected =
            hoveredNode &&
            renderEdges.some((e) => {
              const s = (e.source as GraphNode).id;
              const t = (e.target as GraphNode).id;
              return (
                (s === hoveredNode && t === node.id) ||
                (t === hoveredNode && s === node.id)
              );
            });

          const eventHighlighted = isEventMode && isNodeHighlighted(node.id);
          const eventDimmed = isEventMode && !eventHighlighted;
          const dimmed = eventDimmed || (hoveredNode && !isHovered && !isConnected && !isEventMode);

          const nodeRadius = eventHighlighted ? 20 : isHovered ? 18 : 14;
          const glowRadius = eventHighlighted ? 45 : isHovered ? 35 : 28;

          return (
            <g
              key={node.id}
              style={{
                cursor: 'pointer',
                opacity: dimmed ? 0.15 : 1,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => router.push(`/worlds/${slug}/entities/${node.slug}`)}
            >
              {eventHighlighted && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={glowRadius + 10}
                  fill="url(#glow-event)"
                  className="graph-node-event-pulse"
                />
              )}
              <circle
                cx={node.x}
                cy={node.y}
                r={glowRadius}
                fill={eventHighlighted ? 'url(#glow-event)' : `url(#glow-${node.type})`}
                className="graph-node-glow"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeRadius}
                fill={eventHighlighted ? '#c8a44e' : color}
                stroke={isHovered || eventHighlighted ? '#fff' : 'rgba(255,255,255,0.2)'}
                strokeWidth={isHovered || eventHighlighted ? 2.5 : 1}
                style={{ transition: 'r 0.2s, stroke 0.2s, fill 0.3s' }}
              />
              <text
                x={node.x}
                y={node.y + (eventHighlighted ? 34 : 28)}
                className="graph-node-label"
                style={{ fontWeight: isHovered || eventHighlighted ? 600 : undefined, fill: eventHighlighted ? '#fff' : undefined }}
              >
                {node.title}
              </text>
              <text x={node.x} y={node.y + (eventHighlighted ? 46 : 40)} className="graph-node-type">
                {ENTITY_LABELS[node.type]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Event info overlay */}
      {eventInfo && (
        <div className="graph-event-overlay">
          <div className="graph-event-overlay-era" style={{ color: eventInfo.eraColor }}>
            {eventInfo.eraTitle} &middot; {eventInfo.dateLabel}
          </div>
          <h3 className="graph-event-overlay-title">{eventInfo.title}</h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {highlightedNodeIds.length} {highlightedNodeIds.length === 1 ? 'entity' : 'entities'} involved
          </div>
          <Link href={`/worlds/${slug}/timeline`} className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>
            &larr; Back to Timeline
          </Link>
        </div>
      )}

      {/* Legend */}
      <div className="graph-legend">
        {entityTypes.map((type) => (
          <div key={type} className="graph-legend-item">
            <span
              className="entity-dot"
              style={{ background: ENTITY_COLORS[type], width: 8, height: 8 }}
            />
            {ENTITY_LABELS[type]}
          </div>
        ))}
      </div>
    </div>
  );
}

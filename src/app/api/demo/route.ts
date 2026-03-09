import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TEMPLATE_SLUG = 'everhold';

export async function POST() {
  // Load the template world
  const template = await prisma.world.findUnique({
    where: { slug: TEMPLATE_SLUG },
    include: {
      eras: true,
      entities: true,
      events: { include: { entityLinks: true } },
      relations: true,
    },
  });

  if (!template) {
    return NextResponse.json({ error: 'Demo template not found' }, { status: 404 });
  }

  // Generate unique slug
  const suffix = Math.random().toString(36).substring(2, 8);
  const slug = `demo-${suffix}`;

  // Create the cloned world
  const world = await prisma.world.create({
    data: {
      slug,
      title: template.title,
      tagline: template.tagline,
      description: template.description,
      visibility: 'PRIVATE',
      coverGradient: template.coverGradient,
      ownerId: null,
    },
  });

  // Clone eras — map old ID → new ID
  const eraMap: Record<string, string> = {};
  for (const era of template.eras) {
    const created = await prisma.era.create({
      data: {
        worldId: world.id,
        slug: era.slug,
        title: era.title,
        description: era.description,
        sortOrder: era.sortOrder,
        startLabel: era.startLabel,
        endLabel: era.endLabel,
        color: era.color,
      },
    });
    eraMap[era.id] = created.id;
  }

  // Clone entities — map old ID → new ID
  const entityMap: Record<string, string> = {};
  for (const entity of template.entities) {
    const created = await prisma.entity.create({
      data: {
        worldId: world.id,
        slug: entity.slug,
        type: entity.type,
        title: entity.title,
        summary: entity.summary,
        accent: entity.accent,
        contentJson: entity.contentJson,
        factsJson: entity.factsJson,
        tagsJson: entity.tagsJson,
        graphX: entity.graphX,
        graphY: entity.graphY,
        mapX: entity.mapX,
        mapY: entity.mapY,
        introducedEraId: entity.introducedEraId ? eraMap[entity.introducedEraId] || null : null,
        retiredEraId: entity.retiredEraId ? eraMap[entity.retiredEraId] || null : null,
      },
    });
    entityMap[entity.id] = created.id;
  }

  // Clone events — remap eraId and linkedEntityId
  const eventMap: Record<string, string> = {};
  for (const event of template.events) {
    const created = await prisma.event.create({
      data: {
        worldId: world.id,
        title: event.title,
        dateLabel: event.dateLabel,
        era: event.era,
        eraId: event.eraId ? eraMap[event.eraId] || null : null,
        summary: event.summary,
        impact: event.impact,
        sortOrder: event.sortOrder,
        linkedEntitySlugs: event.linkedEntitySlugs,
        linkedEntityId: event.linkedEntityId ? entityMap[event.linkedEntityId] || null : null,
        source: event.source,
      },
    });
    eventMap[event.id] = created.id;

    // Clone event-entity links
    if (event.entityLinks.length > 0) {
      await prisma.eventEntityLink.createMany({
        data: event.entityLinks.map((link) => ({
          eventId: created.id,
          entityId: entityMap[link.entityId] || link.entityId,
          role: link.role,
        })),
      });
    }
  }

  // Clone relations — remap entity IDs and era IDs
  for (const rel of template.relations) {
    const fromId = entityMap[rel.fromEntityId];
    const toId = entityMap[rel.toEntityId];
    if (fromId && toId) {
      await prisma.entityRelation.create({
        data: {
          worldId: world.id,
          fromEntityId: fromId,
          toEntityId: toId,
          label: rel.label,
          formedEraId: rel.formedEraId ? eraMap[rel.formedEraId] || null : null,
          dissolvedEraId: rel.dissolvedEraId ? eraMap[rel.dissolvedEraId] || null : null,
        },
      });
    }
  }

  return NextResponse.json({ slug });
}

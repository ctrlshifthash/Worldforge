import { prisma } from './prisma';
import type { EntityType, Visibility, SessionStatus, DevelopmentType, DevelopmentStatus } from '@prisma/client';
import { slugify } from './utils';

/* ──────────────────────── Worlds ──────────────────────── */

export async function getWorlds(userId?: string) {
  const where = userId
    ? {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
          { visibility: 'PUBLIC' as Visibility },
        ],
      }
    : { visibility: 'PUBLIC' as Visibility };

  return prisma.world.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
      _count: { select: { entities: true, events: true, members: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getWorldBySlug(slug: string) {
  return prisma.world.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, name: true, avatar: true, username: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, avatar: true, username: true } },
        },
      },
      _count: { select: { entities: true, events: true, members: true, relations: true } },
    },
  });
}

export async function createWorld(data: {
  title: string;
  tagline: string;
  description: string;
  visibility: Visibility;
  ownerId?: string | null;
  coverGradient?: string;
}) {
  const slug = slugify(data.title);
  const world = await prisma.world.create({
    data: {
      slug,
      title: data.title,
      tagline: data.tagline,
      description: data.description,
      visibility: data.visibility,
      coverGradient:
        data.coverGradient ||
        'radial-gradient(circle at 30% 20%, rgba(200,164,78,0.3), transparent 50%), linear-gradient(135deg, #0f1019 0%, #1a1520 50%, #1c1428 100%)',
      ownerId: data.ownerId ?? null,
      ...(data.ownerId ? { members: { create: { userId: data.ownerId, role: 'OWNER' } } } : {}),
    },
  });

  if (data.ownerId) {
    await logActivity(world.id, data.ownerId, 'created', `world "${data.title}"`);
  }
  return world;
}

export async function updateWorld(
  id: string,
  data: Partial<{
    title: string;
    tagline: string;
    description: string;
    visibility: Visibility;
    coverGradient: string;
  }>
) {
  return prisma.world.update({ where: { id }, data });
}

export async function deleteWorld(id: string) {
  return prisma.world.delete({ where: { id } });
}

/* ──────────────────────── Entities ──────────────────────── */

export async function getEntities(worldId: string, type?: EntityType) {
  return prisma.entity.findMany({
    where: { worldId, ...(type ? { type } : {}) },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getEntityBySlug(worldId: string, slug: string) {
  return prisma.entity.findUnique({
    where: { worldId_slug: { worldId, slug } },
    include: {
      relationsFrom: {
        include: { toEntity: { select: { id: true, slug: true, title: true, type: true, accent: true } } },
      },
      relationsTo: {
        include: { fromEntity: { select: { id: true, slug: true, title: true, type: true, accent: true } } },
      },
      events: true,
    },
  });
}

export async function createEntity(data: {
  worldId: string;
  type: EntityType;
  title: string;
  summary: string;
  content: string;
  accent: string;
  facts: { label: string; value: string }[];
  tags: string[];
  userId?: string | null;
}) {
  const slug = slugify(data.title);
  const entity = await prisma.entity.create({
    data: {
      worldId: data.worldId,
      slug,
      type: data.type,
      title: data.title,
      summary: data.summary,
      accent: data.accent,
      contentJson: JSON.stringify(
        data.content
          .split(/\n{2,}/)
          .map((p) => p.trim())
          .filter(Boolean)
      ),
      factsJson: JSON.stringify(data.facts),
      tagsJson: JSON.stringify(data.tags),
    },
  });

  if (data.userId) {
    await logActivity(data.worldId, data.userId, 'created', `${data.type.toLowerCase()} "${data.title}"`);
  }
  return entity;
}

export async function updateEntity(
  id: string,
  data: {
    title?: string;
    summary?: string;
    content?: string;
    accent?: string;
    facts?: { label: string; value: string }[];
    tags?: string[];
    userId: string;
    worldId: string;
  }
) {
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) {
    updateData.title = data.title;
    updateData.slug = slugify(data.title);
  }
  if (data.summary !== undefined) updateData.summary = data.summary;
  if (data.accent !== undefined) updateData.accent = data.accent;
  if (data.content !== undefined) {
    updateData.contentJson = JSON.stringify(
      data.content
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
    );
  }
  if (data.facts !== undefined) updateData.factsJson = JSON.stringify(data.facts);
  if (data.tags !== undefined) updateData.tagsJson = JSON.stringify(data.tags);

  const entity = await prisma.entity.update({ where: { id }, data: updateData });
  await logActivity(data.worldId, data.userId, 'updated', `"${entity.title}"`);
  return entity;
}

export async function deleteEntity(id: string, worldId: string, userId: string, title: string) {
  await prisma.entity.delete({ where: { id } });
  await logActivity(worldId, userId, 'deleted', `"${title}"`);
}

/* ──────────────────────── Relations ──────────────────────── */

export async function getRelations(worldId: string) {
  return prisma.entityRelation.findMany({
    where: { worldId },
    include: {
      fromEntity: { select: { id: true, slug: true, title: true, type: true, accent: true } },
      toEntity: { select: { id: true, slug: true, title: true, type: true, accent: true } },
    },
  });
}

export async function createRelation(data: {
  worldId: string;
  fromEntityId: string;
  toEntityId: string;
  label: string;
}) {
  return prisma.entityRelation.create({ data });
}

export async function deleteRelation(id: string) {
  return prisma.entityRelation.delete({ where: { id } });
}

/* ──────────────────────── Eras ──────────────────────── */

export async function getEras(worldId: string) {
  return prisma.era.findMany({
    where: { worldId },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { events: true } },
    },
  });
}

export async function getWorldQuests(worldId: string) {
  return prisma.worldQuest.findMany({
    where: { worldId },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getEraBySlug(worldId: string, slug: string) {
  return prisma.era.findUnique({
    where: { worldId_slug: { worldId, slug } },
    include: {
      events: {
        orderBy: { sortOrder: 'asc' },
        include: {
          entityLinks: {
            include: {
              entity: { select: { id: true, slug: true, title: true, type: true, accent: true } },
            },
          },
        },
      },
    },
  });
}

export async function getEntitiesIntroducedInEra(eraId: string) {
  return prisma.entity.findMany({
    where: { introducedEraId: eraId },
    select: { id: true, slug: true, title: true, type: true, accent: true, summary: true },
    orderBy: { title: 'asc' },
  });
}

export async function getEntitiesRetiredInEra(eraId: string) {
  return prisma.entity.findMany({
    where: { retiredEraId: eraId },
    select: { id: true, slug: true, title: true, type: true, accent: true, summary: true },
    orderBy: { title: 'asc' },
  });
}

export async function getRelationsFormedInEra(eraId: string) {
  return prisma.entityRelation.findMany({
    where: { formedEraId: eraId },
    include: {
      fromEntity: { select: { id: true, slug: true, title: true, type: true, accent: true } },
      toEntity: { select: { id: true, slug: true, title: true, type: true, accent: true } },
    },
  });
}

export async function getRelationsDissolvedInEra(eraId: string) {
  return prisma.entityRelation.findMany({
    where: { dissolvedEraId: eraId },
    include: {
      fromEntity: { select: { id: true, slug: true, title: true, type: true, accent: true } },
      toEntity: { select: { id: true, slug: true, title: true, type: true, accent: true } },
    },
  });
}

export async function getTerritoriesForEra(eraId: string) {
  return prisma.territoryRecord.findMany({
    where: { eraId },
    include: {
      region: { select: { id: true, slug: true, title: true, color: true } },
      entity: { select: { id: true, slug: true, title: true, type: true, accent: true } },
    },
  });
}

export async function createEra(data: {
  worldId: string;
  title: string;
  description?: string;
  sortOrder?: number;
  startLabel?: string;
  endLabel?: string;
  color?: string;
}) {
  const slug = slugify(data.title);
  return prisma.era.create({
    data: {
      worldId: data.worldId,
      slug,
      title: data.title,
      description: data.description || '',
      sortOrder: data.sortOrder ?? 0,
      startLabel: data.startLabel || '',
      endLabel: data.endLabel || '',
      color: data.color || '#FF6B2C',
    },
  });
}

export async function updateEra(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    sortOrder: number;
    startLabel: string;
    endLabel: string;
    color: string;
  }>
) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.title) updateData.slug = slugify(data.title);
  return prisma.era.update({ where: { id }, data: updateData });
}

export async function deleteEra(id: string) {
  return prisma.era.delete({ where: { id } });
}

/* ──────────────────────── Events / Timeline ──────────────────────── */

export async function getEvents(worldId: string) {
  return prisma.event.findMany({
    where: { worldId },
    orderBy: { sortOrder: 'asc' },
    include: {
      linkedEntity: { select: { id: true, slug: true, title: true, type: true } },
      eraRef: { select: { id: true, slug: true, title: true, color: true, startLabel: true, endLabel: true } },
      entityLinks: {
        include: {
          entity: { select: { id: true, slug: true, title: true, type: true, accent: true } },
        },
      },
    },
  });
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      eraRef: { select: { id: true, slug: true, title: true, color: true } },
      entityLinks: {
        include: {
          entity: { select: { id: true, slug: true, title: true, type: true, accent: true, mapX: true, mapY: true } },
        },
      },
    },
  });
}

export async function createEvent(data: {
  worldId: string;
  title: string;
  dateLabel: string;
  era: string;
  eraId?: string;
  summary: string;
  impact: string;
  sortOrder: number;
  linkedEntitySlugs: string;
  linkedEntityId?: string;
  source?: string;
}) {
  return prisma.event.create({ data });
}

/* ──────────────────────── Event-Entity Links ──────────────────────── */

export async function getEntityEvents(entityId: string) {
  return prisma.eventEntityLink.findMany({
    where: { entityId },
    include: {
      event: {
        include: {
          eraRef: { select: { id: true, slug: true, title: true, color: true } },
        },
      },
    },
    orderBy: { event: { sortOrder: 'asc' } },
  });
}

export async function createEventEntityLinks(
  links: { eventId: string; entityId: string; role?: string }[]
) {
  return prisma.eventEntityLink.createMany({
    data: links.map((l) => ({
      eventId: l.eventId,
      entityId: l.entityId,
      role: l.role || 'involved',
    })),
  });
}

/* ──────────────────────── Activity ──────────────────────── */

export async function getActivity(worldId: string, limit = 20) {
  return prisma.activityLog.findMany({
    where: { worldId },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function logActivity(
  worldId: string,
  userId: string,
  action: string,
  target: string,
  detail?: string
) {
  return prisma.activityLog.create({
    data: { worldId, userId, action, target, detail },
  });
}

/* ──────────────────────── Search ──────────────────────── */

export async function searchEntities(worldId: string, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const entities = await prisma.entity.findMany({
    where: {
      worldId,
      OR: [
        { title: { contains: normalized } },
        { summary: { contains: normalized } },
        { tagsJson: { contains: normalized } },
      ],
    },
    take: 20,
  });

  return entities;
}

/* ──────────────────────── Members ──────────────────────── */

export async function getMembers(worldId: string) {
  return prisma.worldMember.findMany({
    where: { worldId },
    include: {
      user: { select: { id: true, name: true, avatar: true, username: true } },
    },
  });
}

/* ──────────────────────── Users ──────────────────────── */

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(data: {
  email: string;
  username: string;
  name: string;
  passwordHash: string;
}) {
  return prisma.user.create({ data });
}

/* ──────────────────────── Map Regions ──────────────────────── */

export async function getMapRegions(worldId: string) {
  return prisma.mapRegion.findMany({
    where: { worldId },
    include: {
      territories: {
        include: {
          era: { select: { id: true, slug: true, title: true, color: true, sortOrder: true } },
          entity: { select: { id: true, slug: true, title: true, type: true, accent: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createMapRegion(data: {
  worldId: string;
  title: string;
  description?: string;
  pointsJson: string;
  color?: string;
}) {
  const slug = slugify(data.title);
  return prisma.mapRegion.create({
    data: {
      worldId: data.worldId,
      slug,
      title: data.title,
      description: data.description || '',
      pointsJson: data.pointsJson,
      color: data.color || '#0984E3',
    },
  });
}

export async function updateMapRegion(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    pointsJson: string;
    color: string;
  }>
) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.title) updateData.slug = slugify(data.title);
  return prisma.mapRegion.update({ where: { id }, data: updateData });
}

export async function deleteMapRegion(id: string) {
  return prisma.mapRegion.delete({ where: { id } });
}

/* ──────────────────────── Territory Records ──────────────────────── */

export async function setTerritoryOwner(data: {
  regionId: string;
  eraId: string;
  entityId: string;
}) {
  return prisma.territoryRecord.upsert({
    where: { regionId_eraId: { regionId: data.regionId, eraId: data.eraId } },
    update: { entityId: data.entityId },
    create: data,
  });
}

export async function removeTerritoryOwner(regionId: string, eraId: string) {
  return prisma.territoryRecord.delete({
    where: { regionId_eraId: { regionId, eraId } },
  });
}

/* ──────────────────────── Character Sessions ──────────────────────── */

export async function getCharacterSessions(worldId: string) {
  return prisma.characterSession.findMany({
    where: { worldId },
    include: {
      entity: { select: { id: true, slug: true, title: true, type: true, accent: true } },
      user: { select: { id: true, name: true, avatar: true } },
      _count: { select: { developments: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getCharacterSession(id: string) {
  return prisma.characterSession.findUnique({
    where: { id },
    include: {
      entity: {
        include: {
          relationsFrom: {
            include: { toEntity: { select: { id: true, slug: true, title: true, type: true, accent: true, summary: true } } },
          },
          relationsTo: {
            include: { fromEntity: { select: { id: true, slug: true, title: true, type: true, accent: true, summary: true } } },
          },
        },
      },
      user: { select: { id: true, name: true } },
      developments: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });
}

export async function getActiveSessionForEntity(entityId: string) {
  return prisma.characterSession.findFirst({
    where: { entityId, status: 'ACTIVE' },
  });
}

export async function createCharacterSession(data: {
  worldId: string;
  entityId: string;
  userId: string;
  personalityPrompt: string;
  constraints: string;
  frequency?: string;
  scope?: string;
}) {
  return prisma.characterSession.create({
    data: {
      worldId: data.worldId,
      entityId: data.entityId,
      userId: data.userId,
      personalityPrompt: data.personalityPrompt,
      constraints: data.constraints,
      frequency: data.frequency || 'manual',
      scope: (data.scope as 'SAFE' | 'EXPANDED' | 'ADVANCED') || 'SAFE',
    },
  });
}

export async function updateCharacterSession(
  id: string,
  data: Partial<{
    status: SessionStatus;
    personalityPrompt: string;
    constraints: string;
    contextSummary: string;
    frequency: string;
    lastGeneratedAt: Date;
  }>
) {
  return prisma.characterSession.update({ where: { id }, data });
}

/* ──────────────────────── Developments ──────────────────────── */

export async function getDevelopments(worldId: string, status?: DevelopmentStatus) {
  return prisma.development.findMany({
    where: {
      session: { worldId },
      ...(status ? { status } : {}),
    },
    include: {
      session: {
        include: {
          entity: { select: { id: true, slug: true, title: true, type: true, accent: true } },
        },
      },
      era: { select: { id: true, slug: true, title: true, color: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDevelopment(id: string) {
  return prisma.development.findUnique({
    where: { id },
    include: {
      session: {
        include: {
          entity: { select: { id: true, slug: true, title: true, type: true, accent: true, summary: true } },
          user: { select: { id: true, name: true } },
        },
      },
      era: { select: { id: true, slug: true, title: true, color: true } },
    },
  });
}

export async function getPendingDevelopmentCount(worldId: string) {
  return prisma.development.count({
    where: { session: { worldId }, status: 'PENDING' },
  });
}

export async function getCanonizedDevelopments(entityId: string) {
  return prisma.development.findMany({
    where: {
      session: { entityId },
      canonizedAt: { not: null },
    },
    include: {
      session: {
        include: {
          entity: { select: { id: true, slug: true, title: true, type: true, accent: true } },
        },
      },
      era: { select: { id: true, slug: true, title: true, color: true } },
    },
    orderBy: { canonizedAt: 'asc' },
  });
}

export async function getRecentWorldDevelopments(worldId: string, limit = 5) {
  return prisma.development.findMany({
    where: {
      session: { worldId },
      canonizedAt: { not: null },
    },
    include: {
      session: {
        include: {
          entity: { select: { id: true, slug: true, title: true, type: true, accent: true } },
        },
      },
      era: { select: { id: true, slug: true, title: true, color: true } },
    },
    orderBy: { canonizedAt: 'desc' },
    take: limit,
  });
}

export async function createDevelopment(data: {
  sessionId: string;
  type: DevelopmentType;
  title: string;
  content: string;
  dateLabel?: string;
  eraId?: string;
  proposedChangesJson?: string;
}) {
  return prisma.development.create({
    data: {
      sessionId: data.sessionId,
      type: data.type,
      title: data.title,
      content: data.content,
      dateLabel: data.dateLabel || '',
      eraId: data.eraId,
      proposedChangesJson: data.proposedChangesJson || '{}',
    },
  });
}

export async function updateDevelopment(
  id: string,
  data: Partial<{
    status: DevelopmentStatus;
    content: string;
    reviewNote: string;
    reviewedAt: Date;
    canonizedAt: Date;
  }>
) {
  return prisma.development.update({ where: { id }, data });
}

/* ──────────────────────── Placed Objects (World Building) ──────────────────────── */

export async function getPlacedObjects(worldId: string, zone?: string) {
  return prisma.placedObject.findMany({
    where: { worldId, ...(zone ? { zone } : {}) },
  });
}

export async function createPlacedObject(data: {
  worldId: string;
  zone: string;
  tileX: number;
  tileY: number;
  itemType: string;
  rotation?: number;
  placedBy: string;
}) {
  return prisma.placedObject.create({ data });
}

export async function deletePlacedObject(id: string) {
  return prisma.placedObject.delete({ where: { id } });
}

export async function updatePlacedObjectCollect(id: string) {
  return prisma.placedObject.update({
    where: { id },
    data: { lastCollectedAt: new Date() },
  });
}

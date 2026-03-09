import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDevelopment, updateDevelopment, createRelation, updateEntity, createEvent, createEventEntityLinks, logActivity, getWorldBySlug, getEvents } from '@/lib/queries';
import { slugify } from '@/lib/utils';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; developmentId: string }> }
) {
  const { developmentId } = await params;
  const development = await getDevelopment(developmentId);
  if (!development) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(development);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string; developmentId: string }> }
) {
  const auth = await getSession();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug, developmentId } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) return NextResponse.json({ error: 'World not found' }, { status: 404 });

  const body = await request.json();
  const { status, content, reviewNote } = body;

  const development = await getDevelopment(developmentId);
  if (!development) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = status;
  if (content !== undefined) updateData.content = content;
  if (reviewNote !== undefined) updateData.reviewNote = reviewNote;
  if (status === 'APPROVED' || status === 'REJECTED' || status === 'EDITED') {
    updateData.reviewedAt = new Date();
  }
  if (status === 'APPROVED' || status === 'EDITED') {
    updateData.canonizedAt = new Date();
  }

  const updated = await updateDevelopment(developmentId, updateData);

  // If approved, apply proposed changes
  if (status === 'APPROVED' || status === 'EDITED') {
    try {
      const proposed = JSON.parse(development.proposedChangesJson);
      const entityId = development.session.entity.id;

      // Create new relations with formedEraId from the development's era
      if (Array.isArray(proposed.newRelations)) {
        for (const rel of proposed.newRelations) {
          if (rel.toEntitySlug) {
            const { prisma } = await import('@/lib/prisma');
            const targetEntity = await prisma.entity.findFirst({
              where: { worldId: world.id, slug: rel.toEntitySlug },
            });
            if (targetEntity) {
              try {
                await prisma.entityRelation.create({
                  data: {
                    worldId: world.id,
                    fromEntityId: entityId,
                    toEntityId: targetEntity.id,
                    label: rel.label || 'related to',
                    formedEraId: development.eraId || undefined,
                  },
                });
              } catch {
                // Skip duplicates
              }
            }
          }
        }
      }

      // Apply new facts
      if (Array.isArray(proposed.newFacts)) {
        for (const fact of proposed.newFacts) {
          const targetSlug = fact.entitySlug || development.session.entity.slug;
          const { prisma } = await import('@/lib/prisma');
          const targetEntity = await prisma.entity.findFirst({
            where: { worldId: world.id, slug: targetSlug },
          });
          if (targetEntity) {
            const existingFacts = JSON.parse(targetEntity.factsJson || '[]');
            existingFacts.push({ label: fact.label, value: fact.value });
            await prisma.entity.update({
              where: { id: targetEntity.id },
              data: { factsJson: JSON.stringify(existingFacts) },
            });
          }
        }
      }

      // Apply new tags
      if (Array.isArray(proposed.newTags)) {
        for (const tagEntry of proposed.newTags) {
          const targetSlug = tagEntry.entitySlug || development.session.entity.slug;
          const { prisma } = await import('@/lib/prisma');
          const targetEntity = await prisma.entity.findFirst({
            where: { worldId: world.id, slug: targetSlug },
          });
          if (targetEntity) {
            const existingTags = JSON.parse(targetEntity.tagsJson || '[]');
            if (!existingTags.includes(tagEntry.tag)) {
              existingTags.push(tagEntry.tag);
              await prisma.entity.update({
                where: { id: targetEntity.id },
                data: { tagsJson: JSON.stringify(existingTags) },
              });
            }
          }
        }
      }
    } catch {
      // Non-fatal — development is still approved even if some changes fail
    }

    // Auto-create a timeline Event for MINOR_EVENT or ENCOUNTER developments
    if (development.type === 'MINOR_EVENT' || development.type === 'ENCOUNTER') {
      try {
        const existingEvents = await getEvents(world.id);
        const maxSortOrder = existingEvents.length > 0
          ? Math.max(...existingEvents.map((e) => e.sortOrder))
          : 0;

        const eraTitle = development.era?.title || 'Unknown Era';
        const event = await createEvent({
          worldId: world.id,
          title: development.title,
          dateLabel: development.dateLabel || '',
          era: eraTitle,
          eraId: development.eraId || undefined,
          summary: development.content.slice(0, 300),
          impact: `Generated from ${development.session.entity.title}'s ${development.type.toLowerCase().replace('_', ' ')}`,
          sortOrder: maxSortOrder + 1,
          linkedEntitySlugs: development.session.entity.slug,
          linkedEntityId: development.session.entity.id,
          source: 'development',
        });

        // Link the event to the character entity
        await createEventEntityLinks([{
          eventId: event.id,
          entityId: development.session.entity.id,
          role: 'protagonist',
        }]);
      } catch {
        // Non-fatal — event creation failure shouldn't block approval
      }
    }

    await logActivity(world.id, auth.sub, 'approved', `development "${development.title}" for ${development.session.entity.title}`);
  } else if (status === 'REJECTED') {
    await logActivity(world.id, auth.sub, 'rejected', `development "${development.title}" for ${development.session.entity.title}`);
  }

  return NextResponse.json(updated);
}

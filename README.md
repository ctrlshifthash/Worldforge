# Worldforge

A premium collaborative worldbuilding platform for writers, game masters, studios, and creative teams. Build fictional worlds with structured lore, relationship graphs, timelines, and real-time collaboration.

## Quick Start

```bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo credentials:** `demo@worldforge.app` / `worldforge`

## Features

- **Authentication** — JWT-based auth with registration, login, and session management
- **World Management** — Create, edit, and delete worlds with public/private visibility
- **Entity System** — Six entity types: Characters, Locations, Factions, Artifacts, Species, Events
- **Relationship Graph** — Interactive force-directed graph showing connections between entities
- **Timeline** — Chronological history view organized by eras
- **Activity Feed** — Track all actions across a world
- **Search** — Full-text search across entity names, descriptions, and tags
- **Collaborator Roles** — Owner, Editor, and Viewer permissions per world
- **Seeded Demo** — Everhold, a drowned empire rebuilt on floating citadels above a sentient sea

## Architecture

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/ & register/         # Auth pages
│   ├── dashboard/                  # World archive
│   ├── worlds/[slug]/             # World views
│   │   ├── page.tsx               # World overview
│   │   ├── entities/              # Entity CRUD
│   │   ├── graph/                 # Relationship graph
│   │   ├── timeline/              # Timeline view
│   │   └── activity/              # Activity feed
│   └── api/                       # REST API routes
├── lib/
│   ├── auth.ts                    # JWT session management
│   ├── prisma.ts                  # Database client
│   ├── queries.ts                 # Data access layer
│   └── utils.ts                   # Utilities
└── types/                         # Type declarations
```

## Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** SQLite via Prisma ORM
- **Auth:** Custom JWT (jose + bcryptjs)
- **Graph:** D3-force for physics simulation
- **Styling:** Custom CSS design system (no framework)

## Design Direction

The visual identity draws from cartographer's archives and astronomical charts — dark atmospheric backgrounds, antique gold accents, serif display typography (Playfair Display), and subtle depth through layered gradients and noise textures. Entity types are color-coded with distinct jewel tones. The design avoids generic dashboard aesthetics in favor of an immersive, editorial feel.

## Database

The Prisma schema includes: Users, Worlds, WorldMembers, Entities, EntityRelations, Events, and ActivityLogs. All data persists in a local SQLite file (`prisma/dev.db`).

To reset and re-seed: `npm run db:reset`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed with Everhold data |
| `npm run db:reset` | Reset and re-seed database |

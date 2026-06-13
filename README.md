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

## Play-to-Earn (Privy + Solana)

Token holders earn **real SOL** for completing quests; non-holders earn in-game coins.
Earnings accrue server-side and are withdrawn from `/dashboard/earnings`.

- **Design & economics:** [docs/play-to-earn.md](docs/play-to-earn.md). In-app docs at `/docs`.
- **Tune everything** (per-quest rewards, holder tiers/multipliers, claim limits, daily pool,
  anti-farm rules) in [src/lib/payouts/config.ts](src/lib/payouts/config.ts).
- **Auth:** Privy (wallet + email → Solana embedded wallet). The "Connect Wallet" button is in
  the navbar; login bridges to the existing session via `/api/auth/privy`.
- **Safety:** quests pay once per account, 4 claims/day ≥6h apart, a global daily SOL pool cap,
  account-age + velocity anti-farm gates, and a live token-holding re-check at claim time.

Leave `PAYOUTS_ENABLED=false` to run the payout engine in **stub mode** (no SOL moves);
set `STUB_TOKEN_BALANCE` to simulate a holder locally.

## Deploy to Railway

1. Push this repo to GitHub.
2. Railway → **New Project → Deploy from GitHub repo** → select this repo.
3. Add the environment variables from [.env.example](.env.example) in the service **Variables**
   tab (at minimum `DATABASE_URL`, `JWT_SECRET`, the Privy keys, and `HELIUS_RPC_URL`).
4. Railway builds with Nixpacks (Node 20 — see [nixpacks.toml](nixpacks.toml)). The build command
   `npm run build` runs `prisma generate` + `prisma db push`, so the schema syncs on each deploy.
5. Railway provides `PORT`; `next start` binds to it automatically.

Build/start commands are pinned in [railway.json](railway.json).

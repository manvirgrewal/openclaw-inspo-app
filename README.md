# OpenClaw Inspo

Discover, save, and share AI agent automation ideas.

A community-driven platform where users browse actionable prompts and workflows for AI agents — copy a prompt, paste it into your agent, and it just works. Think Product Hunt meets Reddit for AI automation.

## Features

- **Feed** — Infinite scroll of idea cards, filterable by category and complexity
- **Copy Prompt** — One tap to copy a battle-tested prompt to your clipboard
- **Stacks** — Curated bundles of ideas that work together (e.g. "The Morning Autopilot")
- **Search** — Full-text search across all ideas
- **User Profiles** — Showcase your builds, setups, and contributed ideas
- **Submit Ideas** — Guided form with live card preview
- **Mobile-First** — Designed for phones first, enhanced for desktop
- **PWA** — Add to home screen for a native app feel
- **Dark Mode** — Default and only mode. We live in terminals.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + Radix UI |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| State | Zustand + TanStack Query |
| Validation | Zod |
| Icons | Lucide React |
| Hosting | Vercel (planned) |

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for Supabase local)

### Setup

```bash
git clone https://github.com/manvirgrewal/openclaw-inspo-app.git
cd openclaw-inspo-app
npm install
cp .env.example .env.local
```

### Development

```bash
npm run dev          # Starts on http://localhost:3005
```

### Supabase (local)

```bash
npx supabase start  # Starts local Supabase (needs Docker)
# Then update .env.local with the local Supabase URL + keys
```

The database migration is at `supabase/migrations/00001_initial_schema.sql`.

### Build

```bash
npm run build
npm start            # Production server
```

## Project Structure

```
src/
├── app/              # Routes (pages + API)
│   ├── api/          # API endpoints (ideas, search, events, etc.)
│   ├── auth/         # Login, callback, onboarding
│   ├── idea/[slug]/  # Idea detail page
│   ├── stacks/       # Stack listing + detail
│   ├── user/[username]/ # User profiles
│   ├── search/       # Search page
│   └── submit/       # Submit idea form
├── modules/          # Domain logic (ideas, stacks, social, users, etc.)
├── components/       # UI components (cards, feed, navigation, profile)
├── lib/              # Infrastructure (supabase, utils)
├── hooks/            # Custom React hooks
└── config/           # Categories, constants, feature flags
```

## Ports

| Service | Port |
|---|---|
| OpenClaw Inspo App | 3005 |
| Supabase (local) | 54321 (default) |

## Status

**Pre-alpha** — Core scaffold complete with seed data. Supabase integration pending.

See [DEVLOG.md](./DEVLOG.md) for detailed progress.

## License

TBD

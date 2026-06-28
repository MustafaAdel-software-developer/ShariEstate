# ShariEstate

Multi-state real estate platform built with Next.js, NestJS, and PostgreSQL.

## Stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS
- **Backend:** NestJS, Prisma, PostgreSQL
- **Cache:** Redis
- **Search:** PostgreSQL FTS + Meilisearch (optional)

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm
- **PostgreSQL** — Docker *or* a local install (PostgreSQL 17 is fine on Windows)

### Setup

**Option A — Docker** (PostgreSQL + Redis + Meilisearch):

```bash
docker compose up -d
```

**Option B — No Docker** (local PostgreSQL only):

See **[docs/SETUP-WITHOUT-DOCKER.md](docs/SETUP-WITHOUT-DOCKER.md)** or run:

```powershell
.\scripts\setup-local.ps1
```

Then:

```bash
# Install dependencies
pnpm install

# Run migrations and seed (skip if setup-local.ps1 already ran them)
pnpm db:push
pnpm db:seed

# Start dev servers (web + api)
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:3001/api/v1
- Swagger: http://localhost:3001/api/docs

### Demo Accounts

Password for all: `Password123!`

| Email | Role |
|-------|------|
| admin@realestate.com | Admin |
| sarah.johnson@realestate.com | Agent |
| buyer@example.com | Buyer |

## Project Structure

```
apps/web/       Next.js frontend
apps/api/       NestJS API + Prisma
packages/shared Shared Zod schemas and types
```

## Features

- State-scoped search and browse (California launch state)
- Map + list split view
- Listing detail with inquiry and tour scheduling
- Agent profiles and listing management
- Admin approval workflow
- Favorites, saved searches, messaging
- Featured listings (Stripe optional)
- Multi-state rollout ready (49 states seeded, disabled)

## Deploy (free tier)

See **[docs/DEPLOY.md](docs/DEPLOY.md)** for step-by-step deployment to **Vercel + Render + Neon**.

Quick prep:

```powershell
.\scripts\deploy-prep.ps1
```

# BetterUptime

BetterUptime is a full stack uptime monitoring system built to scale. It lets users register websites, continuously checks their health, and shows real time status and latency in a clean dashboard.

This repo is a Bun powered monorepo using Turbo, with services for API, scheduling, workers, and a Next.js front end.

## What this solves

Traditional monitoring apps often collapse when you add more checks or regions. BetterUptime is designed around a queue and worker model, so it can scale horizontally without slowing the API or the dashboard.

<img width="1760" height="1064" alt="Screenshot 2026-04-26 001223" src="https://github.com/user-attachments/assets/933621d2-7640-44b1-96ea-c6191028b2c0" />

<img width="2559" height="1421" alt="Screenshot 2026-04-26 210824" src="https://github.com/user-attachments/assets/8224e5a6-4dfd-4a2c-aff5-92cb783ccba8" />

<img width="2559" height="1415" alt="Screenshot 2026-04-26 210803" src="https://github.com/user-attachments/assets/fa269687-eca2-4884-9a92-68b0f7dc563e" />

## Key features

- JWT authentication for secure access
- Add websites and view status history
- Latency tracking in milliseconds
- Region aware health checks
- Redis Streams queue for scale and back pressure
- Acknowledgement based processing to avoid lost tasks

## Architecture at a glance

```
User -> Frontend -> API -> Postgres
										|
										v
							 Scheduler (Pusher)
										|
										v
							 Redis Streams Queue
										|
										v
								 Workers -> Postgres
```

## Services and packages

Apps:

- api: Express API for auth, websites, and status queries
- fe/my-app: Next.js front end
- pusher: scheduler that pushes websites into the queue
- worker: workers that consume queue tasks and run checks

Packages:

- @repo/db: Prisma client and database adapter
- @repo/redis: Redis Streams client helpers
- @repo/eslint-config, @repo/typescript-config: shared tooling

## Data model

- User: authentication identity
- Website: URL and owner
- Region: logical region for checks
- WebsiteTicks: one record per check
- WebsiteStatus enum: Up, Down, Unknown

## Queue and worker flow

1. The scheduler reads all websites from Postgres.
2. It pushes each URL to the Redis stream (betteruptime:website).
3. Workers read from a Redis Streams consumer group.
4. Each worker checks the URL and writes a WebsiteTicks row.
5. The worker acknowledges the task only after it is processed.

This acknowledgement step is critical for reliability. If a worker crashes, unacked tasks remain pending and can be claimed again.

## Scalability and reliability

- Decoupled API: user traffic never blocks on health checks
- Back pressure: Redis streams buffer spikes in traffic
- Horizontal scaling: add workers without changing the API
- Region scalability: run workers in multiple regions
- Task acknowledgement: checks are only marked complete after success

## Getting started

### Requirements

- Bun 1.3.1 (recommended, repo uses Bun workspaces)
- Node 18+ for tooling compatibility
- Postgres database
- Redis server

### Install

```sh
bun install
```

### Environment variables

Create a .env file in each service folder or export variables when running.

API (apps/api):

```
DATABASE_URL=postgres://user:password@localhost:5432/postgres
JWT_SECRET=change-me
PORT=3000
```

Pusher (apps/pusher):

```
DATABASE_URL=postgres://user:password@localhost:5432/postgres
```

Worker (apps/worker):

```
DATABASE_URL=postgres://user:password@localhost:5432/postgres
REGION_ID=us-east-1
WORKER_ID=worker-1
```

Frontend (apps/fe/my-app):

```
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

Redis is expected at the default connection settings. If you need a custom URL, update the Redis client in packages/redis-streams.

### Database setup

Prisma migrations live in packages/db/prisma/migrations. After setting DATABASE_URL:

```sh
cd packages/db
bunx prisma migrate dev
```

You also need Region records for any REGION_ID values your workers use. Insert them in Postgres before starting workers.

### Redis setup

Create a consumer group per region (group name must match REGION_ID):

```sh
redis-cli XGROUP CREATE betteruptime:website us-east-1 $ MKSTREAM
```

### Run locally

Start the API:

```sh
cd apps/api
bun run dev
```

Start the scheduler:

```sh
cd apps/pusher
bun run index.ts
```

Start a worker:

```sh
cd apps/worker
bun run index.ts
```

Start the front end:

```sh
cd apps/fe/my-app
bun run dev
```

Note: the API and Next.js default to port 3000. Run one of them on a different port (use PORT for the API or -p for Next) and set NEXT_PUBLIC_API_BASE accordingly.

## API endpoints

All protected endpoints require Authorization: Bearer <token>.

- POST /api/v1/signup
- POST /api/v1/signin
- POST /api/v1/website
- GET /api/v1/websites
- GET /api/v1/status/:websiteId

## Front end flow

- Sign in or sign up to get a JWT token stored in localStorage
- Add websites in the dashboard
- View status ticks and latency history per website

## Project structure

```
apps/
	api/
	fe/my-app/
	pusher/
	worker/
packages/
	db/
	redis-streams/
	eslint-config/
	typescript-config/
```

## Common scripts

From the repo root:

```sh
bun run dev
bun run build
bun run lint
```

Use Turbo filters to target a single app when needed.

## Reliability notes

- Worker acknowledgement ensures tasks are only marked done after successful processing.
- Redis Streams keeps pending tasks for retry when a worker fails.
- Region awareness makes multi region monitoring straightforward.

## Roadmap ideas

- Alerts and notifications
- SLA and reporting dashboards
- Configurable check intervals
- Multi user teams and roles

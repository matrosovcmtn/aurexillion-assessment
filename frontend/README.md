# Support Ticket Dashboard — Frontend

React + TypeScript SPA for viewing, filtering, creating, and updating support tickets. Talks to the backend only through the HTTP contract in `API_CONTRACT.md`.

## Technologies

- React 19 + TypeScript
- Vite+ (Vite, Oxlint, Oxfmt, Vitest)
- React Router
- TanStack Query
- React Hook Form + Zod
- Tailwind CSS + shadcn/ui (Base UI)
- `@dnd-kit` for the Kanban board
- nginx multi-stage Docker image for production

## Installation

Requires Node.js and pnpm 11+.

```bash
pnpm install
cp .env.example .env
```

`.env` for local development:

```text
VITE_API_URL=http://localhost:8080
```

Leave `VITE_API_URL` empty for production builds so the SPA calls same-origin `/api/...` (proxied by nginx).

## Running locally

Start the backend API on `http://localhost:8080` first (see the backend README / root compose `db` + `backend`).

Then:

```bash
pnpm dev
```

Open `http://localhost:5173`.

Production-style local preview of the built assets:

```bash
pnpm build
pnpm preview
```

## Database / seed data

Owned by the backend. This frontend does not talk to Postgres directly. Against a fresh backend boot you should see the seeded sample tickets from `GET /api/tickets`.

## Running with Docker Compose

From the monorepo root (sibling of this folder):

```bash
docker compose up --build
```

The `frontend` service builds this app with an empty `VITE_API_URL`, serves it through nginx on `http://localhost:3000`, and proxies `/api` to `backend:8080`.

## Tests

```bash
pnpm test
```

Coverage focuses on:

- create-ticket schema and form validation
- settings form schemas (statuses, tags, assignees, prefix)
- list/board URL params (filters, sort, page size)
- ticket table rendering and status-select update wiring
- deadline formatting helpers

Useful checks:

```bash
pnpm typecheck
pnpm check
pnpm build
```

## App routes

| Route / query            | Purpose                                           |
| ------------------------ | ------------------------------------------------- |
| `/?view=list`            | Ticket list with server filters, sort, pagination |
| `/?view=board`           | Kanban board (drag card to change status)         |
| `/?view=list&ticket=:id` | Same workspace with ticket details sheet open     |
| `/tickets/:id`           | Deep link → redirects into `?ticket=:id` sheet    |
| `/tickets/new`           | Opens the create dialog/drawer                    |
| `/settings`              | Overview + statuses / tags / assignees / general  |

Workspace query params (list): `statusId`, `priority`, `assigneeIds`, `tagIds`, `q`, `code`, `sort`, `page`, `size`. Board hides the status filter; other filters still apply.

Create ticket is a dialog on desktop and a drawer on mobile — not a dedicated page UI.

## Assumptions and trade-offs

- Status and field updates wait for the server response (no optimistic persistence). The board may preview a move, then revert if the PATCH fails.
- List and board share one TanStack Query dataset and the same status-update mutation.
- Within-column card order is not persisted — the API has no position field.
- List paging/sort/search/filters are server-side via Spring `Page` query params.
- Ticket details edit happens in the sheet (`?ticket=:id`); list/board open the sheet on row/card click.
- Purple `--primary` is used for primary CTAs only; the rest of the UI stays neutral.

## What I would improve with more time

- Broader component tests around board drag failure/revert
- Stronger empty-column keyboard DnD polish and live-region announcements
- Settings CRUD interaction tests beyond schema validation
- Tighter mobile board density after more real-device feedback

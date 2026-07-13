# ARCHITECTURE.md — Support Ticket Dashboard

Design and system overview. Written for a human reader (and future me at a review). Two decoupled parts joined by an HTTP contract; deployed on a single VPS.

## 1. Components
- **Frontend** — React + Vite + TypeScript SPA. Talks to the backend only over the documented REST contract (`API_CONTRACT.md`). Built to static assets for production.
- **Backend** — Java 21 + Spring Boot 3 REST API. Layered: controller → service → repository. Owns validation, business rules, error handling, persistence.
- **Database** — PostgreSQL 16, run in Docker (Compose), with a persistent named volume.

```
        ┌──────────────┐      HTTPS       ┌───────────────────────────┐
 Browser│  React SPA   │ ───────────────▶ │  nginx (reverse proxy,TLS)│
        │ (static JS)  │                  └───────────┬───────────────┘
        └──────────────┘                    /            \
                                    static assets       /api/*
                                    (SPA files)           │
                                                          ▼
                                              ┌───────────────────────┐
                                              │  Spring Boot API :8080 │
                                              │  controller→service→repo│
                                              └───────────┬────────────┘
                                                          │ JDBC
                                                          ▼
                                              ┌───────────────────────┐
                                              │  PostgreSQL (Docker)   │
                                              │  volume: pgdata        │
                                              └───────────────────────┘
```

## 2. Request flow (example: change ticket status)
1. User picks a new status in the SPA → `PATCH /api/tickets/{id}` with `{ "statusId": 2 }`.
2. nginx routes `/api/*` to the Spring Boot app.
3. Controller validates the body (Bean Validation) → Service loads the ticket (404 if absent), resolves and validates the target `TicketStatus` (must exist and be active, unless it's already the ticket's current status), applies the change → Repository persists it in Postgres.
4. Service returns the updated `TicketResponse` (with the embedded status object) → `200`. SPA reflects the saved value and shows success feedback. A page reload re-fetches from the DB, so the change is durable.

## 3. Data model
Five tables, `tickets` at the center with a status/tag/assignee dictionary around it:

**`statuses`** (formerly a fixed enum — now a configurable dictionary so the wire contract can add/reorder/deactivate statuses without a schema change):

| column | type | notes |
|---|---|---|
| id | bigserial PK | |
| name | text not null unique | |
| color | varchar(7) not null | `#RRGGBB` |
| position | int not null | display order |
| initial | boolean not null | exactly one `true`; used when create omits `statusId` |
| active | boolean not null default true | soft-deactivate; hidden from pickers, kept on historical tickets |

**`tags`**: `id`, `name` (unique). **`assignees`**: `id`, `name`, `email` (unique), `department`, `position` (nullable). **`app_settings`**: single row, `ticket_code_prefix`, `next_ticket_number` (drives `code` generation, `{prefix}-{seq}`).

**`tickets`**:

| column | type | notes |
|---|---|---|
| id | bigserial PK | |
| code | text not null unique | server-generated, not client-editable |
| title | text not null | |
| description | text not null | |
| customer_name | text not null | |
| customer_email | text not null | validated as email at the API |
| status_id | FK → statuses, not null | replaces the old `status` enum column |
| priority | text not null | `low` \| `medium` \| `high` — stayed an enum, the brief fixes it to three values |
| deadline | timestamptz nullable | |
| assignee_id | FK → assignees, nullable | |
| created_at | timestamptz not null default now() | |

Plus a `ticket_tags` join table (`ticket_id`, `tag_id`) for the many-to-many with `tags`.

Priority stays a Java/Postgres enum stored as text; status moved to its own table because the contract treats it as a manageable resource (`/api/statuses`), not a closed set of three values.

## 4. API
See `API_CONTRACT.md` for the exact contract. REST, JSON, plural resource nouns, standard status codes, consistent error shape. The current-user concept is out of scope (no auth in the core requirements).

## 5. Backend layering & decisions
- **Controller** — thin: HTTP concerns, DTO in/out, status codes. One per resource: tickets, statuses, tags, assignees, settings.
- **Service** — business rules: resolve the initial status on create, validate `statusId`/`assigneeId`/`tagIds` references, generate ticket `code` from settings, apply updates, filtering/paging/sorting.
- **Repository** — Spring Data JPA; `TicketSpecifications` builds the dynamic filter predicates (status, priority, tags, assignees, search, code) for the paginated list query.
- **DTOs** separate from the entities so the wire format is stable and the entities can evolve.
- **GlobalExceptionHandler** centralizes error → JSON mapping (validation → 400, not-found → 404, conflict → 409 for in-use statuses/assignees).
- **Schema**: Hibernate `ddl-auto: update` for the assessment; Flyway migrations would be the production choice (documented as a "would improve").

## 6. Deployment — one command, everywhere (`docker compose up`)
The entire system is a single Docker Compose stack. The same `docker-compose.yml` runs on a reviewer's laptop and on the VPS — no divergence.

Three services on one network:
- **db** — `postgres:16-alpine`, named volume `pgdata`, healthcheck (`pg_isready`). Never published publicly; only reachable inside the Compose network.
- **backend** — multi-stage Dockerfile (Maven build → slim JRE), `depends_on: db` (waits for healthy), DB creds from env, listens on internal `:8080`, seeds on first boot.
- **frontend** — multi-stage Dockerfile (Node build → **nginx**). nginx serves the built SPA and **reverse-proxies `/api` → `backend:8080`**. This is the single public entrypoint.

The compose file is written once and grown incrementally, never duplicated per track: the backend track adds `db` + `backend` (during the backend build), the frontend track adds `frontend` on top of that same file at integration. No separate `docker-compose.yml` lives inside `backend/` or `frontend/`.

Env vars: `db` consumes `POSTGRES_DB/POSTGRES_USER/POSTGRES_PASSWORD` (image-native names); `backend` consumes `DATABASE_URL/DB_USER/DB_PASSWORD` (Spring datasource, needs the full JDBC URL). Same underlying values, two naming conventions — both listed in the root `.env.example`.

```
docker compose up
        │
   ┌────▼─────────────────────────────────────────┐
   │ frontend (nginx)   host :3000 → :80           │
   │   /        → SPA static files (built dist)     │
   │   /api/*   → proxy ─────────────┐              │
   └─────────────────────────────────┼─────────────┘
                                      ▼
                     ┌────────────────────────────┐
                     │ backend (Spring Boot :8080) │
                     └───────────────┬─────────────┘
                                     │ JDBC
                                     ▼
                     ┌────────────────────────────┐
                     │ db (postgres:16-alpine, vol pgdata)│
                     └────────────────────────────┘
```

- **Reviewer:** `docker compose up` → open `http://localhost:3000` → seeded, fully working. Nothing else to install (no local Java/Node needed).
- **Same-origin:** SPA and API share the nginx origin, so **CORS is a non-issue** in this setup; the backend's CORS config exists only for running the frontend standalone on `:5173` during development.
- **Dev mode still works per track:** run `./mvnw spring-boot:run` and `npm run dev` individually for fast iteration. Compose is the one-command path for review and prod.
- **VPS:** clone → set the VPS `.env` (DB creds) → `docker compose up -d`. Add a TLS terminator in front (host nginx or Caddy / Let's Encrypt) pointing at the published frontend port, or add certs to the frontend nginx. Secrets live only in the VPS `.env`; the repo ships `.env.example` with placeholders.
- **Backups:** `pg_dump` on a cron against the db service; volume snapshots optional.

## 6a. Backend tests & Docker
`docker compose up` runs the application. The backend's automated tests use **Testcontainers**, which spins up a throwaway Postgres — so `./mvnw test` needs Docker available but does **not** need the compose stack running. Documented in the README.

## 7. Key trade-offs
- **Postgres + Docker over SQLite** — the brief accepts SQLite, but Postgres matches the VPS deployment (local/prod parity), is production-minded, and is a strength I can defend. Cost: reviewers need Docker to run it and the tests (Testcontainers). Documented in the README.
- **Full FE/BE separation** — two independently runnable, testable parts joined only by the HTTP contract. Slightly more setup than a single Next.js app, but cleaner ownership, independent deployment, and it mirrors how the two roles actually work.
- **Status as a dictionary entity, not an enum** — the brief only asks for three fixed statuses, but modeling `statuses` as a table (with color/position/active) makes the board configurable and matches how a real support tool evolves; the trade-off is a bit more code (a full CRUD resource) for something the assessment itself doesn't require.
- **ddl-auto over migrations** — faster for an 8-hour build; Flyway is the production path (listed as a future improvement).
- **No auth** — not in the core requirements; kept out to respect scope.

## 8. What I'd add with more time
Flyway migrations · auth + per-user tickets · optimistic concurrency on status updates · richer observability (structured logs, metrics, health checks) · CI (GitHub Actions) running both test suites · containerize the backend in the same Compose file for one-command prod.

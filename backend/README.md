# Backend — Support Ticket Dashboard API

REST API for the ticket dashboard. Java 21, Spring Boot 3, PostgreSQL. Implements `../API_CONTRACT.md`.

## Technologies

- Java 21, Spring Boot 3.5 (web, data-jpa, validation)
- PostgreSQL 16
- Maven (wrapper included, no local install needed)
- Lombok, to cut constructor/getter boilerplate on the entities and the constructor-injected beans
- JUnit 5, MockMvc, Testcontainers (Postgres)

## Install

No dependency install step beyond Maven pulling artifacts on first build — `./mvnw` handles that.

## Run

**Full stack (from repo root):**
```
docker compose up db backend
```
Boots Postgres and the API together; the API seeds on first start. Runs on the internal Docker network at `backend:8080` (not published to the host on its own — the frontend's nginx is the public entrypoint once that track is wired in).

**Standalone, for local development:**
```
docker compose up -d db
./mvnw spring-boot:run
```
The `db` service publishes `5432` to `127.0.0.1` for this workflow. The API is then reachable at `http://localhost:8080/api/tickets`. CORS allows the Vite dev origin (`http://localhost:5173`).

## Database / seed data

Schema is created by Hibernate (`ddl-auto: update`) on first boot — no manual migration step. `DataSeeder` (a `CommandLineRunner`) fills statuses, tags, assignees, settings, and sample tickets when the tickets table is empty, so a fresh database always has data to look at.

Connection settings come from env vars, with local-dev defaults baked into `application.yml`: `DATABASE_URL`, `DB_USER`, `DB_PASSWORD`. See `../.env.example`.

## Tests

```
./mvnw test
```
Docker must be running — the test suite spins up a throwaway `postgres:16-alpine` container via Testcontainers rather than mocking the database, so persistence is actually exercised.

## Contract surface

- Tickets: list (paginated + filters/sort), create, get, partial update via `PATCH`
- Statuses / tags / assignees: CRUD
- Settings: ticket code prefix
- Statuses are configurable entities, not a fixed enum on the wire — see `../API_CONTRACT.md`

## Assumptions / trade-offs

- Statuses moved from a fixed enum to a `TicketStatus` entity so they're configurable per the contract; priority stayed an enum since the brief fixes it to three values.
- Tag / assignee list filters are OR matches within the field, AND across fields — see `../API_CONTRACT.md`.
- Statuses are soft-deactivated (`active=false`) rather than hard-deleted while tickets still reference them, to avoid orphaning existing tickets.
- Postgres port is published to `127.0.0.1` only, not left fully unpublished — needed so `./mvnw spring-boot:run` can reach it during local dev without exposing it beyond the host itself.
- `ddl-auto: update` instead of Flyway — faster for this scope; would move to migrations for anything longer-lived.

## What I'd improve with more time

Flyway migrations, optimistic concurrency on updates, structured logging/metrics.

# Support Ticket Dashboard

A small dashboard for viewing, creating, and updating customer support tickets. Split into two independent parts that talk only over a documented REST contract.

- `backend/` — Java 21 + Spring Boot API, PostgreSQL persistence. See `backend/README.md`.
- `frontend/` — React + TypeScript SPA. See `frontend/README.md`.

## Running everything

```
docker compose up --build
```
Brings up Postgres, the API, and the SPA behind nginx. Open `http://localhost:3000` — seeded data, no local Java/Node required.

Each side also runs standalone for development — see `backend/README.md` and `frontend/README.md`.

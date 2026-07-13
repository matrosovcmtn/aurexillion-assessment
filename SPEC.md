# SPEC.md — exact requirements (distilled from the brief)

> Source of truth for *what* to build. If anything here conflicts with a shortcut, follow this file. Tick every core box before optional work.

## Objective
A support ticket dashboard where users can **view, create, and update** customer support tickets. Working frontend + backend API + persistent DB.

## Deliverables
- [ ] Working frontend connected to backend API
- [ ] Backend service with persistent DB storage
- [ ] ≥ 2 meaningful automated tests
- [ ] Clear README with setup/run instructions
- [ ] Public GitHub repository with the complete solution

## Core functional requirements (all required)
1. **Ticket List** — display all tickets (list/table) showing: title, customer name, status, priority, created date.
   - Statuses: `Open`, `In Progress`, `Resolved`. Priorities: `Low`, `Medium`, `High`.
2. **Create a Ticket** — form with: title, description, customer name, customer email, priority. New ticket starts `Open`. Validate required fields before submit.
3. **Update Ticket Status** — change status from list or details; save to DB; show clear success/error feedback. Must use an accessible control (select / action menu / status button) and reflect the saved value.
4. **Ticket Details** — dedicated single-ticket view: full description, customer info, priority, status, created date.
5. **Filtering** — at least one filter (status OR priority). Both welcome, not required.

## Backend & data
- REST endpoints (suggested): `GET /api/tickets`, `GET /api/tickets/:id`, `POST /api/tickets`, `PATCH /api/tickets/:id`.
- Validate incoming data; return useful HTTP status codes; handle invalid input + missing ticket; JSON responses; persist to DB.
- Keep routing / business logic / data access reasonably organized.
- Example object shape:
  ```json
  { "id": 1, "title": "...", "description": "...", "customerName": "Jane Smith",
    "customerEmail": "jane@example.com", "status": "open", "priority": "high",
    "createdAt": "2026-06-18T10:30:00Z" }
  ```
- **Persistence:** reloading must NOT reset a status update.

## Frontend & testing
- Retrieve data from API; show loading / empty / success / error states.
- Validate required fields + email format; feedback after create/update.
- Use TypeScript meaningfully (no blanket `any`).
- Components understandable and separated; main flows work desktop + mobile.
- Design: simple, clean, usable, sensible hierarchy — NOT a polished design system.
- ≥ 2 meaningful tests (backend and/or frontend).

## README must contain (all 7)
1. Technologies used
2. Installation instructions
3. How to run frontend and backend
4. How to set up the database / seed sample data
5. How to run the automated tests
6. Assumptions and technical trade-offs
7. What you would improve with more time

## Submission
- [ ] Public GitHub repo link to hiring@aurexillion.com
- [ ] Repo opens without access permission
- [ ] Complete README with clear setup
- [ ] `.env.example` if env vars are used
- [ ] No API keys/passwords/tokens/secrets committed
- [ ] Deployed link only if you deploy (optional)
- Email subject: **Full-Stack Assessment - Danil Matrosov**; include a short note on any unfinished work / key trade-offs.

## Optional (ONLY after all core is done)
Kanban drag-and-drop status board (persist on refresh) · search by title/customer · pagination/sorting · Docker Compose · Swagger/OpenAPI · more tests · a11y · WebSocket live updates.
> These do NOT compensate for missing core work.

## How they review (optimize for these)
Core functionality & persistence · clean React/TS structure + good form handling + reliable API integration · sensible API design/validation/status codes/error handling/organization · appropriate DB schema · readable code + separation of concerns + limited complexity · ≥2 useful tests · clear UX states/feedback/responsive · easy to install/run/test/understand.

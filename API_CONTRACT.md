# API_CONTRACT.md — the seam between backend and frontend

> **Single source of truth for BOTH sides.** Backend implements it; frontend consumes it. Change this file first when the API evolves, then both sides.

## Base

- Backend base URL: `http://localhost:8080`
- Frontend reads origin from `VITE_API_URL` (default `http://localhost:8080`). Paths always start with `/api/...`.
- All responses are JSON. Backend enables **CORS** for `http://localhost:5173`.

---

## Enums and shared primitives

### Priority (unchanged wire enum)

`priority` ∈ `"low" | "medium" | "high"` (responses lowercase; requests case-insensitive).

UI labels: Low / Medium / High.

### Colors

Status colors are hex strings `#RRGGBB` (e.g. `#0ea5e9`).

### Timestamps

- `createdAt`, `deadline` — ISO-8601 UTC instants, e.g. `"2026-06-18T10:30:00Z"`.
- `deadline` is optional on tickets.

---

## Ticket object (response)

```json
{
  "id": 1,
  "code": "ut-1021",
  "title": "Unable to complete payment",
  "description": "Customer receives an error after submitting the payment form.",
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "status": {
    "id": 1,
    "name": "Open",
    "color": "#0ea5e9",
    "position": 0,
    "isInitial": true,
    "active": true
  },
  "priority": "high",
  "deadline": "2026-07-01T17:00:00Z",
  "assignee": {
    "id": 1,
    "name": "Anna Um",
    "email": "anna@example.com",
    "department": "Support",
    "position": "Support Agent"
  },
  "tags": [{ "id": 1, "name": "frontend" }],
  "createdAt": "2026-06-18T10:30:00Z"
}
```

- `code` — unique public identifier, auto-generated as `{prefix}-{seq}`; not client-editable.
- `status` — embedded status object (not a bare enum string).
- `assignee` — nullable.
- `tags` — zero or more; order not significant.
- `deadline` — nullable datetime.

---

## Status object

```json
{
  "id": 1,
  "name": "Open",
  "color": "#0ea5e9",
  "position": 0,
  "isInitial": true,
  "active": true
}
```

- Exactly one status should have `isInitial: true` (used when create does not pass `statusId`).
- `active: false` — soft-deactivated; hidden from pickers; still returned on tickets that reference it.
- Hard delete returns `409` if any ticket still references the status.

Default seed:

| name                 | color     | isInitial |
| -------------------- | --------- | --------- |
| Open                 | `#0ea5e9` | true      |
| Pending              | `#94a3b8` | false     |
| In Progress          | `#f59e0b` | false     |
| Waiting on Customer  | `#a855f7` | false     |
| Escalated            | `#ef4444` | false     |
| On Hold              | `#64748b` | false     |
| Resolved             | `#10b981` | false     |
| Closed               | `#334155` | false     |

---

## Tag object

```json
{ "id": 1, "name": "frontend" }
```

No color field. Names unique (case-insensitive).

---

## Assignee object

```json
{
  "id": 1,
  "name": "Anna Um",
  "email": "anna@example.com",
  "department": "Support",
  "position": "Support Agent"
}
```

- `position` optional (free text; no dictionary entity).
- `email` unique (case-insensitive).

---

## Settings object

```json
{
  "ticketCodePrefix": "ut"
}
```

Used when generating ticket codes: `{prefix}-{seq}` (seq increments globally).

---

## Endpoints

### Tickets

| Method | Path                | Body     | Success                     | Errors               |
| ------ | ------------------- | -------- | ---------------------------- | --------------------- |
| GET    | `/api/tickets`      | —        | `200` Spring `Page<Ticket>` | `400` invalid params |
| GET    | `/api/tickets/{id}` | —        | `200` `Ticket`              | `404`                |
| POST   | `/api/tickets`      | Create ↓ | `201` `Ticket`              | `400`                |
| PATCH  | `/api/tickets/{id}` | Patch ↓  | `200` `Ticket`              | `400`, `404`         |
| DELETE | `/api/tickets/{id}` | —        | `204`                       | `404`                |

#### GET `/api/tickets` query params

| Param      | Default          | Notes                                                                 |
| ---------- | ---------------- | --------------------------------------------------------------------- |
| `page`     | `0`              | 0-based                                                               |
| `size`     | `20`             | max `100`                                                             |
| `sort`     | `createdAt,desc` | allowed fields: `createdAt`, `deadline`; direction `asc` \| `desc`    |
| `q`        | —                | case-insensitive search in **title + description**                    |
| `statusId` | —                | filter by status id                                                   |
| `priority` | —                | comma-separated `low` \| `medium` \| `high` (OR match)                |
| `tagIds`   | —                | comma-separated ids; ticket matches if it has **any** listed tag (OR) |
| `assigneeIds` | — | comma-separated ids; ticket matches if assignee is in the set (OR) |
| `code` | — | case-insensitive **contains** on ticket code |

Example Page JSON (Spring Data):

```json
{
  "content": [
    /* Ticket[] */
  ],
  "totalElements": 42,
  "totalPages": 3,
  "size": 20,
  "number": 0,
  "first": true,
  "last": false,
  "empty": false
}
```

#### POST create body

```json
{
  "title": "...",
  "description": "...",
  "customerName": "...",
  "customerEmail": "...",
  "priority": "high",
  "deadline": "2026-07-01T17:00:00Z",
  "assigneeId": 1,
  "tagIds": [1, 2]
}
```

- A new ticket always gets the status with `isInitial: true` — there is no `statusId` field on create, and the server ignores one if sent. Set the status afterward with `PATCH`.
- `deadline`, `assigneeId`, `tagIds` optional.
- Server generates `code`; ignores client-sent `code` / `status` objects.
- Do not send bare status enum strings.

#### PATCH body (partial)

All fields optional; omitted fields unchanged. At least one field should be present.

```json
{
  "statusId": 2,
  "priority": "medium",
  "deadline": "2026-07-01T17:00:00Z",
  "assigneeId": 1,
  "tagIds": [1, 3]
}
```

- `assigneeId: null` clears assignee.
- `deadline: null` clears deadline.
- `tagIds` replaces the full tag set when present (use `[]` to clear).
- `code` is never patchable.

#### DELETE

Hard delete — no soft-delete/undo. Meant for cleaning up a ticket created by mistake, not as a workflow status.

---

### Statuses

| Method | Path                        | Success                                  | Errors                 |
| ------ | --------------------------- | ----------------------------------------- | ----------------------- |
| GET    | `/api/statuses`             | `200` `Status[]` (ordered by `position`) | —                      |
| GET    | `/api/statuses?active=true` | active only                              | —                      |
| GET    | `/api/statuses/{id}`        | `200`                                    | `404`                  |
| POST   | `/api/statuses`             | `201`                                    | `400`                  |
| PUT    | `/api/statuses/{id}`        | `200`                                    | `400`, `404`           |
| DELETE | `/api/statuses/{id}`        | `204`                                    | `404`, `409` if in use |

Create/update body:

```json
{
  "name": "In Progress",
  "color": "#f59e0b",
  "position": 1,
  "isInitial": false,
  "active": true
}
```

- Setting `isInitial: true` clears `isInitial` on other statuses.
- DELETE blocked with `{ "error": "Status is in use by tickets" }` when referenced.

---

### Tags

| Method | Path             | Success       | Errors       |
| ------ | ---------------- | -------------- | ------------ |
| GET    | `/api/tags`      | `200` `Tag[]` | —            |
| GET    | `/api/tags/{id}` | `200`         | `404`        |
| POST   | `/api/tags`      | `201`         | `400`        |
| PUT    | `/api/tags/{id}` | `200`         | `400`, `404` |
| DELETE | `/api/tags/{id}` | `204`         | `404`        |

Body: `{ "name": "frontend" }`

- Delete removes tag and unlinks it from tickets (unlink on delete, not blocked).

---

### Assignees

| Method | Path                  | Success            | Errors                            |
| ------ | --------------------- | -------------------- | ---------------------------------- |
| GET    | `/api/assignees`      | `200` `Assignee[]` | —                                 |
| GET    | `/api/assignees/{id}` | `200`              | `404`                             |
| POST   | `/api/assignees`      | `201`              | `400`                             |
| PUT    | `/api/assignees/{id}` | `200`              | `400`, `404`                      |
| DELETE | `/api/assignees/{id}` | `204`              | `404`, `409` if tickets reference |

Body:

```json
{
  "name": "Anna Um",
  "email": "anna@example.com",
  "department": "Support",
  "position": "Support Agent"
}
```

- `position` optional.
- On delete: **block if in use** (`409`); tickets keep assignee until reassigned/cleared.

---

### Settings

| Method | Path            | Body                           | Success        |
| ------ | --------------- | -------------------------------- | -------------- |
| GET    | `/api/settings` | —                              | `200` Settings |
| PUT    | `/api/settings` | `{ "ticketCodePrefix": "ut" }` | `200` Settings |

- Prefix: non-empty, lowercase alphanumeric, max 16 chars (validation `400` if invalid).
- Changing prefix does **not** rewrite existing ticket codes.

---

## Validation rules

### Ticket create

- `title`, `description`, `customerName` — required, non-empty (trim).
- `customerEmail` — required, valid email.
- `priority` — required enum.
- `assigneeId` / `tagIds` — if present, must exist.
- `deadline` — optional ISO-8601 instant.
- status is not client-settable on create — always the `isInitial` status.

### Ticket patch

- Same field rules when field is present.
- `statusId` if present must exist (active not required if already set historically — but new assignment should prefer active; allow inactive `statusId` only if it is the ticket's current status; otherwise must be active).

### Status / tag / assignee

- Names required, non-empty.
- Status `color` required, match `#RRGGBB`.
- Unique constraints as noted above.

---

## Error responses (4xx / 409)

All errors JSON with at least `error: string`. Validation may include `details`:

```json
{
  "error": "Validation failed",
  "details": [{ "field": "customerEmail", "message": "must be a valid email" }]
}
```

Examples:

```json
{ "error": "Ticket 123 not found" }
```

```json
{ "error": "Status is in use by tickets" }
```

```json
{ "error": "Invalid priority filter: bogus" }
```

```json
{ "error": "Malformed request body" }
```

---

## Breaking changes vs previous contract

- `Ticket.status` is now an **object**, not `"open" | "in_progress" | "resolved"`.
- `GET /api/tickets` returns a **Page**, not a bare array.
- List filter `status` (enum string) → `statusId` (long).
- PATCH may include more than `status`; use `statusId` instead of status string.
- New resources: statuses, tags, assignees, settings.
- New ticket fields: `code`, `deadline`, `assignee`, `tags`.

> After deploying backend changes, reset local DB volume if migrating from the enum-based schema (`docker compose down -v` then `up`).

> Frontend may develop against this contract before the backend is ready (hardcode/mocked responses matching these shapes), then switch to the live API by pointing `VITE_API_URL` at the running backend.

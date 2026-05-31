# Backend Changes Required

This document is intended for an AI or developer working on the Lexie backend codebase. It lists every backend dependency introduced by the frontend UI overhaul (`feat/ui-overhaul`). All items are self-contained and actionable without reading the frontend diff.

---

## 1. `name` field missing from `GET /auth/me` response — **HIGH PRIORITY**

### Context
`HomePage.jsx` now uses `user.name` as the primary display value in the "Welcome back" greeting, with the following fallback chain:

```js
user?.name || user?.username || user?.email?.split('@')[0] || 'there'
```

Without a `name` field in the response, the greeting silently falls back to `username` or the email prefix. This is functional but not ideal — the intent is to greet users by their full name.

### Current observed response shape

```json
{
  "id": 1,
  "email": "jayesh@example.com",
  "username": "jayesh",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00"
}
```

### Required response shape

```json
{
  "id": 1,
  "name": "Jayesh Motwani",
  "email": "jayesh@example.com",
  "username": "jayesh",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00"
}
```

### Actions required

1. **SQLAlchemy `User` model** — verify that a `name` column exists (e.g. `name = Column(String, nullable=True)`). Add it if missing.
2. **`POST /auth/register`** — verify the registration endpoint accepts and persists a `name` field from the request body. Update the Pydantic request schema (`UserCreate` or equivalent) to include `name: str | None = None` if it is absent.
3. **`GET /auth/me` Pydantic response schema** — verify `name` is included in the serialised output. Update the `UserOut` (or equivalent) schema to add `name: str | None`.
4. **Alembic migration** — if the `name` column does not yet exist in the database, generate and apply a migration: `alembic revision --autogenerate -m "add name to users"`.

---

## 2. No new endpoints required

The "New Chat from sidebar" flow in the frontend reuses the existing endpoints:

- `POST /sessions` — create a new session record
- `POST /start-session` — initialise the in-memory bot for a session

No new routes are needed on the backend.

---

## 3. No backend involvement in first-login routing

The `lexie_first_login` flag used to control whether the language picker (`/home`) is shown is stored exclusively in `sessionStorage` on the client. It is set after a successful login and cleared once the user lands on `/home`. The backend is not involved and requires no changes.

---

## Summary Table

| Priority | Area | Action Required |
|---|---|---|
| **HIGH** | `GET /auth/me` response | Add `name` field to `UserOut` Pydantic schema |
| **HIGH** | `User` SQLAlchemy model | Add `name` column if missing |
| **HIGH** | `POST /auth/register` | Accept and persist `name` in `UserCreate` schema |
| **HIGH** | Database | Run Alembic migration to add `name` column if it does not exist |
| None | New endpoints | No new routes required |
| None | Session storage / routing | No backend involvement — client-only `sessionStorage` flag |

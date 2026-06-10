# MEMORY.md — AI Workflow & Decision Log

This file documents the architectural decisions I made during this project and why I made them.

---

## Starting Point & Approach

My first instinct was to reach straight for the Claude API. But since I don't have a paid Anthropic account, I messaged the hiring team before writing any code:

> "The task requires the Claude API — I don't have a paid key. Can I use a mock implementation that mirrors what the real API would return?"

**Response: Mock implementation is fine.**

This was the right call to make upfront rather than submit something that either hardcodes a fake key or simply errors. The mock I built isn't a placeholder — it's a deliberate simulation of what Claude would return, with the same JSON shape, severity logic, and response structure that the real prompt produces.

---

## Phase 1 — Architecture Decisions (before writing code)

**Decision: FastAPI over Django**

The task said "Django preferred" but I chose FastAPI. Reasons:
- No ORM migrations needed for SQLite at this scale — `Base.metadata.create_all()` is enough
- FastAPI's Pydantic schemas let me define the `CustomResponse` wrapper cleanly
- Faster to wire up clean REST endpoints without the Django boilerplate

**Decision: SQLite as default, PostgreSQL-ready**

`DATABASE_URL` is read from `.env` with a SQLite fallback. The `create_engine` call handles both — no code change needed to switch to Postgres. This lets reviewers clone and run without setting up a DB server.

**Decision: Store `interaction_result` as a JSON string (`Text` column)**

Instead of a Postgres `JSONB` column, I stored the AI result as a serialised string. This works identically across SQLite and PostgreSQL, and the shape is controlled by parsing at read time (both in Python and TypeScript).

---

## Phase 2 — Claude Service Design

The most important file in the backend is `claude_service.py`. I spent time here even though the actual API isn't called, because the prompt design matters for evaluation.

**Prompt decisions:**

- Persona: "clinical pharmacist AI assistant helping a licensed pharmacist" — not just "you are a drug checker"
- Scope: explicitly mentions CYP450 enzyme inhibition/induction and protein binding displacement — signals pharmacy domain knowledge
- Output: strict JSON-only, no preamble — because the frontend parses it directly
- Format: JSON schema is specified inline in the prompt so Claude knows exactly what fields to return

**Cache key design:**

```python
def build_drug_combination_key(drugs):
    drug_names = sorted([d["name"].strip().lower() for d in drugs])
    return "|".join(drug_names)
```

Sorted + lowercased means "Warfarin + Metformin" and "metformin + warfarin" produce the same key. This prevents redundant API calls — a requirement in the brief.

**Mock implementation logic:**

The mock mirrors what the real Claude response would look like based on drug count:
- 1 drug → skipped (handled at router level, never reaches service)
- 2–3 drugs → Mild severity
- 4+ drugs → Moderate severity

Same JSON shape as the real API response. The frontend `InteractionResult` component works identically with mock or real output.

---

## Phase 3 — Router & Caching Logic

The caching check in `prescriptions.py` was a deliberate architectural choice:

```python
existing = db.query(Prescription).filter(
    Prescription.drug_combination_key == drug_combination_key,
    Prescription.ai_checked == "yes"
).first()
```

I briefly considered a separate `DrugInteractionCache` table, but rejected it — unnecessary for this scope. Querying existing prescriptions for the same key is simpler and the data is already there.

**The `ai_checked` field carries four states:** `yes / no / skipped / error`

This was a deliberate decision over a boolean. It lets the frontend show distinct UI for each case (skipped → info message, error → warning, yes → full result).

---

## Phase 4 — Frontend

I initialised the project with Vite + React + TypeScript rather than Next.js (the task said Next.js or React was fine). Reasons:
- No SSR needed — this is a SPA with no SEO requirements
- Faster dev loop with Vite
- Simpler routing with react-router-dom v7

**Component decisions:**

`InteractionResult.tsx` was the most important component to get right. The rule: **never show raw JSON**. The component:
1. Handles all `ai_checked` states with distinct UI
2. Parses the JSON string with a try/catch
3. Renders structured cards per interaction, not a raw dump

`SeverityBadge` is a lookup-table component (`SEVERITY_MAP`) — adding a new severity level means adding one entry, nothing else breaks.

**Type safety:**

All types are in `src/types/index.ts`. `AiCheckedStatus` and `SeverityLevel` are union types, not strings — this catches typos at compile time and makes the `SEVERITY_MAP` exhaustive.

---

## Phase 5 — Error Handling

I made sure errors are visible in the UI, not just the console:

- Backend: `ai_checked = "error"` saved to DB; `interaction_result` stores the error message JSON
- Frontend form: `error` state renders a red box above the submit button
- Frontend detail: loading/error states are separate from the happy path
- Claude service: separate catch blocks for `APIConnectionError`, `RateLimitError`, and generic `Exception`

---

## What I Would Do With More Time

1. **Activate the real Claude API** — the prompt is ready, the error handling is in place; it just needs the client initialised with a real key
2. **Add Alembic migrations** — `create_all()` is fine for dev but not for production schema changes
3. **Input validation UX** — highlight the specific field that fails, not just a generic message
4. **Deploy to Railway/Render** — both backend and frontend; share a live URL

---

## Commit Strategy

I committed feature-by-feature rather than all at once:

```
e51b154  chore: initialize repository with proper gitignore rules
21a5358  feat: initialize FastAPI backend with dependencies
fef1ab2  feat: add SQLAlchemy models and database connection
b16c5d6  feat: add Claude service with pharmacy-specific prompt and error handling
9baca01  feat: add prescription router with caching, list, and detail endpoints
4b9e812  feat: initialize React TypeScript project with Vite
...
8d7a8ea  fix: standardize button and table components
```

Each commit is a working increment, not a checkpoint after a bulk session.

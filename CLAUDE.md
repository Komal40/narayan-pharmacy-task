# CLAUDE.md — AI Assistant Instructions for narayan-pharmacy-task

## What This App Does

A pharmacy SaaS feature where a pharmacist enters a prescription (patient, doctor, drugs + dosages) and gets an AI-powered drug interaction report before dispensing. Two screens: entry form and prescriptions list/detail.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI (Python), SQLAlchemy ORM, SQLite (dev) / PostgreSQL (prod) |
| Frontend | React 18, TypeScript, Vite, React Router v7 |
| UI Components | Mantine v6, mantine-react-table |
| AI | Anthropic Claude API (`claude-opus-4-5`) via `anthropic` Python SDK |
| HTTP | Axios (frontend) |

---

## Project Structure

```
backend/
  app/
    main.py              # FastAPI app entry — CORS, router registration, table creation
    database.py          # SQLAlchemy engine, SessionLocal, Base, get_db dependency
    models.py            # Prescription model (includes drug_combination_key for caching)
    schemas.py           # Pydantic: PrescriptionCreate, PrescriptionResponse, PrescriptionListItem, CustomResponse
    routers/
      prescriptions.py   # All REST endpoints (POST /, GET /, GET /{id})
    services/
      claude_service.py  # check_drug_interactions() (mock), check_drug_interaction() (real Claude), build_drug_combination_key()

frontend/
  src/
    pages/
      NewPrescription.tsx    # Form page — patient details + drug rows + submit
      PrescriptionList.tsx   # MRT table with severity badge per row
      PrescriptionDetail.tsx # Full detail + InteractionResult component
    components/
      DrugRow.tsx            # Single drug name + dosage input row
      InteractionResult.tsx  # Renders parsed AI JSON result (never raw JSON)
      SeverityBadge.tsx      # Colour-coded pill: None / Mild / Moderate / Severe
    common/
      CommonButton.tsx       # Shared button
      CommonTable.tsx        # Mantine-react-table wrapper
    api/
      client.ts              # Axios instance + makeRequest wrapper
      prescription.ts        # createPrescription, getAllPrescriptions, getPrescriptionById
    types/index.ts           # All shared TypeScript interfaces and types
```

---

## How to Run Locally

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env        # add ANTHROPIC_API_KEY
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:8000
npm run dev
```

---

## Key Conventions

### Backend
- All endpoints return `CustomResponse` shape: `{ status: bool, statusCode: int, data: any }`
- Drug combination cache key: sorted, lowercased, pipe-joined drug names — `build_drug_combination_key()`
- Skip AI call if `len(drugs) < 2`; set `ai_checked = "skipped"`
- Never re-call Claude if the same `drug_combination_key` already exists with `ai_checked = "yes"`
- `interaction_result` is stored as a JSON string (not a JSON column) in the DB
- API key lives in `.env` as `ANTHROPIC_API_KEY` — never hardcoded

### Frontend
- `InteractionResult.tsx` always parses `interaction_result` string before rendering — raw JSON is never shown
- `SeverityBadge` accepts `SeverityLevel | null` — falls back to `"None"` config if null
- All API calls go through `makeRequest` in `client.ts` — handles errors and base URL
- Types are centralised in `src/types/index.ts`; import from there, never redeclare inline

### AI Service (claude_service.py)
- `check_drug_interactions()` — **mock implementation** (approved by hiring team); returns deterministic results based on drug count
- `check_drug_interaction()` — real Claude implementation; not active (client not initialised); uses pharmacy-specific prompt asking for structured JSON output
- Claude prompt instructs: clinical pharmacist persona, CYP450/protein binding analysis, strict JSON-only response, no preamble

---

## Constraints & Gotchas

- **No authentication** — out of scope per task brief; do not add login/auth
- **No inventory / billing / OCR** — explicitly out of scope
- SQLite `check_same_thread: False` is set in `database.py` for dev — do not remove
- Frontend uses Mantine v6 (not v7) — `MantineProvider` must wrap table pages
- `interaction_result` in DB is a `Text` column containing a JSON string; always use `json.loads()` before using it in Python and `JSON.parse()` in TypeScript
- If adding a new field to `Prescription` model, create a new migration — do not modify existing schema in place
- `drug_combination_key` can be null (for single-drug prescriptions where AI is skipped)

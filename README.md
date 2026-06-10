# Narayan Pharmacy — Prescription Entry & Drug Interaction Checker

A focused pharmacy SaaS feature that lets a pharmacist enter a prescription and get AI-powered drug interaction warnings before dispensing.

**Stack:** FastAPI (Python) · React + TypeScript (Vite) · SQLite · Claude API (mock implementation, approved by hiring team)

---

## Quick Start (5 commands)

```bash
# 1. Clone
git clone https://github.com/Komal40/narayan-pharmacy-task.git && cd narayan-pharmacy-task

# 2. Backend setup
cd backend && pip install -r requirements.txt && cp .env.example .env

# 3. Run backend (auto-creates SQLite DB)
uvicorn app.main:app --reload
# → API running at http://localhost:8000

# 4. Frontend setup (new terminal)
cd ../frontend && npm install && cp .env.example .env

# 5. Run frontend
npm run dev
# → App running at http://localhost:5173
```

---

## Environment Variables

**backend/.env**
```
ANTHROPIC_API_KEY=your_key_here
DATABASE_URL=sqlite:///./pharmacy.db
```

**frontend/.env**
```
VITE_API_BASE_URL=http://localhost:8000
```

> **Note on Claude API:** This project uses a mock implementation for the drug interaction check. The mock was approved by the hiring team due to Claude API access constraints. The actual `check_drug_interaction()` function with the full pharmacy-specific prompt is implemented in `backend/app/services/claude_service.py` and can be activated by initialising the `anthropic.Anthropic()` client and calling that function instead of `check_drug_interactions()`.

---

## Features

- **Prescription Entry Form** — Patient name, doctor, date, multiple drug rows (name + dosage)
- **AI Interaction Check** — Calls Claude API on submit; skips automatically if only 1 drug is entered
- **Result caching** — Same drug combination is never sent to the API twice (cached in DB by normalised key)
- **Prescriptions List** — Sortable/searchable table with severity badge per row
- **Detail View** — Full prescription with formatted interaction analysis and severity indicator
- **Error handling** — API errors shown inline in UI; never crashes the form

---

## Project Structure

```
narayan-pharmacy-task/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + CORS
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── models.py            # Prescription ORM model
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   └── prescriptions.py # POST / GET / GET:id endpoints
│   │   └── services/
│   │       └── claude_service.py# Interaction check logic (mock + real)
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── NewPrescription.tsx
    │   │   ├── PrescriptionList.tsx
    │   │   └── PrescriptionDetail.tsx
    │   ├── components/
    │   │   ├── DrugRow.tsx
    │   │   ├── InteractionResult.tsx
    │   │   └── SeverityBadge.tsx
    |   |---common/
    |   |       CommonTable.tsx
    │   ├── api/
    │   │   ├── client.ts        # Axios wrapper
    │   │   └── prescription.ts  # API calls
    │   └── types/index.ts
    ├── package.json
    └── .env.example
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/prescriptions/` | Create prescription + trigger AI check |
| GET | `/api/prescriptions/` | List all prescriptions |
| GET | `/api/prescriptions/{id}` | Get prescription detail |

---

## Severity Levels

The AI returns one of four severity levels displayed as a colour-coded badge:

| Level | Meaning |
|-------|---------|
| ✓ None | No known interactions |
| ● Mild | Monitor; no immediate action needed |
| ◆ Moderate | Clinical review recommended |
| ⚠ Severe | Do not dispense without pharmacist sign-off |

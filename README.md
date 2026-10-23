# Nepal Economic & Social Data Explorer

A full-stack dashboard for exploring Nepal's economic and social indicators from official sources (National Statistics Office, Nepal Rastra Bank).

**Stack:** React + Vite + Recharts (frontend) · Python + FastAPI + Pandas (backend) · CSV data with JSON metadata · Pytest.

## Architecture
```
data/        indicators.csv + metadata.json (source, unit, method per indicator)
backend/     app/data.py  load, validate, filter, statistics (no web code)
             app/main.py  FastAPI endpoints, CORS, CSV export
             tests/       pytest for data logic and API
frontend/    src/api.js   all HTTP calls
             src/components, src/pages
```
Flow: React filter change → `GET /api/compare` → FastAPI filters with Pandas → JSON (observations, metadata, summary) → chart, KPI cards, findings.

## Endpoints
| Endpoint | Purpose |
|---|---|
| `GET /api/health` | liveness |
| `GET /api/indicators` | catalog and available years |
| `GET /api/indicators/{id}?start_year=&end_year=` | one indicator with summary |
| `GET /api/compare?ids=a,b&start_year=&end_year=` | up to 4 indicators |
| `GET /api/export.csv?ids=a,b&start_year=&end_year=` | CSV of the filtered data |

## Run locally
```bash
# backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload          # http://127.0.0.1:8000/docs
pytest

# frontend (new terminal)
cd frontend  && npm install && npm run dev   # http://localhost:5173
```

## Deploy
Frontend on Vercel (set `VITE_API_BASE_URL` to the public backend URL). Backend on any Python host (Render, Railway, Fly.io): start with `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, include the `data/` folder, and set `CORS_ORIGINS` to the deployed frontend origin.

## Data caveat
Values marked `approximate` in `data/indicators.csv` were compiled from memory of published releases and must be verified against the linked NSO / NRB portals before being cited. `verified` values match Nepal Rastra Bank releases for FY2024/25 and FY2025/26. See `data/README.md`.

## Limitations
Small curated dataset; GDP, poverty, literacy and population need checking; fiscal years are plotted at their starting calendar year; no authentication or database (not needed at this scale).

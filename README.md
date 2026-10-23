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

## Deployment

The app is deployed as two services: the React frontend on Vercel and the FastAPI backend on Render.

| Part | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://nepal-economic-social-data-explorer.vercel.app/ |
| Backend API | Render | https://nepal-economic-social-data-explorer-api.onrender.com |

### Backend (Render)
1. Create a Web Service from this GitHub repo and leave the root directory empty, because the API reads `data/` from the repo root.
2. Build command: `pip install -r backend/requirements.txt`
3. Start command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment variables:
   - `PYTHON_VERSION` = `3.12.3`
   - `CORS_ORIGINS` = the frontend URL, with no trailing slash (comma-separate several)
5. Check `/api/health` returns `{"status":"ok"}`.

### Frontend (Vercel)
1. Import the same repo and set the root directory to `frontend` (Vite, build `npm run build`, output `dist`).
2. Environment variable: `VITE_API_BASE_URL` = the Render URL, with no trailing slash. Vite embeds this at build time, so redeploy after changing it. Never put secrets in `VITE_` variables.

### Updating
Pushing to `main` redeploys both services. To update data, edit `data/indicators.csv` and push.

### Troubleshooting
- **"Could not load data":** usually a CORS mismatch. `CORS_ORIGINS` must exactly match the frontend URL.
- **Long first load:** the free backend instance is waking from sleep.
- **Build can't find `requirements.txt`:** use `backend/requirements.txt` in the build command.

## Data caveat
Each value carries a confidence flag: `verified` (stated in an NRB/NSO release), `derived` (back-calculated from a reported growth rate) or `approximate` (not yet checked: CPI 2018/19-2020/21, GDP 2019/20-2022/23, poverty before 2022/23, literacy 2001 and 2011). See `data/README.md`.

## Limitations
Small curated dataset; GDP, poverty, literacy and population need checking; fiscal years are plotted at their starting calendar year; no authentication or database (not needed at this scale).

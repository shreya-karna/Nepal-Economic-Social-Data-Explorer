import csv
import io
import os

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from . import data as d

app = FastAPI(title="Nepal Economic & Social Data Explorer API", version="1.0.0")

@app.get("/")
def root():
    return {"name": "Nepal Data Explorer API", "docs": "/docs", "health": "/api/health"}

# Comma-separated list of allowed frontend origins. Set CORS_ORIGINS in production.
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(CORSMiddleware, allow_origins=[o.strip() for o in origins], allow_methods=["GET"], allow_headers=["*"])


def _payload(meta, df, iid, start, end):
    if iid not in meta:
        raise HTTPException(404, f"Unknown indicator '{iid}'")
    try:
        obs, n_missing = d.observations(df, iid, start, end)
    except d.DataError as e:
        raise HTTPException(400, str(e))
    m = meta[iid]
    return {"id": iid, **m, "observations": obs, "missing_count": n_missing, "summary": d.summarize(obs, m["unit"])}


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/indicators")
def list_indicators():
    meta, df, retrieved = d.load()
    return {"retrieved": retrieved, "years": d.years_available(df),
            "indicators": [{"id": k, **v} for k, v in meta.items()]}


@app.get("/api/indicators/{iid}")
def get_indicator(iid: str, start_year: int | None = None, end_year: int | None = None):
    meta, df, retrieved = d.load()
    return {**_payload(meta, df, iid, start_year, end_year), "retrieved": retrieved}


@app.get("/api/compare")
def compare(ids: str = Query(..., description="Comma-separated indicator ids, max 4"),
            start_year: int | None = None, end_year: int | None = None):
    meta, df, retrieved = d.load()
    wanted = [i for i in ids.split(",") if i]
    if not wanted or len(wanted) > 4:
        raise HTTPException(400, "Provide between 1 and 4 indicator ids")
    return {"retrieved": retrieved, "indicators": [_payload(meta, df, i, start_year, end_year) for i in wanted]}


@app.get("/api/export.csv")
def export_csv(ids: str, start_year: int | None = None, end_year: int | None = None):
    meta, df, _ = d.load()
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["indicator", "unit", "period", "value", "confidence", "publisher", "source_url"])
    for iid in [i for i in ids.split(",") if i]:
        p = _payload(meta, df, iid, start_year, end_year)
        for o in p["observations"]:
            w.writerow([p["name"], p["unit"], o["period"], o["value"], o["confidence"], p["publisher"], p["url"]])
    return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=nepal-indicators.csv"})

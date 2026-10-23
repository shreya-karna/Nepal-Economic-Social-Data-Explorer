"""Loading, validation, filtering and statistics. No web code lives here."""
import json
from functools import lru_cache
from pathlib import Path

import pandas as pd

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
REQUIRED = {"indicator_id", "period", "start_year", "value", "confidence"}


class DataError(ValueError):
    pass


def validate(df: pd.DataFrame, meta: dict) -> pd.DataFrame:
    missing = REQUIRED - set(df.columns)
    if missing:
        raise DataError(f"Missing columns: {sorted(missing)}")
    if df.duplicated(["indicator_id", "period"]).any():
        raise DataError("Duplicate observations for the same indicator and period")
    unknown = set(df["indicator_id"]) - set(meta)
    if unknown:
        raise DataError(f"Indicators without metadata: {sorted(unknown)}")
    df = df.copy()
    df["value"] = pd.to_numeric(df["value"], errors="coerce")  # blanks/garbage -> NaN, never 0
    df["start_year"] = pd.to_numeric(df["start_year"], errors="raise").astype(int)
    return df


@lru_cache
def load():
    meta = json.loads((DATA_DIR / "metadata.json").read_text(encoding="utf-8"))
    meta_ind = meta["indicators"]
    df = validate(pd.read_csv(DATA_DIR / "indicators.csv"), meta_ind)
    return meta_ind, df, meta["retrieved"]


def observations(df, indicator_id, start_year=None, end_year=None):
    if start_year is not None and end_year is not None and start_year > end_year:
        raise DataError("start_year must not be after end_year")
    d = df[df["indicator_id"] == indicator_id]
    if start_year is not None:
        d = d[d["start_year"] >= start_year]
    if end_year is not None:
        d = d[d["start_year"] <= end_year]
    d = d.sort_values("start_year")
    n_missing = int(d["value"].isna().sum())
    d = d.dropna(subset=["value"])
    obs = [
        {"period": r.period, "year": int(r.start_year), "value": float(r.value), "confidence": r.confidence}
        for r in d.itertuples()
    ]
    return obs, n_missing


def summarize(obs, unit):
    """Descriptive statistics. Percent change / CAGR are omitted when undefined."""
    if len(obs) < 2:
        return {"n": len(obs)}
    first, last = obs[0], obs[-1]
    span = last["year"] - first["year"]
    peak = max(obs, key=lambda o: o["value"])
    out = {
        "n": len(obs),
        "first": first, "last": last,
        "change_abs": round(last["value"] - first["value"], 4),
        "change_pct": round((last["value"] / first["value"] - 1) * 100, 2) if first["value"] != 0 else None,
        "cagr_pct": None,
        "peak": peak,
        "has_approximate": any(o["confidence"] != "verified" for o in obs),
    }
    if unit != "%" and first["value"] > 0 and last["value"] > 0 and span > 0:
        out["cagr_pct"] = round(((last["value"] / first["value"]) ** (1 / span) - 1) * 100, 2)
    return out


def years_available(df):
    return sorted(int(y) for y in df["start_year"].unique())

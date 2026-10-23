import pandas as pd
import pytest

from app import data as d

META = {"x": {"unit": "Rs bn"}}


def frame(rows):
    return pd.DataFrame(rows, columns=["indicator_id", "period", "start_year", "value", "confidence"])


def test_filter_range_and_order():
    _, df, _ = d.load()
    obs, _ = d.observations(df, "cpi", 2021, 2023)
    assert [o["year"] for o in obs] == [2021, 2022, 2023]


def test_start_after_end_rejected():
    _, df, _ = d.load()
    with pytest.raises(d.DataError):
        d.observations(df, "cpi", 2025, 2020)


def test_duplicates_rejected():
    df = frame([("x", "2020", 2020, 1, "verified"), ("x", "2020", 2020, 2, "verified")])
    with pytest.raises(d.DataError):
        d.validate(df, META)


def test_missing_column_rejected():
    with pytest.raises(d.DataError):
        d.validate(pd.DataFrame({"indicator_id": ["x"]}), META)


def test_missing_value_is_not_zero():
    df = d.validate(frame([("x", "2020", 2020, None, "verified"), ("x", "2021", 2021, 5, "verified")]), META)
    obs, n_missing = d.observations(df, "x")
    assert n_missing == 1 and [o["value"] for o in obs] == [5.0]


def test_summary_zero_denominator():
    obs = [{"period": "a", "year": 2020, "value": 0.0, "confidence": "verified"},
           {"period": "b", "year": 2021, "value": 5.0, "confidence": "verified"}]
    s = d.summarize(obs, "Rs bn")
    assert s["change_pct"] is None and s["cagr_pct"] is None and s["change_abs"] == 5.0


def test_cagr():
    obs = [{"period": "a", "year": 2020, "value": 100.0, "confidence": "verified"},
           {"period": "b", "year": 2022, "value": 121.0, "confidence": "verified"}]
    assert d.summarize(obs, "Rs bn")["cagr_pct"] == 10.0


def test_single_observation():
    assert d.summarize([{"period": "a", "year": 2020, "value": 1.0, "confidence": "verified"}], "%") == {"n": 1}

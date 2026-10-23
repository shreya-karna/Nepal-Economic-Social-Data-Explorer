from fastapi.testclient import TestClient

from app.main import app

c = TestClient(app)


def test_list():
    r = c.get("/api/indicators")
    assert r.status_code == 200 and len(r.json()["indicators"]) >= 5


def test_indicator_ok():
    r = c.get("/api/indicators/cpi?start_year=2021&end_year=2023")
    j = r.json()
    assert r.status_code == 200 and j["unit"] == "%" and len(j["observations"]) == 3


def test_unknown_404():
    assert c.get("/api/indicators/nope").status_code == 404


def test_bad_range_400():
    assert c.get("/api/indicators/cpi?start_year=2025&end_year=2020").status_code == 400


def test_compare_limits():
    assert c.get("/api/compare?ids=cpi,rem").status_code == 200
    assert c.get("/api/compare?ids=cpi,rem,gdp,res,pop").status_code == 400


def test_csv():
    r = c.get("/api/export.csv?ids=cpi&start_year=2024")
    assert r.status_code == 200 and r.text.splitlines()[0].startswith("indicator,unit")

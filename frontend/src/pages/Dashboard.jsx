import { useEffect, useState } from "react";
import { compare, csvUrl } from "../api";
import { findings } from "../format";
import FilterBar from "../components/FilterBar";
import StatCard from "../components/StatCard";
import TrendChart, { COLORS } from "../components/TrendChart";
import DataTable from "../components/DataTable";
import SourcePanel from "../components/SourcePanel";
import { Loading, ErrorBox, Empty } from "../components/States";

export default function Dashboard({ catalog, category }) {
  const options = catalog.indicators.filter((i) => category === "All" || i.category === category);
  const years = catalog.years;
  const [selected, setSelected] = useState(() => options.slice(0, 2).map((o) => o.id));
  const [start, setStart] = useState(years[0]);
  const [end, setEnd] = useState(years.at(-1));
  const [type, setType] = useState("line");
  const [state, setState] = useState({ status: "idle", data: null, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => { setSelected(options.slice(0, 2).map((o) => o.id)); }, [category]); // eslint-disable-line

  useEffect(() => {
    if (!selected.length || start > end) { setState({ status: "idle", data: null, error: null }); return; }
    const ctl = new AbortController();
    setState((s) => ({ ...s, status: "loading", error: null }));
    compare(selected, start, end, ctl.signal)
      .then((data) => setState({ status: "ok", data, error: null }))
      .catch((e) => e.name !== "AbortError" && setState({ status: "error", data: null, error: e.message }));
    return () => ctl.abort();
  }, [selected, start, end, tick]);

  const toggle = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : s.length < 4 ? [...s, id] : s);
  const inds = state.data?.indicators || [];
  const withData = inds.filter((i) => i.observations.length);

  let body;
  if (start > end) body = <ErrorBox message="The start year is after the end year. Adjust the period." />;
  else if (!selected.length) body = <Empty title="No indicators selected" hint="Choose at least one indicator above." />;
  else if (state.status === "loading" && !state.data) body = <Loading />;
  else if (state.status === "error") body = <ErrorBox message={state.error} onRetry={() => setTick((t) => t + 1)} />;
  else if (state.data && !withData.length) body = <Empty title="No data in this period" hint="Try a wider range of years." />;
  else if (state.data) body = (
    <>
      {inds.length !== withData.length && <p className="note">No data in this period for: {inds.filter((i) => !i.observations.length).map((i) => i.name).join(", ")}.</p>}
      <div className="kpis">{withData.map((i, k) => <StatCard key={i.id} ind={i} color={COLORS[k]} />)}</div>
      <div className="grid2">
        <div className="panel"><h3>Historical trend</h3><TrendChart indicators={inds} type={type} /></div>
        <div className="panel"><h3>Findings</h3><p className="sub small">Computed by the API from the selected data only.</p>
          <ul className="find">{withData.map((i) => <li key={i.id}>{findings(i)}</li>)}</ul></div>
      </div>
      <div className="panel mt"><h3>Data table</h3><DataTable indicators={withData} /></div>
      <div className="panel mt"><h3>Sources &amp; methodology</h3><SourcePanel indicators={inds} retrieved={state.data.retrieved} /></div>
    </>
  );

  return (
    <>
      <h2>{category === "All" ? "Overview" : `${category} indicators`}</h2>
      <p className="sub">Pick indicators and a period. Indicators with different units are shown as an index.</p>
      <FilterBar options={options} selected={selected} toggle={toggle} years={years} start={start} end={end}
        setStart={setStart} setEnd={setEnd} type={type} setType={setType} csv={csvUrl(selected, start, end)} />
      {body}
    </>
  );
}

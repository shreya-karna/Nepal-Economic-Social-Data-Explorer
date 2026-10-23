export default function FilterBar({ options, selected, toggle, years, start, end, setStart, setEnd, type, setType, csv }) {
  return (
    <div className="panel filters">
      <div>
        <div className="lab">Indicators (up to 4)</div>
        <div className="row">{options.map((o) => (
          <button key={o.id} className="pill" aria-pressed={selected.includes(o.id)} onClick={() => toggle(o.id)}>{o.name}</button>
        ))}</div>
      </div>
      <div>
        <div className="lab">Period (start year)</div>
        <div className="row">
          <select value={start} onChange={(e) => setStart(+e.target.value)} aria-label="From year">{years.map((y) => <option key={y}>{y}</option>)}</select>
          <span>to</span>
          <select value={end} onChange={(e) => setEnd(+e.target.value)} aria-label="To year">{years.map((y) => <option key={y}>{y}</option>)}</select>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <div className="seg">
            <button aria-pressed={type === "line"} onClick={() => setType("line")}>Line</button>
            <button aria-pressed={type === "bar"} onClick={() => setType("bar")}>Bar</button>
          </div>
          <a className="btn" href={csv} download>Download CSV</a>
        </div>
      </div>
    </div>
  );
}

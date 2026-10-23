import { fmt } from "../format";
export default function StatCard({ ind, color }) {
  const o = ind.observations;
  if (!o.length) return null;
  const last = o[o.length - 1], prev = o[o.length - 2];
  const ch = prev && prev.value !== 0 ? ((last.value - prev.value) / Math.abs(prev.value)) * 100 : null;
  return (
    <div className="kpi" style={{ "--k": color }}>
      <small>{ind.name}</small>
      <div className="v">{fmt(last.value, ind.unit)}</div>
      <div className="d">{last.period}{ch != null && <> · <span className={ch >= 0 ? "up" : "dn"}>{ch >= 0 ? "▲" : "▼"} {Math.abs(ch).toFixed(1)}% vs {prev.period}</span></>}</div>
      <span className={`badge ${last.confidence !== "verified" ? "ap" : ""}`}>{last.confidence}</span>
    </div>
  );
}

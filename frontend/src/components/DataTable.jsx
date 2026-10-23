import { fmt } from "../format";
export default function DataTable({ indicators }) {
  const rows = indicators.flatMap((i) => i.observations.map((o) => ({ ...o, ind: i })));
  if (!rows.length) return null;
  return (
    <div className="scroll"><table>
      <thead><tr><th>Indicator</th><th>Period</th><th>Value</th><th>Confidence</th></tr></thead>
      <tbody>{rows.map((r) => (
        <tr key={r.ind.id + r.period}><td>{r.ind.name}</td><td>{r.period}</td><td>{fmt(r.value, r.ind.unit)}</td><td>{r.confidence}</td></tr>
      ))}</tbody>
    </table></div>
  );
}

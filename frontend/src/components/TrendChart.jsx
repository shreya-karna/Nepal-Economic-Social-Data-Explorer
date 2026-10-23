import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { fmt } from "../format";

export const COLORS = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)"];

export default function TrendChart({ indicators, type }) {
  const withData = indicators.filter((i) => i.observations.length);
  const normalize = new Set(withData.map((i) => i.unit)).size > 1;
  const rows = new Map();
  withData.forEach((ind) => {
    const base = ind.observations[0].value;
    ind.observations.forEach((o) => {
      const r = rows.get(o.period) || { period: o.period, year: o.year };
      r[ind.id] = normalize ? (base ? (o.value / base) * 100 : o.value) : o.value;
      r["raw_" + ind.id] = o.value;
      rows.set(o.period, r);
    });
  });
  const data = [...rows.values()].sort((a, b) => a.year - b.year);
  const Chart = type === "bar" ? BarChart : LineChart;
  const tip = ({ active, payload, label }) =>
    active && payload?.length ? (
      <div className="tip"><b>{label}</b>
        {payload.map((p) => {
          const ind = withData.find((i) => i.id === p.dataKey);
          return <div key={p.dataKey}>{ind.name}: {fmt(p.payload["raw_" + ind.id], ind.unit)}</div>;
        })}
      </div>
    ) : null;
  return (
    <>
      {normalize && <p className="note">Units differ, so values are indexed (first year in range = 100). Hover for actual values.</p>}
      <div style={{ width: "100%", height: 340 }}>
        <ResponsiveContainer>
          <Chart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <XAxis dataKey="period" stroke="var(--mut)" tick={{ fontSize: 12 }} />
            <YAxis stroke="var(--mut)" tick={{ fontSize: 12 }} width={56} />
            <Tooltip content={tip} />
            <Legend formatter={(id) => withData.find((i) => i.id === id)?.name} />
            {withData.map((ind, k) =>
              type === "bar"
                ? <Bar key={ind.id} dataKey={ind.id} fill={COLORS[k]} radius={[3, 3, 0, 0]} />
                : <Line key={ind.id} dataKey={ind.id} stroke={COLORS[k]} strokeWidth={2.5} connectNulls dot={{ r: 4 }} />
            )}
          </Chart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

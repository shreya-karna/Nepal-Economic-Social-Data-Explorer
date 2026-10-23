export const fmt = (v, unit) => {
  const n = Math.abs(v) >= 100 ? Math.round(v).toLocaleString() : +v.toFixed(2);
  return unit === "%" ? `${n}%` : `${n} ${unit}`;
};

/** Evidence-based sentences built only from the API summary. */
export function findings(ind) {
  const s = ind.summary;
  if (!s || s.n === 0) return `${ind.name}: no observations in this period.`;
  if (s.n === 1) return `${ind.name}: only one observation, so no trend can be computed.`;
  const { first, last, peak } = s;
  let t = ind.unit === "%"
    ? `${ind.name} moved from ${fmt(first.value, "%")} (${first.period}) to ${fmt(last.value, "%")} (${last.period}), a change of ${s.change_abs >= 0 ? "+" : ""}${s.change_abs.toFixed(1)} percentage points.`
    : `${ind.name} went from ${fmt(first.value, ind.unit)} (${first.period}) to ${fmt(last.value, ind.unit)} (${last.period})${s.change_pct != null ? `, ${s.change_pct >= 0 ? "up" : "down"} ${Math.abs(s.change_pct).toFixed(0)}%` : ""}${s.cagr_pct != null ? ` (about ${s.cagr_pct}% a year)` : ""}.`;
  t += ` Highest value: ${fmt(peak.value, ind.unit)} in ${peak.period}.`;
  if (s.has_approximate) t += " Includes approximate values.";
  return t;
}

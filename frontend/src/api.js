const BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function get(path, signal) {
  const res = await fetch(`${BASE}${path}`, { signal });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { msg = (await res.json()).detail || msg; } catch { /* keep default */ }
    throw new Error(msg);
  }
  return res.json();
}
const qs = (p) => new URLSearchParams(Object.entries(p).filter(([, v]) => v != null)).toString();

export const listIndicators = (s) => get("/api/indicators", s);
export const compare = (ids, start, end, s) =>
  get(`/api/compare?${qs({ ids: ids.join(","), start_year: start, end_year: end })}`, s);
export const csvUrl = (ids, start, end) =>
  `${BASE}/api/export.csv?${qs({ ids: ids.join(","), start_year: start, end_year: end })}`;

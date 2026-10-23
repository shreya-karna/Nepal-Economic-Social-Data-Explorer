import { useEffect, useState } from "react";
import { listIndicators } from "./api";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import { Loading, ErrorBox } from "./components/States";

const NAV = [["overview", "Overview"], ["economic", "Economic"], ["social", "Social"], ["about", "About the data"]];

export default function App() {
  const [page, setPage] = useState("landing");
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem("nde-theme") || "light"; } catch { return "light"; } });
  const [catalog, setCatalog] = useState({ status: "loading" });
  const load = () => { setCatalog({ status: "loading" }); listIndicators().then((d) => setCatalog({ status: "ok", ...d })).catch((e) => setCatalog({ status: "error", error: e.message })); };
  useEffect(load, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; try { localStorage.setItem("nde-theme", theme); } catch { /* ignore */ } }, [theme]);

  const toggle = (
    <div className="seg" role="group" aria-label="Theme">
      <button aria-pressed={theme === "light"} onClick={() => setTheme("light")}>A · Research</button>
      <button aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>B · Dark</button>
    </div>
  );

  if (page === "landing") return (<><nav className="top"><div className="brand" onClick={() => setPage("landing")}>Nepal<b>Data</b> Explorer</div>{toggle}</nav><Landing go={setPage} /></>);

  let main;
  if (catalog.status === "loading") main = <Loading />;
  else if (catalog.status === "error") main = <ErrorBox message={`${catalog.error}. Is the backend running at the configured API URL?`} onRetry={load} />;
  else if (page === "about") main = <About catalog={catalog} />;
  else main = <Dashboard key={page} catalog={catalog} category={{ overview: "All", economic: "Economic", social: "Social" }[page]} />;

  return (
    <>
      <nav className="top"><div className="brand" onClick={() => setPage("landing")}>Nepal<b>Data</b> Explorer</div>{toggle}</nav>
      <div className="shell">
        <aside className="side" aria-label="Sections">{NAV.map(([k, l]) => <button key={k} aria-current={page === k} onClick={() => setPage(k)}>{l}</button>)}</aside>
        <main className="main">{main}</main>
      </div>
    </>
  );
}

import Hero3D from "../components/Hero3D";
const chips = [["Rs 2,363 bn", "Remittances FY2025/26"], ["US$ 24.7 bn", "Gross reserves, Jun 2026"], ["3.08%", "Avg inflation FY2025/26"], ["76.2%", "Literacy, Census 2021"]];
export default function Landing({ go }) {
  return (
    <header className="hero">
      <Hero3D />
      <div className="wrap">
        <div className="eyebrow">Official statistics · NSO &amp; Nepal Rastra Bank</div>
        <h1>Nepal’s economy and society, in one place.</h1>
        <p>Compare inflation, remittances, reserves, poverty and more across years. Every indicator carries its source, method and a confidence flag, and every view exports to CSV.</p>
        <button className="cta" onClick={() => go("overview")}>Start exploring →</button>
        <div className="chips">{chips.map((c) => <div className="chip3d" key={c[1]}><b>{c[0]}</b><span>{c[1]}</span></div>)}</div>
      </div>
    </header>
  );
}

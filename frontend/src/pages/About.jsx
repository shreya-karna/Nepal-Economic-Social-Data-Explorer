export default function About({ catalog }) {
  return (
    <>
      <h2>About the data</h2>
      <p className="sub">Retrieved {catalog.retrieved}. Sources: <a href="https://data.nsonepal.gov.np/en/" target="_blank" rel="noreferrer">National Statistics Office</a> and <a href="https://www.nrb.org.np/nsdp/" target="_blank" rel="noreferrer">Nepal Rastra Bank</a>.</p>
      <div className="panel">
        <ul className="find">
          <li><b>verified</b> values match a Nepal Rastra Bank release. <b>approximate</b> values were compiled from memory of published releases and must be checked against the source portal before citing.</li>
          <li>Fiscal years run mid-July to mid-July; “2024/25” is plotted at 2024.</li>
          <li>Missing observations are excluded and counted, never treated as zero.</li>
          <li>Percent change and annual growth are omitted when the starting value is zero or the unit is already a percentage.</li>
        </ul>
        <h3 style={{ margin: "16px 0 6px" }}>Indicator catalog</h3>
        <div className="scroll"><table><thead><tr><th>Indicator</th><th>Unit</th><th>Frequency</th><th>Publisher</th></tr></thead>
          <tbody>{catalog.indicators.map((i) => <tr key={i.id}><td>{i.name}</td><td>{i.unit}</td><td>{i.frequency}</td><td><a href={i.url} target="_blank" rel="noreferrer">{i.publisher}</a></td></tr>)}</tbody></table></div>
      </div>
    </>
  );
}

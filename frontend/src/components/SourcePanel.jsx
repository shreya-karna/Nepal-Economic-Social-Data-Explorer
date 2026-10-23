export default function SourcePanel({ indicators, retrieved }) {
  return indicators.map((i) => (
    <details key={i.id}>
      <summary>{i.name}</summary>
      <dl>
        <dt>Publisher</dt><dd><a href={i.url} target="_blank" rel="noreferrer">{i.publisher}</a></dd>
        <dt>Method</dt><dd>{i.method}</dd>
        <dt>Unit</dt><dd>{i.unit}</dd>
        <dt>Frequency</dt><dd>{i.frequency}</dd>
        <dt>Coverage</dt><dd>{i.observations.length ? `${i.observations[0].period} to ${i.observations.at(-1).period} (${i.observations.length} observations)` : "No observations in range"}</dd>
        {i.missing_count > 0 && <><dt>Missing</dt><dd>{i.missing_count} observation(s) unavailable (not treated as zero)</dd></>}
        <dt>Retrieved</dt><dd>{retrieved}</dd>
      </dl>
    </details>
  ));
}

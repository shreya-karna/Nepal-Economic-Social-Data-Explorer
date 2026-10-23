export const Loading = () => <div className="state" role="status">Loading data…</div>;
export const ErrorBox = ({ message, onRetry }) => (
  <div className="state err" role="alert">
    <b>Could not load data.</b><br />{message}<br />
    {onRetry && <button className="btn" onClick={onRetry}>Retry</button>}
  </div>
);
export const Empty = ({ title, hint }) => (
  <div className="state"><b>{title}</b><br />{hint}</div>
);

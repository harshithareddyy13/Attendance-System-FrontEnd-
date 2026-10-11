/** Percentage with a small bar. Below 75% is flagged in red. */
export default function Percent({ value, total }) {
  const low = total > 0 && value < 75;
  return (
    <div className="pct">
      <span className={low ? 'low' : ''}>{total === 0 ? '–' : `${value.toFixed(1)}%`}</span>
      <div className="bar" aria-hidden="true">
        <i className={low ? 'low' : ''} style={{ width: `${total === 0 ? 0 : value}%` }} />
      </div>
    </div>
  );
}

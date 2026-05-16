export default function MetricCard({ title, value, suffix = "%", index = 0 }) {
  return (
    <article
      className="profile-metric-card"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="profile-metric-card__glow" />
      <p className="profile-metric-card__label">{title}</p>
      <div className="profile-metric-card__value-row">
        <h3>{value}</h3>
        <span>{suffix}</span>
      </div>
      <div className="profile-metric-card__bar">
        <span style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </article>
  );
}

export default function DashboardPanel({
  title,
  subtitle,
  items,
  accent = "violet",
  onSelect,
}) {
  return (
    <section className={`profile-dashboard-panel glass-card accent-${accent}`}>
      <div className="profile-card-header">
        <div>
          <p className="profile-eyebrow">{subtitle}</p>
          <h3>{title}</h3>
        </div>
        <span className="profile-chip">{items.length}</span>
      </div>

      <div className="profile-panel-list">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="profile-panel-item"
            onClick={() => item.clickable && onSelect?.(item)}
            disabled={!item.clickable}
          >
            <div className="profile-panel-item__meta">
              <div>
                <h4>{item.title}</h4>
                <p>{item.subtitle}</p>
              </div>
              <span className="profile-status-pill">{item.status}</span>
            </div>

            <div className="profile-panel-item__footer">
              <div className="profile-progress-bar">
                <span style={{ width: `${Math.min(100, item.progress)}%` }} />
              </div>
              <div className="profile-panel-item__stats">
                <small>{item.updated_at || "Fresh"}</small>
                <strong>{item.count}</strong>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

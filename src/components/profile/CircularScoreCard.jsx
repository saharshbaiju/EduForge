const CIRCUMFERENCE = 2 * Math.PI * 52;

export default function CircularScoreCard({ score }) {
  const clampedScore = Math.max(0, Math.min(100, score || 0));
  const dashOffset = CIRCUMFERENCE - (clampedScore / 100) * CIRCUMFERENCE;

  return (
    <section className="profile-score-card glass-card">
      <div className="profile-card-header">
        <div>
          <p className="profile-eyebrow">Overall score</p>
          <h3>Learning Pulse</h3>
        </div>
        <span className="profile-chip">Live</span>
      </div>

      <div className="profile-score-ring">
        <svg viewBox="0 0 140 140" aria-hidden="true">
          <defs>
            <linearGradient id="profileScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c5cff" />
              <stop offset="55%" stopColor="#5a8cff" />
              <stop offset="100%" stopColor="#1ee7ff" />
            </linearGradient>
          </defs>
          <circle cx="70" cy="70" r="52" className="profile-score-ring__track" />
          <circle
            cx="70"
            cy="70"
            r="52"
            className="profile-score-ring__progress"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="profile-score-ring__content">
          <span>Overall</span>
          <strong>{clampedScore}%</strong>
          <small>Elite learner tier</small>
        </div>
      </div>

      <p className="profile-score-card__caption">
        Your score blends consistency, note quality, completion rhythm, and problem-solving strength.
      </p>
    </section>
  );
}

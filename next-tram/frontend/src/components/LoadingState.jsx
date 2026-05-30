export default function LoadingState() {
  return (
    <div className="loading-state" role="status" aria-label="Loading departures">
      <div className="skeleton-featured glass-card">
        <div className="sk-line sk-line--short" />
        <div className="sk-timer" />
        <div className="sk-line sk-line--medium" />
        <div className="sk-line sk-line--wide" />
      </div>

      <div className="skeleton-list">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-card glass-card">
            <div className="sk-badge" />
            <div className="sk-content">
              <div className="sk-line sk-line--medium" />
              <div className="sk-line sk-line--short" />
            </div>
            <div className="sk-time" />
          </div>
        ))}
      </div>
    </div>
  )
}

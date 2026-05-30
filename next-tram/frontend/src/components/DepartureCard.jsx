import { useCountdown } from '../hooks/useCountdown.js'
import { delayLabel, delayClass } from '../utils/time.js'

// Color each line differently like the mockup
function lineBadgeStyle(line) {
  const name = (line || '').toUpperCase()
  if (name.includes('S1')) return { background: '#3b82f6' }
  if (name.includes('S2')) return { background: '#ef4444' }
  if (name.includes('S3')) return { background: '#22c55e' }
  if (name.includes('S4')) return { background: '#f59e0b' }
  if (name.includes('S5')) return { background: '#8b5cf6' }
  return { background: '#3b82f6' }
}

export default function DepartureCard({ departure, index }) {
  const { relative } = useCountdown(departure.departureISO)
  const statusClass = delayClass(departure.delay, departure.cancelled)
  const badgeStyle = lineBadgeStyle(departure.line)

  return (
    <article
      className={`dep-card glass-card ${departure.cancelled ? 'dep-card--cancelled' : ''}`}
      aria-label={`Departure ${index + 1}: ${departure.line} at ${departure.departure}`}
    >
      <div className="dep-card-line-badge" style={badgeStyle}>
        {departure.line || '?'}
      </div>

      <div className="dep-card-time">
        {departure.delay > 0 && departure.departure !== departure.departureActual ? (
          <>
            <span className="dep-card-time-planned">{departure.departure}</span>
            <span className="dep-card-time-actual">{departure.departureActual}</span>
          </>
        ) : (
          <span>{departure.departureActual || departure.departure}</span>
        )}
      </div>

      {!departure.cancelled && relative && (
        <div className={`dep-card-relative ${statusClass}`}>{relative}</div>
      )}

      {departure.direction && (
        <div className="dep-card-direction">→ {departure.direction}</div>
      )}

      {departure.platform && (
        <div className="dep-card-platform">Platform {departure.platform}</div>
      )}

      <div className="dep-card-footer">
        {departure.delay > 0 && !departure.cancelled && (
          <span className="dep-card-delay">+{departure.delay} min</span>
        )}
        <span className={`dep-card-status ${statusClass}`}>
          {delayLabel(departure.delay, departure.cancelled)}
        </span>
      </div>
    </article>
  )
}

import { useCountdown } from '../hooks/useCountdown.js'
import { delayLabel, delayClass } from '../utils/time.js'

export default function NextDeparture({ departure }) {
  const { relative } = useCountdown(departure?.departureISO)

  if (!departure) return null

  const { line, departure: depTime, departureActual, arrival, delay, arrivalDelay, cancelled, remarks, platform } = departure
  const statusClass = delayClass(delay, cancelled)

  return (
    <section className="next-departure-card glass-card" aria-label="Next departure">
      <div className="next-card-title">Next Tram</div>
      <div className="nd-header">
        <div className="nd-line-badge">{line || 'S1'}</div>
        <div className={`nd-status-badge ${statusClass}`}>
          {delayLabel(delay, cancelled)}
        </div>
      </div>

      <div className="nd-countdown" aria-live="polite" aria-label={`Departure in ${relative}`}>
        {cancelled ? (
            <span className="nd-countdown-text cancelled-text">Cancelled</span>
        ) : relative ? (
          <>
            <span className="nd-relative-large">{relative}</span>
            <span className="nd-countdown-timer">{departureActual || depTime}</span>
          </>
        ) : (
          <span className="nd-countdown-text">Departed</span>
        )}
      </div>

      <div className="nd-times">
        <div className="nd-time-block">
          <span className="nd-time-label">Departs</span>
          <span className="nd-time-value">
            {delay > 0 && depTime !== departureActual ? (
              <>
                <span className="time-planned">{depTime}</span>
                <span className="time-actual">{departureActual}</span>
              </>
            ) : (
              <span>{departureActual || depTime}</span>
            )}
          </span>
        </div>

      </div>

      <div className="nd-bottom-row">
        {platform && <span>Platform {platform}</span>}
        <span>{relative}</span>
      </div>

      {remarks.length > 0 && (
        <div className="nd-remarks">
          {remarks.map((r, i) => (
            <p key={i} className="remark-text">⚠ {r}</p>
          ))}
        </div>
      )}

    </section>
  )
}

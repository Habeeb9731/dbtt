import { useRef, useEffect } from 'react'
import WeatherIcon from './WeatherIcon.jsx'

function HourlyCard({ hourly, now }) {
  const currentHour = now.getHours()
  const scrollRef = useRef(null)
  const currentRef = useRef(null)

  useEffect(() => {
    if (currentRef.current && scrollRef.current) {
      const container = scrollRef.current
      const item = currentRef.current
      container.scrollLeft = item.offsetLeft - container.offsetWidth / 2 + item.offsetWidth / 2
    }
  }, [hourly])

  return (
    <div className="wp-card">
      <div className="wp-section-label">Hourly Weather</div>
      <div className="wp-hourly" ref={scrollRef}>
        {hourly.map((h, i) => {
          const isCurrent = h.hour === currentHour
          const label = isCurrent ? 'Now' : h.timeLabel
          return (
            <div
              key={i}
              ref={isCurrent ? currentRef : null}
              className={`wp-hourly-item${isCurrent ? ' wp-hourly-current' : ''}`}
            >
              <div className="wp-hourly-time">{label}</div>
              <WeatherIcon type={h.icon} size={isCurrent ? 28 : 22} />
              <div className="wp-hourly-temp">{h.temp}°</div>
              {h.prob > 20 && <div className="wp-hourly-prob">{h.prob}%</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function greeting(now) {
  const h = now.getHours()
  if (h < 12) return 'Good Morning'
  if (h < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export default function WeatherPanel({ weather, now, loading, onRefresh, onSettings }) {
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const [hhmm, ampm] = time.split(' ')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const date = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="wp-panel">

      {/* Greeting */}
      <div className="wp-card wp-greeting">
        <div className="wp-greeting-top">
          {weather && <WeatherIcon type={weather.icon} size={36} />}
          <div className="wp-greeting-text">
            <div className="wp-greeting-label">{greeting(now)},</div>
            <div className="wp-greeting-name">Habeeb</div>
          </div>
          <div className="wp-greeting-actions">
            <button className={`icon-btn refresh-btn ${loading ? 'spinning' : ''}`} onClick={onRefresh} disabled={loading} aria-label="Refresh">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
            <button className="icon-btn" onClick={onSettings} aria-label="Settings">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Clock */}
      <div className="wp-card wp-clock">
        <div className="wp-clock-label">Current Time</div>
        <div className="wp-clock-time">
          {hhmm}:{seconds} <span className="wp-clock-ampm">{ampm}</span>
        </div>
        <div className="wp-clock-date">{date}</div>
      </div>

      {/* Current conditions */}
      {weather && (
        <div className="wp-card wp-conditions">
          <div className="wp-cond-row">
            <div className="wp-cond-item">
              <div className="wp-cond-label">Avg Humidity</div>
              <div className="wp-cond-value">{weather.humidity ?? '—'}%</div>
            </div>
            <div className="wp-cond-item">
              <div className="wp-cond-label">Temperature</div>
              <div className="wp-cond-value">{weather.temperature}°C</div>
              <div className="wp-cond-sub">H:{weather.high}° · L:{weather.low}°</div>
            </div>
          </div>
          <div className="wp-cond-row">
            <div className="wp-cond-item">
              <div className="wp-cond-label">☀ Sunrise</div>
              <div className="wp-cond-value wp-cond-time">{weather.sunrise}</div>
            </div>
            <div className="wp-cond-item">
              <div className="wp-cond-label">☀ Sunset</div>
              <div className="wp-cond-value wp-cond-time">{weather.sunset}</div>
            </div>
          </div>
        </div>
      )}

      {/* Hourly forecast */}
      {weather?.hourly?.length > 0 && (
        <HourlyCard hourly={weather.hourly} now={now} />
      )}

      {/* 7-day forecast */}
      {weather?.daily?.length > 0 && (
        <div className="wp-card wp-card-grow">
          <div className="wp-section-label">Weather Forecast (14 Days)</div>
          <div className="wp-daily">
            {weather.daily.map((d, i) => (
              <div key={i} className="wp-daily-row">
                <div className="wp-daily-day">{d.label}</div>
                <WeatherIcon type={d.icon} size={18} />
                <div className="wp-daily-condition">{d.label2}</div>
                <div className="wp-daily-range">{d.low}° / {d.high}°</div>
                <div className="wp-daily-prob">💧 {d.precip}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

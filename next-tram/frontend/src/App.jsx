import { useState, useEffect } from 'react'
import { useSettings } from './hooks/useSettings.js'
import { useDepartures } from './hooks/useDepartures.js'
import { useWeather } from './hooks/useWeather.js'
import { useNotifications } from './hooks/useNotifications.js'
import DeparturesList from './components/DeparturesList.jsx'
import TimeCard from './components/TimeCard.jsx'
import WeatherIcon from './components/WeatherIcon.jsx'
import Settings from './components/Settings.jsx'
import LoadingState from './components/LoadingState.jsx'
import ErrorState from './components/ErrorState.jsx'

export default function App() {
  const { settings, update, addFavorite, removeFavorite } = useSettings()
  const [showSettings, setShowSettings] = useState(false)
  const [isOnline, setIsOnline] = useState(() => window.navigator?.onLine ?? true)
  const [now, setNow] = useState(() => new Date())
  const weather = useWeather()

  const { data, loading, error, lastUpdated, refresh } = useDepartures(
    settings.stopId, settings.destId, true
  )

  useNotifications(data?.departures, settings.notifyMinutesBefore, settings.notificationsEnabled)

  useEffect(() => {
    const on = () => setIsOnline(true), off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  useEffect(() => { if (isOnline) refresh() }, [isOnline]) // eslint-disable-line

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const departures = data?.departures ?? []
  const showFirstRun = !settings.stopId || settings.stopId === '710466'

  return (
    <>
      <div className="bg-gradient" aria-hidden="true" />
      <div className="app-container">
        <div className="hero-card">
          {/* Left: date + actions */}
          <div className="hero-card-left">
            <div className="hero-card-actions">
              <button className={`icon-btn refresh-btn ${loading ? 'spinning' : ''}`} onClick={refresh} disabled={loading} aria-label="Refresh">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </button>
              <button className="icon-btn" onClick={() => setShowSettings(true)} aria-label="Settings">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
            </div>
            <div className="hero-date">
              <div>{now.toLocaleDateString('en-GB', { weekday: 'long' })}</div>
              <div>{now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
          {/* Center: time */}
          <div className="hero-card-center">
            <TimeCard now={now} />
          </div>
          {/* Right: weather inline */}
          <div className="hero-card-right">
            {weather && (
              <div className="hero-weather">
                <WeatherIcon type={weather.icon} size={40} />
                <div className="hero-weather-info">
                  <div className="hero-weather-temp">{weather.temperature}°</div>
                  <div className="hero-weather-label">{weather.label}</div>
                  {weather.high != null && (
                    <div className="hero-weather-range">H:{weather.high}° · L:{weather.low}°</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <main className="main-content">
          {!isOnline && <div className="offline-banner">Offline — showing cached data</div>}

          {showFirstRun && !loading && (
            <div className="first-run-banner glass-card">
              <h2>Welcome to Next Tram 🚋</h2>
              <p>Set your home stop to get started.</p>
              <button className="save-btn" onClick={() => setShowSettings(true)}>Configure my stop</button>
            </div>
          )}

          {loading && !data && <LoadingState />}
          {error && !data && <ErrorState message={error} onRetry={refresh} isOffline={!isOnline} />}
          {data && <DeparturesList departures={departures} />}
        </main>


      </div>

      {showSettings && (
        <Settings settings={settings} onUpdate={update} onAddFavorite={addFavorite}
          onRemoveFavorite={removeFavorite} onClose={() => setShowSettings(false)} />
      )}
    </>
  )
}

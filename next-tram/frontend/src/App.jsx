import { useState, useEffect } from 'react'
import { useSettings } from './hooks/useSettings.js'
import { useDepartures } from './hooks/useDepartures.js'
import { useWeather } from './hooks/useWeather.js'
import { useNotifications } from './hooks/useNotifications.js'
import DeparturesList from './components/DeparturesList.jsx'
import WeatherPanel from './components/WeatherPanel.jsx'
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
      <div className="dashboard-layout">

        {/* Left: Weather Panel */}
        <aside className="dashboard-left">
          <WeatherPanel
            weather={weather}
            now={now}
            loading={loading}
            onRefresh={refresh}
            onSettings={() => setShowSettings(true)}
          />
        </aside>

        {/* Right: Tram info */}
        <main className="dashboard-right">

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

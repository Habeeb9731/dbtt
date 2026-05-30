import { useState } from 'react'
import StopSearch from './StopSearch.jsx'
import { useNotifications } from '../hooks/useNotifications.js'

export default function Settings({ settings, onUpdate, onAddFavorite, onRemoveFavorite, onClose }) {
  const [saved, setSaved] = useState(false)
  const { requestPermission, permission } = useNotifications([], settings.notifyMinutesBefore, false)

  const handleStopSelect = (stop) => {
    onUpdate({ stopId: stop.id, stopName: stop.name })
  }

  const handleDestSelect = (stop) => {
    onUpdate({ destId: stop.id, destName: stop.name })
  }

  const handleNotificationToggle = async () => {
    if (!settings.notificationsEnabled) {
      const perm = await requestPermission()
      if (perm !== 'granted') {
        alert('Please allow notifications in your browser settings.')
        return
      }
    }
    onUpdate({ notificationsEnabled: !settings.notificationsEnabled })
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 600)
  }

  return (
    <div className="settings-overlay" role="dialog" aria-modal="true" aria-label="Settings">
      <div className="settings-panel glass-card">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="settings-body">
          {/* Home stop */}
          <section className="settings-section">
            <h3 className="settings-section-title">Home Stop</h3>
            <StopSearch
              label="Your departure stop"
              value={settings.stopName}
              onSelect={handleStopSelect}
              placeholder="Search Saarbahn stop…"
            />
            {settings.stopId && (
              <p className="settings-hint">ID: {settings.stopId}</p>
            )}
          </section>

          {/* Destination */}
          <section className="settings-section">
            <h3 className="settings-section-title">Destination</h3>
            <StopSearch
              label="Destination stop"
              value={settings.destName}
              onSelect={handleDestSelect}
              placeholder="Search destination…"
            />
          </section>

          {/* Favorites */}
          {settings.favoriteStops.length > 0 && (
            <section className="settings-section">
              <h3 className="settings-section-title">Favorite Stops</h3>
              <ul className="favorites-list">
                {settings.favoriteStops.map(stop => (
                  <li key={stop.id} className="favorite-item">
                    <button
                      className="favorite-select"
                      onClick={() => onUpdate({ stopId: stop.id, stopName: stop.name })}
                    >
                      {stop.name}
                    </button>
                    <button
                      className="favorite-remove"
                      onClick={() => onRemoveFavorite(stop.id)}
                      aria-label={`Remove ${stop.name} from favorites`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Notifications */}
          <section className="settings-section">
            <h3 className="settings-section-title">Notifications</h3>
            <label className="toggle-row">
              <span>Notify before departure</span>
              <div
                className={`toggle ${settings.notificationsEnabled ? 'toggle--on' : ''}`}
                role="switch"
                aria-checked={settings.notificationsEnabled}
                tabIndex={0}
                onClick={handleNotificationToggle}
                onKeyDown={(e) => e.key === 'Enter' && handleNotificationToggle()}
              >
                <div className="toggle-thumb" />
              </div>
            </label>
            {settings.notificationsEnabled && (
              <label className="settings-field">
                <span className="input-label">Minutes before departure</span>
                <input
                  type="number"
                  className="settings-input"
                  min={1}
                  max={30}
                  value={settings.notifyMinutesBefore}
                  onChange={(e) => onUpdate({ notifyMinutesBefore: Number(e.target.value) })}
                />
              </label>
            )}
            {permission === 'denied' && (
              <p className="settings-hint settings-hint--warn">
                Notifications are blocked. Enable them in browser settings.
              </p>
            )}
          </section>

          {/* Appearance */}
          <section className="settings-section">
            <h3 className="settings-section-title">Appearance</h3>
            <label className="toggle-row">
              <span>Dark mode</span>
              <div
                className={`toggle ${settings.darkMode ? 'toggle--on' : ''}`}
                role="switch"
                aria-checked={settings.darkMode}
                tabIndex={0}
                onClick={() => onUpdate({ darkMode: !settings.darkMode })}
                onKeyDown={(e) => e.key === 'Enter' && onUpdate({ darkMode: !settings.darkMode })}
              >
                <div className="toggle-thumb" />
              </div>
            </label>
          </section>
        </div>

        <div className="settings-footer">
          <button className={`save-btn ${saved ? 'save-btn--saved' : ''}`} onClick={handleSave}>
            {saved ? '✓ Saved' : 'Save & Close'}
          </button>
        </div>
      </div>
    </div>
  )
}

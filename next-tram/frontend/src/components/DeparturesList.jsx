import { useCountdown } from '../hooks/useCountdown.js'
import { delayLabel, delayClass, to12hr } from '../utils/time.js'
import { useState, useEffect, useRef } from 'react'

let audioCtx = null
const audioBuffers = {}
const globalNotifiedTrips = new Set() // tracks tripIds that already had sound played

async function loadSound(file = 'notify.wav') {
  if (audioBuffers[file]) return audioBuffers[file]
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)()
  const res = await fetch(`/${file}`)
  const arr = await res.arrayBuffer()
  audioBuffers[file] = await audioCtx.decodeAudioData(arr)
  return audioBuffers[file]
}

function playSound(file = 'notify.wav') {
  if (!audioCtx || !audioBuffers[file]) return
  const src = audioCtx.createBufferSource()
  src.buffer = audioBuffers[file]
  const gain = audioCtx.createGain()
  gain.gain.value = 3.0
  src.connect(gain)
  gain.connect(audioCtx.destination)
  src.start(0)
}

function BellButton({ departureISO, active, onToggle, cancelled }) {
  const [ringing, setRinging] = useState(false)
  const notifiedRef = useRef(false)
  const cancelNotifiedRef = useRef(false)
  const { countdown } = useCountdown(departureISO)
  const minutes = countdown ? parseInt(countdown.split(':')[0], 10) : null

  useEffect(() => {
    if (!active) { notifiedRef.current = false; cancelNotifiedRef.current = false; return }
    // Cancelled — play immediately
    if (cancelled && !cancelNotifiedRef.current) {
      cancelNotifiedRef.current = true
      setRinging(true)
      playSound('cancelled.wav')
      setTimeout(() => setRinging(false), 1000)
      return
    }
    // 3 minutes remaining
    if (minutes !== null && minutes <= 3 && minutes >= 0 && !globalNotifiedTrips.has(departureISO)) {
      globalNotifiedTrips.add(departureISO)
      notifiedRef.current = true
      setRinging(true)
      playSound('notify.wav')
      setTimeout(() => setRinging(false), 1000)
    }
  }, [active, minutes, cancelled])

  const handleClick = () => {
    loadSound('notify.wav').catch(() => {})
    loadSound('cancelled.wav').catch(() => {})
    onToggle()
  }

  return (
    <button
      className={`tt2-bell${active ? ' tt2-bell--active' : ''}${ringing ? ' tt2-bell--ringing' : ''}`}
      onClick={handleClick}
      title={active ? 'Notification on' : 'Notify me'}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    </button>
  )
}

const MAX_MINUTES = 30

function NextTramCard({ departure, notifyActive, onToggleNotify }) {
  const { countdown } = useCountdown(departure.departureISO)
  const minutes = countdown ? parseInt(countdown.split(':')[0], 10) : 0
  const seconds = countdown ? parseInt(countdown.split(':')[1], 10) : 0
  const cancelNotifiedRef = useRef(false)

  useEffect(() => {
    if (!notifyActive) { cancelNotifiedRef.current = false; return }
    if (departure?.cancelled && !cancelNotifiedRef.current) {
      cancelNotifiedRef.current = true
      playSound('cancelled.wav')
      return
    }
    const tripId = departure?.tripId
    if (minutes <= 3 && minutes >= 0 && countdown && !globalNotifiedTrips.has(tripId)) {
      globalNotifiedTrips.add(tripId)
      playSound('notify.wav')
    }
  }, [notifyActive, minutes, departure?.cancelled, countdown])
  const totalSeconds = minutes * 60 + seconds
  const progress = (1 - Math.min(totalSeconds / (MAX_MINUTES * 60), 1)) * 100
  const statusClass = delayClass(departure.delay, departure.cancelled)
  const depTime = departure.departureActual || departure.departure

  return (
    <div className="ntc2-card">
      {/* Left: label + identity */}
      <div className="ntc2-left">
        <div className="ntc2-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 16c0 1.1.9 2 2 2h1v2a1 1 0 0 0 2 0v-2h6v2a1 1 0 0 0 2 0v-2h1c1.1 0 2-.9 2-2V6c0-3-3-4-8-4S4 3 4 6v10zm7-11h2v1h-2V5zm-5 3h12v6H6V8zm2 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm8 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>
          NEXT TRAM
          <button className={`ntc2-notify-btn${notifyActive ? ' ntc2-notify-btn--on' : ''}`} onClick={() => { loadSound('notify.wav').catch(() => {}); loadSound('cancelled.wav').catch(() => {}); onToggleNotify() }} title={notifyActive ? 'Notification on (press 0)' : 'Notify me (press 0)'}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill={notifyActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {notifyActive ? 'ON' : 'OFF'}
          </button>
        </div>
        <div className="ntc2-identity">
          <img src="/Logo_Saarbahn.png" alt="Saarbahn" className="ntc2-logo" />
          <span className="ntc2-direction">{departure.direction || ''}</span>
        </div>
      </div>

      {/* Center: arrives in */}
      <div className="ntc2-center">
        <div className="ntc2-arrives-label">ARRIVES IN</div>
        <div className="ntc2-num">
          {departure.cancelled ? 'X' : minutes > 0 ? String(minutes).padStart(2, '0') : String(seconds).padStart(2, '0')}
        </div>
        <div className="ntc2-min-label">{minutes > 0 ? 'MIN' : 'SEC'}</div>
      </div>

      {/* Right: departure time + status */}
      <div className="ntc2-right">
        <div className="ntc2-time-label">SCHEDULED</div>
        {departure.delay > 0 && departure.departure !== departure.departureActual ? (
          <div className="ntc2-deptime-wrap">
            <span className="ntc2-deptime-original">{to12hr(departure.departure)}</span>
            <div className="ntc2-deptime-big">{to12hr(departure.departureActual)}</div>
          </div>
        ) : (
          <div className="ntc2-deptime-big">{to12hr(depTime)}</div>
        )}
        <span className={`ntc2-status ${statusClass}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5.636 5.636a9 9 0 1 0 12.728 0"/><path d="M9.172 9.172a4 4 0 1 0 5.656 0"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></svg>
          {delayLabel(departure.delay, departure.cancelled)}
        </span>
      </div>

      {/* Stop times row */}
      {(departure.johanneskirche || departure.landwehrplatz || departure.arrival) && (
        <div className="ntc2-stops">
          {departure.landwehrplatz && (
            <div className="ntc2-stop-item">
              <div className="ntc2-stop-label">Landwehrplatz</div>
              <div className="ntc2-stop-time">{to12hr(departure.landwehrplatz)}</div>
            </div>
          )}
          {departure.johanneskirche && (
            <div className="ntc2-stop-item">
              <div className="ntc2-stop-label">Johanneskirche</div>
              <div className="ntc2-stop-time">{to12hr(departure.johanneskirche)}</div>
            </div>
          )}
          {departure.arrival && (
            <div className="ntc2-stop-item">
              <div className="ntc2-stop-label">Hbf</div>
              <div className="ntc2-stop-time">{to12hr(departure.arrival)}</div>
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="ntc2-progress-track">
        <div className="ntc2-progress-bar" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

function TimetableRow({ departure, index, active, onToggle }) {
  const { countdown, relative } = useCountdown(departure.departureISO)
  const mins = countdown ? parseInt(countdown.split(':')[0], 10) : null
  const statusClass = delayClass(departure.delay, departure.cancelled)

  return (
    <tr className={`tt2-row ${departure.cancelled ? 'tt2-row--cancelled' : ''}${active ? ' tt2-row--alerted' : ''}`}>
      <td className="tt2-serial">{index + 1}</td>
      <td className="tt2-bell-cell">
        <BellButton departureISO={departure.departureISO} active={active} onToggle={onToggle} cancelled={departure.cancelled} />
      </td>
      <td className="tt2-line">
        <img src="/Logo_Saarbahn.png" alt="Saarbahn" className="tt2-logo" />
      </td>
      <td className="tt2-time">
        {departure.delay > 0 && departure.departure !== departure.departureActual ? (
          <><span className="tt2-time-planned">{to12hr(departure.departure)}</span> <span className="tt2-time-actual">{to12hr(departure.departureActual)}</span></>
        ) : (
          <span className="tt2-time-val">{to12hr(departure.departureActual || departure.departure)}</span>
        )}
      </td>
      <td className="tt2-arrow">→</td>
      <td className="tt2-in">
        {!departure.cancelled && mins !== null && (
          <span className="tt2-rel-num">{mins}</span>
        )}
        {!departure.cancelled && mins === null && relative && (
          <span className="tt2-rel-label">{relative}</span>
        )}
      </td>
      <td className="tt2-direction">{departure.direction || '—'}</td>
      <td className="tt2-stop-time">{departure.landwehrplatz ? to12hr(departure.landwehrplatz) : '—'}</td>
      <td className="tt2-stop-time">{departure.johanneskirche ? to12hr(departure.johanneskirche) : '—'}</td>
      <td className="tt2-stop-time">{departure.arrival ? to12hr(departure.arrival) : '—'}</td>
      <td className="tt2-status">
        <span className={`tt2-status-text ${statusClass}`}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5.636 5.636a9 9 0 1 0 12.728 0"/><path d="M9.172 9.172a4 4 0 1 0 5.656 0"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></svg>
          {delayLabel(departure.delay, departure.cancelled)}
          {departure.delay > 0 && !departure.cancelled && ` (+${departure.delay}m)`}
        </span>
      </td>
    </tr>
  )
}

export default function DeparturesList({ departures }) {
  // Compute next/rest BEFORE hooks to avoid temporal dead zone
  const now = new Date()
  const sorted = departures?.length
    ? [...departures].sort((a, b) => new Date(a.departureISO) - new Date(b.departureISO))
    : []
  const future = sorted.filter(d => new Date(d.departureISO) >= now)
  const nextIdx = future.findIndex(d => !d.cancelled)
  const next = nextIdx >= 0 ? future[nextIdx] : future[0]
  const rest = future.filter((_, i) => i !== (nextIdx >= 0 ? nextIdx : 0))

  const [activeAlerts, setActiveAlerts] = useState({})
  const [nextAlert, setNextAlert] = useState(false)
  const restRef = useRef([])
  restRef.current = rest

  useEffect(() => {
    const handleKey = (e) => {
      const num = parseInt(e.key, 10)
      if (!isNaN(num)) {
        loadSound('notify.wav').catch(() => {})
        loadSound('cancelled.wav').catch(() => {})
        if (num === 0) setNextAlert(v => !v)
        else if (num >= 1 && num <= 9) {
          const dep = restRef.current[num - 1]
          if (dep?.tripId) setActiveAlerts(prev => ({ ...prev, [dep.tripId]: !prev[dep.tripId] }))
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Transfer alert when tram advances to main card; reset if new tram had no row alert
  useEffect(() => {
    if (!next?.tripId) return
    if (activeAlerts[next.tripId]) {
      setNextAlert(true)
      setActiveAlerts(prev => { const n = {...prev}; delete n[next.tripId]; return n })
    } else {
      setNextAlert(false)
    }
  }, [next?.tripId])

  if (!departures?.length) return <div className="empty-state"><p>No departures found.</p></div>
  if (!next) return <div className="empty-state"><p>No upcoming departures.</p></div>

  return (
    <>
      <NextTramCard departure={next} notifyActive={nextAlert} onToggleNotify={() => setNextAlert(v => !v)} />
      {rest.length > 0 && (
        <div className="tt2-wrap">
          <div className="tt2-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            UPCOMING DEPARTURES
          </div>
          <table className="tt2-table">
            <thead>
              <tr>
                <th>#</th>
                <th></th>
                <th>LINE</th>
                <th>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display:'inline',marginRight:5,verticalAlign:'middle'}}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  DEPARTURE
                </th>
                <th>→</th>
                <th>MIN</th>
                <th>DIRECTION</th>
                <th>LANDWEHRPLATZ</th>
                <th>JOHANNESKIRCHE</th>
                <th>HBF</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((dep, i) => (
                <TimetableRow
                  key={dep.tripId ?? i}
                  departure={dep}
                  index={i}
                  active={!!activeAlerts[dep.tripId]}
                  onToggle={() => setActiveAlerts(prev => ({ ...prev, [dep.tripId]: !prev[dep.tripId] }))}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

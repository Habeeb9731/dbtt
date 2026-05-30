// Returns "mm:ss" countdown string, or null if departureISO is in the past.
export function getCountdown(departureISO) {
  if (!departureISO) return null
  const diff = new Date(departureISO) - Date.now()
  if (diff <= 0) return null
  const totalSec = Math.floor(diff / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// Returns a human-friendly relative string: "in 2 min", "now", "1 min ago"
export function relativeTime(departureISO) {
  if (!departureISO) return ''
  const diffSec = Math.round((new Date(departureISO) - Date.now()) / 1000)
  if (Math.abs(diffSec) < 30) return 'now'
  const diffMin = Math.round(diffSec / 60)
  if (diffMin > 0) return `in ${diffMin} min`
  return `${Math.abs(diffMin)} min ago`
}

// Returns "HH:MM" for a JS Date or ISO string
export function toHHMM(value, tz = 'Europe/Berlin') {
  if (!value) return '–'
  const d = typeof value === 'string' ? new Date(value) : value
  if (isNaN(d)) return '–'
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: tz })
}

// Returns delay badge label: "+2 min", "On time", or "" if unknown
export function delayLabel(delayMinutes, cancelled) {
  if (cancelled) return 'Cancelled'
  if (!delayMinutes && delayMinutes !== 0) return ''
  if (delayMinutes === 0) return 'On time'
  if (delayMinutes > 0) return `+${delayMinutes} min`
  return `${delayMinutes} min`
}

// Returns a CSS class name based on delay severity
export function delayClass(delayMinutes, cancelled) {
  if (cancelled) return 'status-cancelled'
  if (!delayMinutes || delayMinutes <= 0) return 'status-ontime'
  if (delayMinutes <= 2) return 'status-minor'
  return 'status-delayed'
}

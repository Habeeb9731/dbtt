import { useEffect, useRef, useCallback } from 'react'

// Schedules browser push notifications N minutes before each departure.
export function useNotifications(departures, minutesBefore = 5, enabled = false) {
  const scheduledRef = useRef(new Set())
  const timersRef = useRef([])

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'unsupported'
    if (Notification.permission === 'granted') return 'granted'
    const result = await Notification.requestPermission()
    return result
  }, [])

  useEffect(() => {
    if (!enabled || !departures?.length) return
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    // Clear previous timers
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    departures.forEach(dep => {
      if (!dep.departureISO || dep.cancelled || scheduledRef.current.has(dep.tripId)) return

      const depTime = new Date(dep.departureISO)
      const notifyAt = depTime.getTime() - minutesBefore * 60_000
      const delay = notifyAt - Date.now()

      if (delay <= 0 || delay > 2 * 60 * 60_000) return  // skip past or >2h future

      scheduledRef.current.add(dep.tripId)

      const id = setTimeout(() => {
        scheduledRef.current.delete(dep.tripId)
        new Notification(`🚋 Tram ${dep.line} in ${minutesBefore} min`, {
          body: `→ ${dep.direction}  |  Departure ${dep.departureActual ?? dep.departure}`,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: dep.tripId,
          renotify: false,
          silent: false,
        })
      }, delay)

      timersRef.current.push(id)
    })

    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [departures, minutesBefore, enabled])

  return { requestPermission, permission: typeof window !== 'undefined' ? Notification.permission : 'default' }
}

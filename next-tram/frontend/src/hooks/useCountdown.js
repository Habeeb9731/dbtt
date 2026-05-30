import { useState, useEffect } from 'react'
import { getCountdown, relativeTime } from '../utils/time.js'

// Re-renders every second while a departure ISO timestamp is upcoming.
export function useCountdown(departureISO) {
  const [countdown, setCountdown] = useState(() => getCountdown(departureISO))
  const [relative, setRelative] = useState(() => relativeTime(departureISO))

  useEffect(() => {
    if (!departureISO) return

    const tick = () => {
      setCountdown(getCountdown(departureISO))
      setRelative(relativeTime(departureISO))
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [departureISO])

  return { countdown, relative }
}

import { useState, useEffect, useCallback, useRef } from 'react'

const REFRESH_INTERVAL_MS = 30_000

export function useDepartures(stopId, destId, autoRefresh = true) {
  const [data, setData] = useState(null)        // { stop, updated, departures }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const timerRef = useRef(null)
  const abortRef = useRef(null)

  const fetch = useCallback(async () => {
    if (!stopId) return

    // Cancel any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ stopId, results: 10 })
      if (destId) params.set('destId', destId)

      const res = await window.fetch(`/api/departures?${params}`, {
        signal: controller.signal,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }

      const json = await res.json()
      setData(json)
      setLastUpdated(new Date())
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message ?? 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [stopId, destId])

  // Initial fetch + auto-refresh
  useEffect(() => {
    fetch()

    if (autoRefresh) {
      timerRef.current = setInterval(fetch, REFRESH_INTERVAL_MS)
    }

    return () => {
      clearInterval(timerRef.current)
      abortRef.current?.abort()
    }
  }, [fetch, autoRefresh])

  return { data, loading, error, lastUpdated, refresh: fetch }
}

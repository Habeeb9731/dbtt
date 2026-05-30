import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'next-tram-settings'

const DEFAULTS = {
  stopId: '8001135',         // Saarbahn Brebach — user should change via Settings
  stopName: 'Brebach Bf, Saarbrücken',
  destId: '8000323',
  destName: 'Saarbrücken Hbf',
  darkMode: window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true,
  notificationsEnabled: false,
  notifyMinutesBefore: 5,
  favoriteStops: [],
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const settings = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
    if (settings.stopId === '710466') {
      return {
        ...settings,
        stopId: DEFAULTS.stopId,
        stopName: DEFAULTS.stopName,
      }
    }
    return settings
  } catch {
    return { ...DEFAULTS }
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(load)

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch { /* storage full */ }
  }, [settings])

  // Apply dark/light mode to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light')
  }, [settings.darkMode])

  const update = useCallback((patch) => {
    setSettings(prev => ({ ...prev, ...patch }))
  }, [])

  const addFavorite = useCallback((stop) => {
    setSettings(prev => {
      if (prev.favoriteStops.some(s => s.id === stop.id)) return prev
      return { ...prev, favoriteStops: [...prev.favoriteStops, stop] }
    })
  }, [])

  const removeFavorite = useCallback((stopId) => {
    setSettings(prev => ({
      ...prev,
      favoriteStops: prev.favoriteStops.filter(s => s.id !== stopId),
    }))
  }, [])

  return { settings, update, addFavorite, removeFavorite }
}

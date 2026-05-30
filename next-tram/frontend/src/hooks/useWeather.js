import { useEffect, useState } from 'react'

const SAARBRUECKEN = {
  latitude: 49.2402,
  longitude: 6.9969,
}

function weatherLabel(code) {
  if (code === 0) return 'Clear'
  if ([1, 2].includes(code)) return 'Partly cloudy'
  if (code === 3) return 'Cloudy'
  if ([45, 48].includes(code)) return 'Fog'
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow'
  if ([95, 96, 99].includes(code)) return 'Thunderstorm'
  return 'Weather'
}

function weatherIcon(code) {
  if (code === 0) return 'sun'
  if ([1, 2].includes(code)) return 'partly'
  if ([3, 45, 48].includes(code)) return 'cloud'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow'
  if ([95, 96, 99].includes(code)) return 'storm'
  return 'rain'
}

export function useWeather() {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({
      latitude: SAARBRUECKEN.latitude,
      longitude: SAARBRUECKEN.longitude,
      current: 'temperature_2m,weather_code',
      daily: 'temperature_2m_max,temperature_2m_min',
      timezone: 'Europe/Berlin',
    })

    window.fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      signal: controller.signal,
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(json => {
        const code = json.current?.weather_code
        setWeather({
          temperature: Math.round(json.current?.temperature_2m),
          high: Math.round(json.daily?.temperature_2m_max?.[0]),
          low: Math.round(json.daily?.temperature_2m_min?.[0]),
          label: weatherLabel(code),
          icon: weatherIcon(code),
        })
      })
      .catch(err => {
        if (err.name !== 'AbortError') setWeather(null)
      })

    return () => controller.abort()
  }, [])

  return weather
}

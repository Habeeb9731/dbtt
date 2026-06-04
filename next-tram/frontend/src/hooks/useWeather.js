import { useEffect, useState } from 'react'

const SAARBRUECKEN = {
  latitude: 49.2402,
  longitude: 6.9969,
}

function weatherLabel(code) {
  if (code === 0) return 'Clear'
  if ([1, 2].includes(code)) return 'Partly Cloudy'
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

function fmtTime(isoStr) {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function useWeather() {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    let retries = 0
    const maxRetries = 3
    const controller = new AbortController()

    async function fetchWithRetry() {
      while (retries < maxRetries) {
        try {
          await doFetch()
          return
        } catch (err) {
          if (err.name === 'AbortError') return
          retries++
          if (retries < maxRetries) await new Promise(r => setTimeout(r, 2000 * retries))
        }
      }
    }

    fetchWithRetry()
    return () => controller.abort()

    async function doFetch() {
      const params = new URLSearchParams({
        latitude: SAARBRUECKEN.latitude,
        longitude: SAARBRUECKEN.longitude,
        current: 'temperature_2m,weather_code,relative_humidity_2m',
        hourly: 'temperature_2m,weather_code,precipitation_probability',
        daily: 'temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset,precipitation_probability_max',
        timezone: 'Europe/Berlin',
        forecast_days: '14',
      })

      const res = await window.fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
        signal: controller.signal,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()

      const code = json.current?.weather_code
      const now = new Date()
      const localDateStr = now.toLocaleDateString('sv-SE')
      const currentHour = String(now.getHours()).padStart(2, '0')
      const currentHourPrefix = `${localDateStr}T${currentHour}:`

      const hourlyTimes = json.hourly?.time ?? []
      const hourlyTemps = json.hourly?.temperature_2m ?? []
      const hourlyCodes = json.hourly?.weather_code ?? []
      const hourlyProb = json.hourly?.precipitation_probability ?? []

      let startIdx = hourlyTimes.findIndex(t => t.startsWith(currentHourPrefix))
      if (startIdx === -1) startIdx = 0

      const hourly = []
      for (let i = startIdx; i < hourlyTimes.length && hourly.length < 8; i++) {
        const t = new Date(hourlyTimes[i])
        hourly.push({
          hour: t.getHours(),
          timeLabel: t.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
          temp: Math.round(hourlyTemps[i]),
          icon: weatherIcon(hourlyCodes[i]),
          prob: hourlyProb[i] ?? 0,
        })
      }

      const dailyTimes = json.daily?.time ?? []
      const daily = dailyTimes.map((t, i) => ({
        label: i === 0 ? 'Today' : new Date(t + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        high: Math.round(json.daily.temperature_2m_max[i]),
        low: Math.round(json.daily.temperature_2m_min[i]),
        icon: weatherIcon(json.daily.weather_code[i]),
        label2: weatherLabel(json.daily.weather_code[i]),
        precip: json.daily.precipitation_probability_max[i] ?? 0,
      }))

      setWeather({
        temperature: Math.round(json.current?.temperature_2m),
        humidity: json.current?.relative_humidity_2m ?? null,
        high: Math.round(json.daily?.temperature_2m_max?.[0]),
        low: Math.round(json.daily?.temperature_2m_min?.[0]),
        label: weatherLabel(code),
        icon: weatherIcon(code),
        sunrise: fmtTime(json.daily?.sunrise?.[0]),
        sunset: fmtTime(json.daily?.sunset?.[0]),
        hourly,
        daily,
      })
    }

  }, [])

  return weather
}

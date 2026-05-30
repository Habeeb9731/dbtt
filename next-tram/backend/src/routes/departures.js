import { Router } from 'express'
import hafas from '../lib/hafas.js'

const router = Router()

const HBF_STOP_ID = process.env.HBF_STOP_ID ?? '8000323'
const HBF_RELATED_STOP_IDS = new Set([HBF_STOP_ID, '8000323', '10600'])
const LEGACY_STOP_IDS = {
  710466: '8001135',
}

// Normalise any Date-like value to a HH:MM string in Europe/Berlin timezone.
function toHHMM(value) {
  if (!value) return null
  const d = typeof value === 'string' ? new Date(value) : value
  if (isNaN(d)) return null
  return d.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Berlin',
  })
}

// Convert HAFAS delay (seconds) to whole minutes, defaulting to 0.
function delayMinutes(seconds) {
  if (!seconds || isNaN(seconds)) return 0
  return Math.round(seconds / 60)
}

// Search stopovers for an arrival at Saarbrücken Hbf.
function normaliseStopId(stopId) {
  return LEGACY_STOP_IDS[stopId] ?? stopId
}

function isHbfStop(stop) {
  const id = stop?.id ?? ''
  const name = (stop?.name ?? '').toLowerCase()
  return (
    HBF_RELATED_STOP_IDS.has(id) ||
    name.includes('saarbrücken hbf') ||
    name.includes('saarbrücken hauptbahnhof') ||
    name.includes('hauptbahnhof, saarbrücken')
  )
}

function findHbfArrival(stopovers, fromStopId) {
  if (!Array.isArray(stopovers)) return null
  const fromIndex = stopovers.findIndex(s => s.stop?.id === fromStopId)
  const downstreamStopovers = fromIndex >= 0 ? stopovers.slice(fromIndex + 1) : stopovers
  const match = downstreamStopovers.find(s => isHbfStop(s.stop))
  if (!match) return null
  return {
    arrival: toHHMM(match.arrival ?? match.plannedArrival),
    arrivalISO: match.arrival ?? match.plannedArrival ?? null,
    arrivalDelay: delayMinutes(match.arrivalDelay),
  }
}

async function loadTripStopovers(dep) {
  if (!dep.tripId) return null

  try {
    const { trip } = await hafas.trip(dep.tripId, {
      stopovers: true,
      remarks: true,
    })
    return trip?.stopovers ?? null
  } catch (err) {
    console.warn('[departures] trip stopovers unavailable:', err.message)
    return null
  }
}

function isSaarbahnDeparture(dep) {
  const lineName = dep.line?.name?.trim() ?? ''
  return dep.line?.productName === 'S' || /^S\s*\d+/i.test(lineName)
}

// GET /api/departures?stopId=710466&results=10&destId=8000323
router.get('/', async (req, res) => {
  const { stopId, results: rawResults, destId } = req.query

  if (!stopId) {
    return res.status(400).json({ error: 'stopId query parameter is required.' })
  }

  const results = Math.min(parseInt(rawResults) || 10, 30)
  const destinationId = destId ?? HBF_STOP_ID
  const sourceStopId = normaliseStopId(stopId)

  try {
    // Fetch stop name and departures in parallel.
    const [stopInfo, { departures: rawDeps }] = await Promise.all([
      hafas.stop(sourceStopId),
      hafas.departures(sourceStopId, {
        results,
        duration: 180,        // look 3 hours ahead
        remarks: true,
        products: {
          saarbahn: true,
        },
      }),
    ])

    const saarbahnDeps = rawDeps.filter(isSaarbahnDeparture)
    const tripStopovers = await Promise.all(saarbahnDeps.map(loadTripStopovers))

    const departures = saarbahnDeps.map((dep, index) => {
      const planned = dep.plannedWhen
      const actual = dep.when ?? dep.plannedWhen
      const hbf = findHbfArrival(dep.stopovers ?? tripStopovers[index], sourceStopId)

      const warnings = (dep.remarks ?? [])
        .filter(r => r.type === 'warning' || r.type === 'status')
        .slice(0, 3)
        .map(r => r.text ?? r.summary ?? '')
        .filter(Boolean)

      return {
        tripId: dep.tripId,
        line: dep.line?.name ?? dep.line?.fahrtNr ?? '?',
        mode: dep.line?.mode ?? 'unknown',
        product: dep.line?.product ?? 'unknown',
        direction: dep.direction ?? '',
        departure: toHHMM(planned),
        departureActual: toHHMM(actual),
        departureISO: actual ?? null,
        plannedISO: planned ?? null,
        delay: delayMinutes(dep.delay),
        cancelled: dep.cancelled ?? false,
        arrival: hbf?.arrival ?? null,
        arrivalISO: hbf?.arrivalISO ?? null,
        arrivalDelay: hbf?.arrivalDelay ?? 0,
        goesToHbf: hbf !== null,
        platform: dep.platform ?? dep.plannedPlatform ?? null,
        remarks: warnings,
      }
    })

    const sorted = destId ? departures.filter(d => d.goesToHbf) : departures

    res.json({
      stop: stopInfo.name,
      stopId: sourceStopId,
      destination: destinationId,
      updated: new Date().toISOString(),
      departures: sorted,
    })
  } catch (err) {
    console.error('[departures] error:', err.message)
    res.status(500).json({ error: 'Failed to fetch departures.', detail: err.message })
  }
})

export default router

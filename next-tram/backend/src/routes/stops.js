import { Router } from 'express'
import hafas from '../lib/hafas.js'

const router = Router()

// GET /api/stops/search?q=brebach
router.get('/search', async (req, res) => {
  const q = req.query.q?.trim()
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters.' })
  }

  try {
    const results = await hafas.locations(q, {
      results: 12,
      stops: true,
      addresses: false,
      poi: false,
    })

    const stops = results
      .filter(r => r.type === 'stop' || r.type === 'station')
      .map(stop => ({
        id: stop.id,
        name: stop.name,
        type: stop.type,
        products: stop.products ?? {},
        location: stop.location
          ? { lat: stop.location.latitude, lon: stop.location.longitude }
          : null,
      }))

    res.json({ stops })
  } catch (err) {
    console.error('[stops/search] error:', err.message)
    res.status(500).json({ error: 'Stop search failed.', detail: err.message })
  }
})

// GET /api/stops/:id — fetch single stop details
router.get('/:id', async (req, res) => {
  try {
    const stop = await hafas.stop(req.params.id)
    res.json({
      id: stop.id,
      name: stop.name,
      type: stop.type,
      products: stop.products ?? {},
    })
  } catch (err) {
    console.error('[stops/:id] error:', err.message)
    res.status(500).json({ error: 'Could not load stop.', detail: err.message })
  }
})

export default router

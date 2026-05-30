import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import departuresRouter from './routes/departures.js'
import stopsRouter from './routes/stops.js'

const app = express()
const PORT = process.env.PORT ?? 3001
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? '*'

app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())

// Disable X-Powered-By header
app.disable('x-powered-by')

// Routes
app.use('/api/departures', departuresRouter)
app.use('/api/stops', stopsRouter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() })
})

// 404 catch-all
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[unhandled]', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚋  Next Tram API  →  http://localhost:${PORT}`)
  console.log(`    /api/departures?stopId=<id>`)
  console.log(`    /api/stops/search?q=<name>`)
})

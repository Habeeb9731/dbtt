# 🚋 Next Tram

Real-time Saarbahn departures PWA — shows the next trams from your home stop to Saarbrücken Hauptbahnhof with live countdowns, delay info, and browser notifications.

## Features

| Feature | Detail |
|---------|--------|
| Live departures | hafas-client → DB HAFAS (covers Saarbahn S1) |
| Countdown timer | Ticking seconds until departure |
| Delay display | On-time / +N min / Cancelled with colour coding |
| Arrival time | Estimated arrival at Saarbrücken Hbf from stopovers |
| Auto-refresh | Every 30 seconds |
| PWA | Installable on Android & iOS, works offline (cached) |
| Dark / Light mode | System-aware default, manual toggle |
| Notifications | Browser push N minutes before departure |
| Settings | Stop search, favourites, persisted in localStorage |
| Glassmorphism UI | Responsive, mobile-first, smooth animations |

---

## Project structure

```
next-tram/
├── backend/                 Node.js + Express + hafas-client
│   ├── src/
│   │   ├── index.js         Express server entry point
│   │   ├── lib/hafas.js     HAFAS client (DB profile)
│   │   └── routes/
│   │       ├── departures.js  GET /api/departures
│   │       └── stops.js       GET /api/stops/search, /api/stops/:id
│   ├── .env.example
│   └── package.json
│
├── frontend/                React 18 + Vite 5 + vite-plugin-pwa
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── generate-icons.js  Icon generation helper
│   │   ├── _redirects         Netlify SPA routing
│   │   └── icons/             (generate with generate-icons.js)
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── NextDeparture.jsx
│   │   │   ├── DepartureCard.jsx
│   │   │   ├── DeparturesList.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── StopSearch.jsx
│   │   │   ├── LoadingState.jsx
│   │   │   └── ErrorState.jsx
│   │   ├── hooks/
│   │   │   ├── useDepartures.js
│   │   │   ├── useSettings.js
│   │   │   ├── useCountdown.js
│   │   │   └── useNotifications.js
│   │   ├── utils/time.js
│   │   └── styles/
│   │       ├── variables.css  Design tokens (dark/light)
│   │       └── App.css        Full stylesheet
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── vercel.json
├── netlify.toml
└── package.json             Workspace root
```

---

## Quick start

### 1. Install dependencies

```bash
cd next-tram

# Install all workspaces at once
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```
PORT=3001
CORS_ORIGIN=http://localhost:5173
DEFAULT_STOP_ID=710466       # Your home stop HAFAS ID
HBF_STOP_ID=8000323          # Saarbrücken Hauptbahnhof (keep as-is)
```

### 3. Find your home stop ID

Start the backend, then query the search endpoint:

```bash
cd backend && npm run dev
# In another terminal:
curl "http://localhost:3001/api/stops/search?q=brebach"
```

Copy the `id` from the matching result and set it in `.env` and also in the frontend default (`frontend/src/hooks/useSettings.js` → `DEFAULTS.stopId`).

Common Saarbahn stops and their HAFAS IDs:

| Stop | ID |
|------|----|
| Saarbrücken Hauptbahnhof | 8000323 |
| Saarbrücken Ost | 710467 |
| Brebach | 710466 |
| Güdingen | 710464 |
| Kleinblittersdorf | 710459 |
| Burbach | 710437 |
| Malstatt | 710441 |
| Lebach | 8002345 |

> **Note**: HAFAS stop IDs can vary. Always use `/api/stops/search?q=<name>` to find the correct ID for your stop.

### 4. Generate PWA icons

```bash
cd frontend
node --input-type=module public/generate-icons.js
# (requires: npm install sharp)
```

Or export `public/favicon.svg` manually to:
- `public/icons/icon-192.png` (192×192)
- `public/icons/icon-512.png` (512×512)
- `public/apple-touch-icon.png` (180×180)

### 5. Run in development

```bash
# From project root — starts both backend and frontend:
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

---

## API reference

### `GET /api/departures`

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `stopId`  | ✓ | — | HAFAS stop ID |
| `results` | — | 10 | Number of departures (max 30) |
| `destId`  | — | `8000323` | Destination stop ID to resolve arrival time |

**Response:**
```json
{
  "stop": "Brebach (Saarbahn)",
  "stopId": "710466",
  "destination": "8000323",
  "updated": "2024-01-15T08:05:00.000Z",
  "departures": [
    {
      "tripId": "...",
      "line": "S1",
      "direction": "Saarbrücken Hauptbahnhof",
      "departure": "08:12",
      "departureActual": "08:14",
      "departureISO": "2024-01-15T07:14:00.000Z",
      "delay": 2,
      "cancelled": false,
      "arrival": "08:23",
      "arrivalDelay": 2,
      "goesToHbf": true,
      "platform": null,
      "remarks": []
    }
  ]
}
```

### `GET /api/stops/search?q=<query>`

Returns up to 12 matching stops/stations.

```json
{
  "stops": [
    {
      "id": "710466",
      "name": "Brebach (Saarbahn)",
      "type": "stop",
      "products": { "tram": true, "suburban": true, "bus": false },
      "location": { "lat": 49.218, "lon": 7.056 }
    }
  ]
}
```

### `GET /api/stops/:id`

Returns a single stop by HAFAS ID.

### `GET /api/health`

Returns `{ "status": "ok", "ts": "..." }`.

---

## Deployment

### Option A — Vercel (full-stack, easiest)

```bash
npm i -g vercel
cd next-tram
vercel
```

Set environment variables in the Vercel dashboard:
- `PORT` → `3001`
- `CORS_ORIGIN` → your Vercel frontend URL

### Option B — Netlify (frontend) + Railway (backend)

**Backend on Railway:**
1. Create new project → "Deploy from GitHub"
2. Point to the `backend/` directory
3. Set env vars: `PORT=3001`, `CORS_ORIGIN=https://your-site.netlify.app`

**Frontend on Netlify:**
1. Build command: `npm run build` (in `frontend/`)
2. Publish directory: `frontend/dist`
3. Update `netlify.toml` proxy URL to your Railway backend URL

### Option C — Cloudflare Pages + Cloudflare Workers

```bash
# Build frontend
cd frontend && npm run build

# Deploy to Cloudflare Pages via wrangler
npx wrangler pages deploy dist --project-name next-tram
```

For the backend, deploy as a Cloudflare Worker or use the Workers AI/KV pattern (see Cloudflare docs).

### Option D — Self-hosted (VPS / Raspberry Pi)

```bash
# Build frontend
cd frontend && npm run build

# Start backend (serves built frontend too if you copy dist/)
cd backend && npm start

# Use nginx as reverse proxy:
# / → serve frontend/dist/
# /api → proxy_pass http://localhost:3001
```

Sample nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/next-tram/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## PWA installation

**Android (Chrome/Firefox):**
1. Open the app in Chrome
2. Tap the three-dot menu → "Add to Home screen"
3. The app installs and opens fullscreen like a native app

**iOS (Safari):**
1. Open the app in Safari
2. Tap the Share button → "Add to Home Screen"
3. The app installs with the tram icon

---

## Customisation

### Change default home stop

Edit `frontend/src/hooks/useSettings.js`:
```js
const DEFAULTS = {
  stopId: 'YOUR_STOP_ID',
  stopName: 'Your Stop Name',
  // ...
}
```

### Change destination

By default the app resolves arrival at Saarbrücken Hbf (`8000323`). Change `destId` / `destName` in the same `DEFAULTS` object, or use the Settings UI at runtime.

### Adjust auto-refresh interval

In `frontend/src/hooks/useDepartures.js`:
```js
const REFRESH_INTERVAL_MS = 30_000  // milliseconds
```

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, vite-plugin-pwa |
| Backend | Node.js ≥18, Express 4 |
| Transit data | hafas-client v6 (DB HAFAS profile) |
| Styling | Pure CSS — glassmorphism, CSS custom properties |
| PWA | Workbox (via vite-plugin-pwa), Web Push Notifications API |
| Storage | localStorage (settings), Workbox cache (offline) |
| Deployment | Vercel / Netlify / Railway / Cloudflare Pages |

---

## License

MIT

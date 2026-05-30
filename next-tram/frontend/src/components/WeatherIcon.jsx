export default function WeatherIcon({ type = 'partly', size = 48 }) {
  const s = size
  const props = { width: s, height: s, viewBox: '0 0 64 64', fill: 'none', style: { display: 'block' } }

  if (type === 'sun') return (
    <svg {...props}>
      <circle cx="32" cy="32" r="12" fill="#fbbf24" />
      {[0,45,90,135,180,225,270,315].map(a => (
        <line key={a}
          x1={32 + Math.cos(a*Math.PI/180)*17} y1={32 + Math.sin(a*Math.PI/180)*17}
          x2={32 + Math.cos(a*Math.PI/180)*23} y2={32 + Math.sin(a*Math.PI/180)*23}
          stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      ))}
    </svg>
  )

  if (type === 'partly') return (
    <svg {...props}>
      <circle cx="24" cy="26" r="10" fill="#fbbf24" />
      {[270,315,0,45,90].map(a => (
        <line key={a}
          x1={24 + Math.cos(a*Math.PI/180)*14} y1={26 + Math.sin(a*Math.PI/180)*14}
          x2={24 + Math.cos(a*Math.PI/180)*19} y2={26 + Math.sin(a*Math.PI/180)*19}
          stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      ))}
      <path d="M22 44h22a10 10 0 0 0 1-19.9A14 14 0 0 0 13 30a7.5 7.5 0 0 0 9 14z" fill="rgba(200 215 240 / 0.85)" />
    </svg>
  )

  if (type === 'cloud') return (
    <svg {...props}>
      <path d="M18 44h28a12 12 0 0 0 1.2-23.9A17 17 0 0 0 11 28a9 9 0 0 0 7 16z" fill="rgba(180 195 220 / 0.8)" />
    </svg>
  )

  if (type === 'rain') return (
    <svg {...props}>
      <path d="M16 36h28a11 11 0 0 0 1.1-21.9A15 15 0 0 0 10 22a8 8 0 0 0 6 14z" fill="rgba(160 185 220 / 0.8)" />
      {[[22,44],[32,48],[42,44],[27,52],[37,56]].map(([x,y],i) => (
        <line key={i} x1={x} y1={y} x2={x-3} y2={y+7} stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" />
      ))}
    </svg>
  )

  if (type === 'snow') return (
    <svg {...props}>
      <path d="M16 34h28a11 11 0 0 0 1.1-21.9A15 15 0 0 0 10 20a8 8 0 0 0 6 14z" fill="rgba(200 220 255 / 0.85)" />
      {[[22,44],[32,44],[42,44],[27,52],[37,52]].map(([x,y],i) => (
        <g key={i}>
          <line x1={x-4} y1={y} x2={x+4} y2={y} stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" />
          <line x1={x} y1={y-4} x2={x} y2={y+4} stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  )

  if (type === 'storm') return (
    <svg {...props}>
      <path d="M14 34h28a11 11 0 0 0 1.1-21.9A15 15 0 0 0 8 20a8 8 0 0 0 6 14z" fill="rgba(100 110 130 / 0.9)" />
      <polyline points="34,38 27,50 34,50 29,62 44,46 36,46 40,38" fill="#fde047" stroke="none" />
    </svg>
  )

  // fallback = rain
  return (
    <svg {...props}>
      <path d="M16 36h28a11 11 0 0 0 1.1-21.9A15 15 0 0 0 10 22a8 8 0 0 0 6 14z" fill="rgba(160 185 220 / 0.8)" />
      {[[22,44],[32,48],[42,44]].map(([x,y],i) => (
        <line key={i} x1={x} y1={y} x2={x-3} y2={y+7} stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" />
      ))}
    </svg>
  )
}

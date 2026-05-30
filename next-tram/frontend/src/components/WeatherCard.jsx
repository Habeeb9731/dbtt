// Weather scene images using CSS gradients — no external assets needed
function weatherScene(icon) {
  switch (icon) {
    case 'sun':
      return {
        bg: 'linear-gradient(180deg, #f97316 0%, #fbbf24 40%, #fde68a 70%, #1a0a00 100%)',
        scene: sunny,
      }
    case 'partly':
      return {
        bg: 'linear-gradient(180deg, #7dd3fc 0%, #bae6fd 50%, #1e3a5f 100%)',
        scene: partlyCloudy,
      }
    case 'cloud':
      return {
        bg: 'linear-gradient(180deg, #6b7280 0%, #9ca3af 40%, #d1d5db 70%, #1f2937 100%)',
        scene: cloudy,
      }
    case 'rain':
      return {
        bg: 'linear-gradient(180deg, #1e3a5f 0%, #2d5986 40%, #4a7fa5 70%, #0f1f30 100%)',
        scene: rainy,
      }
    case 'snow':
      return {
        bg: 'linear-gradient(180deg, #bfdbfe 0%, #dbeafe 50%, #1e3a5f 100%)',
        scene: snowy,
      }
    case 'storm':
      return {
        bg: 'linear-gradient(180deg, #1c1917 0%, #292524 30%, #57534e 70%, #0c0a09 100%)',
        scene: stormy,
      }
    default:
      return {
        bg: 'linear-gradient(180deg, #1e3a5f 0%, #2d5986 50%, #0f1f30 100%)',
        scene: rainy,
      }
  }
}

function sunny(id) {
  return (
    <svg key={id} viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
      {/* Sun */}
      <circle cx="150" cy="55" r="38" fill="rgba(255 220 100 / 0.95)" />
      <circle cx="150" cy="55" r="52" fill="rgba(255 200 50 / 0.2)" />
      <circle cx="150" cy="55" r="66" fill="rgba(255 180 0 / 0.08)" />
      {/* Rays */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => (
        <line key={a} x1={150+Math.cos(a*Math.PI/180)*58} y1={55+Math.sin(a*Math.PI/180)*58}
              x2={150+Math.cos(a*Math.PI/180)*72} y2={55+Math.sin(a*Math.PI/180)*72}
              stroke="rgba(255 200 50 / 0.6)" strokeWidth="2.5" strokeLinecap="round"/>
      ))}
      {/* Ground silhouette */}
      <ellipse cx="150" cy="168" rx="160" ry="28" fill="#1a0a00" opacity="0.9"/>
      {/* Trees */}
      <polygon points="60,140 75,100 90,140" fill="#0f0500" opacity="0.8"/>
      <polygon points="200,145 218,98 236,145" fill="#0f0500" opacity="0.8"/>
    </svg>
  )
}

function partlyCloudy(id) {
  return (
    <svg key={id} viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
      <circle cx="220" cy="50" r="30" fill="rgba(255 220 80 / 0.9)" />
      {/* Main cloud */}
      <ellipse cx="130" cy="70" rx="60" ry="28" fill="rgba(255 255 255 / 0.85)" />
      <circle cx="100" cy="66" r="24" fill="rgba(255 255 255 / 0.85)" />
      <circle cx="158" cy="60" r="20" fill="rgba(255 255 255 / 0.85)" />
      {/* Small cloud */}
      <ellipse cx="220" cy="98" rx="36" ry="17" fill="rgba(255 255 255 / 0.6)" />
      <circle cx="202" cy="94" r="14" fill="rgba(255 255 255 / 0.6)" />
      {/* Ground */}
      <ellipse cx="150" cy="168" rx="160" ry="26" fill="#1e3a5f" opacity="0.8"/>
    </svg>
  )
}

function cloudy(id) {
  return (
    <svg key={id} viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
      <ellipse cx="100" cy="72" rx="70" ry="30" fill="rgba(255 255 255 / 0.25)" />
      <circle cx="68" cy="66" r="28" fill="rgba(255 255 255 / 0.25)" />
      <circle cx="130" cy="58" r="24" fill="rgba(255 255 255 / 0.25)" />
      <ellipse cx="200" cy="88" rx="80" ry="34" fill="rgba(255 255 255 / 0.2)" />
      <circle cx="162" cy="82" r="30" fill="rgba(255 255 255 / 0.2)" />
      <circle cx="238" cy="76" r="26" fill="rgba(255 255 255 / 0.2)" />
      <ellipse cx="150" cy="168" rx="160" ry="26" fill="#1f2937" opacity="0.9"/>
    </svg>
  )
}

function rainy(id) {
  return (
    <svg key={id} viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
      {/* Cloud */}
      <ellipse cx="150" cy="60" rx="90" ry="36" fill="rgba(100 130 160 / 0.6)" />
      <circle cx="105" cy="54" r="34" fill="rgba(100 130 160 / 0.6)" />
      <circle cx="192" cy="48" r="28" fill="rgba(100 130 160 / 0.6)" />
      {/* Rain drops */}
      {[[80,95],[100,108],[120,100],[140,112],[160,96],[180,108],[200,100],[220,112],[105,125],[145,128],[185,122]].map(([x,y],i)=>(
        <line key={i} x1={x} y1={y} x2={x-4} y2={y+16} stroke="rgba(180 220 255 / 0.7)" strokeWidth="1.5" strokeLinecap="round"/>
      ))}
      {/* Ground puddle */}
      <ellipse cx="150" cy="168" rx="160" ry="22" fill="#0f1f30" opacity="0.95"/>
      <ellipse cx="110" cy="155" rx="28" ry="5" fill="rgba(100 160 220 / 0.3)" />
      <ellipse cx="200" cy="158" rx="20" ry="4" fill="rgba(100 160 220 / 0.3)" />
    </svg>
  )
}

function snowy(id) {
  return (
    <svg key={id} viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
      <ellipse cx="150" cy="60" rx="90" ry="34" fill="rgba(200 220 255 / 0.5)" />
      <circle cx="105" cy="54" r="32" fill="rgba(200 220 255 / 0.5)" />
      <circle cx="192" cy="48" r="26" fill="rgba(200 220 255 / 0.5)" />
      {[[70,95],[100,105],[130,98],[160,110],[190,100],[220,108],[85,122],[145,126],[200,120]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="3" fill="rgba(255 255 255 / 0.8)" />
      ))}
      <ellipse cx="150" cy="168" rx="160" ry="24" fill="rgba(220 235 255 / 0.9)"/>
    </svg>
  )
}

function stormy(id) {
  return (
    <svg key={id} viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
      <ellipse cx="150" cy="55" rx="110" ry="42" fill="rgba(50 50 60 / 0.85)" />
      <circle cx="90" cy="46" r="40" fill="rgba(50 50 60 / 0.85)" />
      <circle cx="205" cy="40" r="32" fill="rgba(50 50 60 / 0.85)" />
      {/* Lightning */}
      <polyline points="155,72 140,105 152,105 135,138" fill="none" stroke="rgba(255 240 80 / 0.95)" strokeWidth="3" strokeLinejoin="round"/>
      {[[75,90],[100,102],[195,95],[220,108]].map(([x,y],i)=>(
        <line key={i} x1={x} y1={y} x2={x-5} y2={y+18} stroke="rgba(150 180 220 / 0.6)" strokeWidth="1.5" strokeLinecap="round"/>
      ))}
      <ellipse cx="150" cy="168" rx="160" ry="22" fill="#0c0a09" opacity="0.95"/>
    </svg>
  )
}

export default function WeatherCard({ weather }) {
  if (!weather) return null
  const { bg, scene } = weatherScene(weather.icon)

  return (
    <div className="wcard">
      {/* Image area */}
      <div className="wcard-scene" style={{ background: bg }}>
        {scene(weather.icon)}
      </div>
      {/* Info area */}
      <div className="wcard-info">
        <div className="wcard-label">{weather.label}</div>
        <div className="wcard-temp">{weather.temperature}°C</div>
        {weather.high != null && (
          <div className="wcard-range">H:{weather.high}° · L:{weather.low}°</div>
        )}
      </div>
    </div>
  )
}

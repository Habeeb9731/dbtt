export default function TimeCard({ now }) {
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const [hhmm, ampm] = time.split(' ')

  return (
    <div className="tcard">
      <div className="tcard-time">
        {`${hhmm}:${seconds}`} <span className="tcard-ampm">{ampm}</span>
      </div>
    </div>
  )
}

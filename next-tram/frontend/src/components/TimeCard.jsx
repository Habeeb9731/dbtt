export default function TimeCard({ now }) {
  const time = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return (
    <div className="tcard">
      <div className="tcard-time">
        {`${time}:${seconds}`}
      </div>
    </div>
  )
}

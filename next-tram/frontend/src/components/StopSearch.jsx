import { useState, useCallback, useRef, useEffect } from 'react'

export default function StopSearch({ label, value, onSelect, placeholder = 'Search stop…' }) {
  const [query, setQuery] = useState(value ?? '')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)
  const abortRef = useRef(null)
  const wrapRef = useRef(null)

  const search = useCallback(async (q) => {
    if (q.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setSearching(true)

    try {
      const res = await fetch(`/api/stops/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
      const data = await res.json()
      setResults(data.stops ?? [])
      setOpen(true)
    } catch (err) {
      if (err.name !== 'AbortError') setResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  const handleChange = (e) => {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(q), 320)
  }

  const handleSelect = (stop) => {
    setQuery(stop.name)
    setOpen(false)
    setResults([])
    onSelect(stop)
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="stop-search" ref={wrapRef}>
      {label && <label className="input-label">{label}</label>}
      <div className="stop-search-input-wrap">
        <input
          type="search"
          className="stop-input"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          aria-label={label ?? placeholder}
          aria-expanded={open}
          aria-haspopup="listbox"
          role="combobox"
        />
        {searching && <div className="search-spinner" aria-hidden="true" />}
      </div>

      {open && results.length > 0 && (
        <ul className="stop-results" role="listbox" aria-label="Stop suggestions">
          {results.map(stop => (
            <li
              key={stop.id}
              role="option"
              className="stop-result-item"
              onClick={() => handleSelect(stop)}
              onKeyDown={(e) => e.key === 'Enter' && handleSelect(stop)}
              tabIndex={0}
            >
              <span className="sr-name">{stop.name}</span>
              <span className="sr-meta">
                {[stop.products?.tram && 'Tram', stop.products?.suburban && 'S-Bahn', stop.products?.bus && 'Bus']
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
